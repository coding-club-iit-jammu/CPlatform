import { Component, OnInit, ViewChild } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-coursehome',
  templateUrl: './coursehome.component.html',
  styleUrls: ['./coursehome.component.css']
})
export class CoursehomeComponent implements OnInit {

  constructor(
              private storeInfo: StoreInfoService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private formBuilder: FormBuilder,
              private matComp: MaterialComponentService
              ) { }

  view:number = 1;

  instructors:Array<String> =[];
  teachingAssistants:Array<String> =[];
  joiningCode = {};
  showSpinner:boolean = false;
  fetchingReport = false;
  report:any;
  reportKeys:any = [];
  code:string="";
  role:string;
  joiningCodes: Object = {
    instructor: '',
    teachingAssistant: '',
    student: ''
  }

  posts:Array<Object> = [];
  assignments:Array<Object> = [];
  tests:Array<Object> = [];

  postForm: FormGroup;
  assignmentForm: FormGroup;
  testForm: FormGroup;
  submitAssignmentForm: FormGroup;
  shiftDeadlineForm: FormGroup;
  uploadMarksForm: FormGroup;

  file:any;
  
  course : any ={
    title:"",
    instructors:[],
    teachingAssistants:[],
    posts:[],
    assignments:[],
    tests:[],
    _id:'',
    role:'',
    groupId:"",
    groups:[]
  };
  // assignments:any = [];
  selectedAssignment:number;
  assignmentCounts:number = 0;
  submissionPossible=true;
  time: Date;
  fileName:string;
  userType:string;
  instructor:boolean = false;
  marksUpload:any;
  assignmentDoc:any = null;

  mossLink:string = '';
  fetchingMoss: boolean = false;

  async ngOnInit() {
  
    this.showSpinner = true;

    this.resetPostForm();
    this.resetAssignmentForm();
    this.resetTestForm();
    this.resetSubmitAssignmentForm();
    this.resetShiftDeadlineForm();
    this.resetUploadMarksForm();

    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    let view = parseInt(this.activatedRoute.snapshot.paramMap.get('view'));
    
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
      return;
    }

    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getInfo', options).toPromise().then(data=>{
      if(data['status'] == 200){
        this.course = data['body'];
        if(this.course.role == 'instructor'){
          this.getJoiningCodes();
        }
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
      }
    },error => {
      alert(error.message)
    })

    this.showSpinner = false;

    if(!Number.isNaN(view)){
      this.setView(view);
      if(view < 1 || view > 4){
        this.setView(1);
      }
    } else {
      this.setView(1);
    }
  }

  changePage(p){
    this.router.navigateByUrl(`/course/${this.code}/${p}`);
  }

  startTest(testId,id){
    this.router.navigateByUrl(`/course/${this.code}/test/${testId}/${this.course.groupId}`);
  }
  
  async setView(tabvalue){
    this.view = tabvalue;
    if(tabvalue == 1){
      await this.getPosts();
    } else if(tabvalue == 2) {
      await this.getAssignments();
    } else if(tabvalue == 3){
      await this.getTests();
    } else if(tabvalue == 4){

    }
  }
  
  
  getJoiningCodes(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code)
    };
    
    this.http.get(this.storeInfo.serverUrl+'/course/getJoiningCodes', options).subscribe(data=>{
      if(data['status'] == 200){
        this.joiningCodes = data['body']['joiningCode'];
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    
  }

  downloadCSV(data){

    this.showSpinner = true;
    let dataType = data.type;
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
    downloadLink.target = "_blank";
    downloadLink.download = `${this.code.substring(8)}_Report.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    this.showSpinner = false;
  }

  async generateCSV(){
    const data = this.report;

    let csv = '';
    let header = Object.keys(data[0]).join(',');
    let values = data.map(o => Object.values(o).join(',')).join('\n');
    csv += header + '\n' + values;
    console.log(csv)
    this.downloadCSV(csv)
  }

  async getCombinedReport(){
    this.fetchingReport = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getCombinedReport', options).toPromise().then(data=>{
      if(data['status']==200){
        this.report = Object.values(data['body']);
        if(this.report[0]){
          this.reportKeys = Object.keys(this.report[0]).filter((e)=>{
            return e.trim()!='email' && e.trim()!='name' 
          });
        }
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.fetchingReport = false;
    
  }

  async createPost(data: Object){
    const options = {
      observe: 'response' as 'body'
    };
    data['courseCode'] = this.code;
    this.showSpinner = true;

    let formData = new FormData();
    formData.append('title',this.postForm.get('title').value);
    formData.append('description',this.postForm.get('description').value);
    formData.append('file',this.postForm.get('file').value);    
    formData.append('courseCode',this.code);    
    formData.append('audience',this.postForm.get('audience').value);    

    await this.http.post(this.storeInfo.serverUrl+'/course/addPost', formData, options).toPromise().then( async (resData) => {
      if(resData['status'] == 201){
        await this.getPosts();
        this.resetPostForm();
      } 
      this.matComp.openSnackBar(resData['body']['message'],2000);
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  resetPostForm(){
    this.postForm = this.formBuilder.group({
      title: this.formBuilder.control('',Validators.required),
      description: this.formBuilder.control('',Validators.required),
      file:this.formBuilder.control(null),
      audience: this.formBuilder.control([])
    })
  }

  resetUploadMarksForm(){
    this.uploadMarksForm = this.formBuilder.group({
      title: this.formBuilder.control('',Validators.required),
      assignmentId: this.formBuilder.control('',Validators.required),
      file: this.formBuilder.control(null,Validators.required)
    })
  }

  resetSubmitAssignmentForm(){
    this.submitAssignmentForm = this.formBuilder.group({
      file: this.formBuilder.control(null,Validators.required),
      assignmentId: this.formBuilder.control('',Validators.required),
      title: this.formBuilder.control('',Validators.required)
    });
  }

  async createAssignment(){
    this.showSpinner = true;
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
      })
    };
    
    let formData: any = new FormData();
    formData.append("title", this.assignmentForm.get('title').value);
    formData.append("file", this.assignmentForm.get('doc').value);
    formData.append("description", this.assignmentForm.get('description').value);
    formData.append("deadline", this.assignmentForm.get('deadline').value);
    formData.append("marks", this.assignmentForm.get('marks').value);
    formData.append("courseCode", this.code);
    formData.append("requiresSubmission",this.assignmentForm.get('requiresSubmission').value);
    
    await this.http.post(this.storeInfo.serverUrl+'/course/addAssignment', formData, options).toPromise().then(async resData => {
      this.matComp.openSnackBar(resData['body']['message'],2000);  
      if(resData['status'] == 201){
        await this.getAssignments();
        this.resetAssignmentForm();
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })

    this.showSpinner = false;
  }

  resetAssignmentForm(){
    this.assignmentForm = this.formBuilder.group({
      title : this.formBuilder.control('',Validators.required),
      description : this.formBuilder.control('',Validators.required),
      marks: this.formBuilder.control('',Validators.required),
      deadline: this.formBuilder.control('',Validators.required),
      requiresSubmission: this.formBuilder.control(true),
      doc: this.formBuilder.control(null)
    });
  }

  resetShiftDeadlineForm(){
    this.shiftDeadlineForm = this.formBuilder.group({
      newDeadline: this.formBuilder.control('',Validators.required),
      assignmentId: this.formBuilder.control('',Validators.required),
      title: this.formBuilder.control('', Validators.required),
      courseCode: this.formBuilder.control('',Validators.required)
    });
  }

  async createTest(data: Object){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    data['courseCode'] = this.code;
    await this.http.post(this.storeInfo.serverUrl+'/test/create', data, options).toPromise().then( response => {
      if(response['status']==201){
        this.matComp.openSnackBar(response['body']['message'],2000);
        this.getTests();
        this.resetTestForm();
      } else {
        this.matComp.openSnackBar(response['body']['message'],2000);
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  resetTestForm(){
    this.testForm = this.formBuilder.group({
      title: this.formBuilder.control(''),
      instructions: this.formBuilder.control('')
    });
  }

  async getPosts(){
    this.showSpinner = true;
    let options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params : new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getPosts', options).toPromise().then( resData => {
      if(resData['status'] == 200){
        this.course.posts = resData['body'].reverse();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],3000);
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async getAssignments(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params : new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getAssignments', options).toPromise().then( resData => {
      if(resData['status'] == 200){
        this.course.assignments = resData['body']['assignments'].reverse();
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async getAssignmentDoc(assignmentId){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      params : new HttpParams().set('courseCode',this.code).set('assignmentId',assignmentId)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/course/getAssignmentDoc', options).toPromise().then( (resData : Blob) => {
      if(resData['status'] == 200){
        this.download(resData['body']);
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async getPostResource(postId){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      params : new HttpParams().set('courseCode',this.code).set('postId',postId)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/post/getResource', options).toPromise().then( (resData : Blob) => {
      if(resData['status'] == 200){
        this.download(resData['body']);
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  } 

  async getTests(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params : new HttpParams().set('courseCode',this.code)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/test/getTitles', options).toPromise().then( resData => {
      if(resData['status'] == 200){
        this.course.tests = resData['body']['tests'];
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;  
  }

  uploadFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.assignmentForm.patchValue({
      doc : file
    });
    this.assignmentForm.get('doc').updateValueAndValidity()
  }

  uploadPostFile(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postForm.patchValue({
      file : file
    });
    this.postForm.get('file').updateValueAndValidity()
  }

  uploadSubmissionFile(event){
    const file = (event.target as HTMLInputElement).files[0];
    this.submitAssignmentForm.patchValue({
      file : file,
    });
    this.submitAssignmentForm.get('file').updateValueAndValidity()
  }

  setSubmissionAssignment(id,title){
    this.submitAssignmentForm.controls['title'].setValue(title);
    this.submitAssignmentForm.controls['assignmentId'].setValue(id);
  }

  async submitAssignment(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json'
    };

    let formData: any = new FormData();
    formData.append("assignmentId", this.submitAssignmentForm.get('assignmentId').value);
    formData.append("file", this.submitAssignmentForm.get('file').value);
    formData.append("courseCode", this.code);
    
    await this.http.post(this.storeInfo.serverUrl+'/course/submitAssignment', formData, options).toPromise().then(async (resData)=>{
      if(resData['status'] == 201){
        this.resetSubmitAssignmentForm();
        await this.getAssignments();
      }
      this.matComp.openSnackBar(resData['body']['message'],2000);
    }, (error) => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })

    this.showSpinner = false;
  }

  signOut(){
    this.storeInfo.signOut();
    this.router.navigateByUrl('/');
  }

  navToTestReports(testId){
    this.router.navigateByUrl(`/course/${this.code}/tests/${testId}/report`);
  }

  checkStatus(date: string){
    let dd = new Date(date);
    return dd.getTime() > new Date().getTime();
  }

  download(data){

    let dataType = data.type;
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
    downloadLink.target = "_blank";
    document.body.appendChild(downloadLink);
    downloadLink.click();
		document.body.removeChild(downloadLink);
  }
  
  async downloadSubmission(assignmentId) {
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        // 'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code).set('assignmentId',assignmentId)
    };
    await this.http.get(this.storeInfo.serverUrl+'/course/getAssignmentSubmission', options).toPromise().then( (resData : Blob) => {
      if(resData['status'] == 200){
        this.download(resData['body']);
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async applyPlagiarismCheck(assignmentId) {
    this.fetchingMoss = true;
    const options = {
      observer: 'response' as 'body',
      headers: new HttpHeaders({
      }),
      params: new HttpParams().set('courseCode', this.code).set('assignmentId', assignmentId)
    }
    await this.http.get(this.storeInfo.serverUrl+'/assignment/applyPlagiarismCheck', options).toPromise()
    .then( (resData) => {
      if (resData['message']) {
        this.mossLink = resData['message'];
        // this.matComp.openSnackBar(resData['message'], 20000);
      } else {
        this.matComp.openSnackBar("Unknown Error", 2000);
      }
    }, (error) => {
      this.matComp.openSnackBar(error['statusText'], 2000);
    })
    this.fetchingMoss = false;
  }
  
  async downloadAllSubmissions(assignmentId) {
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        // 'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      params : new HttpParams().set('courseCode',this.code).set('assignmentId',assignmentId)
    };
    await this.http.get(this.storeInfo.serverUrl+'/assignment/getAllSubmissions', options).toPromise().then( (resData : Blob) => {
      if(resData['status'] == 200){
        this.download(resData['body']);
      } else {
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  setShiftDeadline(assignmentId,title){
    this.shiftDeadlineForm.controls['title'].setValue(title);
    this.shiftDeadlineForm.controls['assignmentId'].setValue(assignmentId);   
    this.shiftDeadlineForm.controls['courseCode'].setValue(this.code); 
  }

  textToClipboard (text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

  async shiftDeadline(data){
    this.showSpinner = true;

    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        // 'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };

    await this.http.post(this.storeInfo.serverUrl+'/assignment/shiftDeadline',data,options).toPromise().then((response)=>{
      if(response['status']==202){
        this.resetShiftDeadlineForm();
        this.getAssignments();
      }
      this.matComp.openSnackBar(response['body']['message'],2000);
    },(error) =>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  moveBack(){
    this.router.navigateByUrl('/home');
  }

  signout(){
    sessionStorage.removeItem('token');
    this.router.navigateByUrl('/');
  }


  public records: any = {};  
  fileToUpload:any;

  async uploadListener($event: any){  
    this.fileToUpload = $event;      
  }
  
  async uploadMarksFile(event){  
    const file = (event.target as HTMLInputElement).files[0];
    this.uploadMarksForm.patchValue({
      file : file
    });
    this.uploadMarksForm.get('file').updateValueAndValidity()       
  }

  setUploadMarksForm(assignmentId,title){
    this.uploadMarksForm.controls['title'].setValue(title);
    this.uploadMarksForm.controls['assignmentId'].setValue(assignmentId);   
  }

  async uploadMarks(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      headers: new HttpHeaders({
        // 'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };

    let formData: any = new FormData();
    formData.append("assignmentId", this.uploadMarksForm.get('assignmentId').value);
    formData.append("file", this.uploadMarksForm.get('file').value);
    formData.append("courseCode", this.code);
    
    await this.http.post(this.storeInfo.serverUrl+'/assignment/uploadMarks', formData, options).toPromise().then(async (resData)=>{
      if(resData['status'] == 200){
        this.resetUploadMarksForm();
      }
      this.matComp.openSnackBar(resData['body']['message'],2000);
    }, (error) => {
      this.matComp.openSnackBar(error.toString(),2000);
    })

    this.showSpinner = false;
  }

  fileReset() {  
    this.records = [];  
  }

  uploadAssignmentDocListener($event){
    this.assignmentDoc = $event.target.files[0];
  }

  navToHome(){
    this.router.navigateByUrl('/home')
  }

  openTest(testId,id){
    this.router.navigateByUrl(`/course/${this.code}/tests/${testId}/settings`);  
  }

}