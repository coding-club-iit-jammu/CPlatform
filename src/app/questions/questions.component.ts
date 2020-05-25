import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MaterialComponentService } from '../services/material-component.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.css']
})
export class QuestionsComponent implements OnInit {

  view: Number = 0;
  code: string;
  courseTitle: String;
  showSpinner: Boolean = false; 
  addMCQQuestion: any = {
    question:'',
    options:[]
  }
  
  mcqQuestion: FormGroup;
  addOptionForm: FormGroup;
  
  editOptionIndex: any;

  addTrueFalseQuestion: FormGroup;

  addCodingQuestion: FormGroup;

  mcqQuestions: Array<any> = [];
  trueFalseQuestions: Array<any> = [];
  codingQuestions: Array<any> = [];

  tests = [];

  constructor(private formBuilder: FormBuilder, 
              private matComp: MaterialComponentService,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private storeInfo: StoreInfoService,
              private router: Router) { }

  ngOnInit() {
    
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
      return;
    }

    this.resetMCQQuestion();
    this.resetAddOptionForm();
    this.resetTrueFalseQuestion();
    this.resetAddCodingQuestion();
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId').toString();
    this.getTestTitles();
    this.getMCQ();
    this.getTrueFalse();
    this.getCodingQuestions();
  }

  async addToPractice(questionId,questionType){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let data = { questionId : questionId,questionType:questionType};
    data['courseCode'] = this.code;

    await this.http.post(this.storeInfo.serverUrl+'/course/addToPractice', data, options).toPromise().then(response=>{
      console.log(response);
      if(response['status']==200){
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['statusText'],3000);
    }) 

    this.showSpinner = false;
  }

  async addToTest(questionId,testId,questionType){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let data = { questionId : questionId,questionType:questionType,testId:testId};
    data['courseCode'] = this.code;

    await this.http.post(this.storeInfo.serverUrl+'/test/addQuestion', data, options).toPromise().then(response=>{
      console.log(response);
      if(response['status']==200){
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    }) 

    this.showSpinner = false;
  }

  async getTestTitles(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    this.addMCQQuestion['courseCode'] = this.code;
    await this.http.get(this.storeInfo.serverUrl+'/test/getTitles',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.tests = response['body']['tests'];
        console.log("Tests:",this.tests);
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async getMCQ(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    this.addMCQQuestion['courseCode'] = this.code;
    await this.http.get(this.storeInfo.serverUrl+'/mcq/getMCQ',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.mcqQuestions = response['body']['questions']['mcq'];
        this.courseTitle = response['body']['title'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async getTrueFalse(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/truefalse/getTrueFalse',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body']['questions']['trueFalse'];
        this.courseTitle = response['body']['title'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async getCodingQuestions(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/codingQuestion/getCodingQuestions',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.codingQuestions = response['body']['questions']['codingQuestion'];
        this.courseTitle = response['body']['title'];
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }


  addOption(){

    let l = (this.addMCQQuestion.options).length;

    let option = this.addOptionForm.get('option').value;
    let isCorrect = this.addOptionForm.get('isCorrect').value;
    if(isCorrect === '')
      isCorrect = false;
    (this.addMCQQuestion.options).push({code:l+1,option:option,isCorrect:isCorrect});

    this.resetAddOptionForm();
  }

  editOption(i){
    this.addOptionForm.get('option').patchValue(this.addMCQQuestion.options[i].option);
    this.addOptionForm.get('isCorrect').patchValue(this.addMCQQuestion.options[i].isCorrect);
    this.editOptionIndex = i;
  }

  setEdittedOption(){
    this.addMCQQuestion.options[this.editOptionIndex].option = this.addOptionForm.get('option').value;
    this.addMCQQuestion.options[this.editOptionIndex].isCorrect = this.addOptionForm.get('isCorrect').value;
    this.editOptionIndex = null;
  }

  async saveMCQQuestion(){
    this.showSpinner = true;
    this.addMCQQuestion.question = this.mcqQuestion.get('question').value;
    if(this.addMCQQuestion.question.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }

    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    this.addMCQQuestion['courseCode'] = this.code;
    await this.http.post(this.storeInfo.serverUrl+'/mcq/add',this.addMCQQuestion,options).toPromise().then(response=>{
      if(response['status']==201){
        this.getMCQ();
        this.resetMCQQuestion();
        this.addMCQQuestion = {
          question:'',
          options:[]
        }
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  async saveTrueFalseQuestion(){
    if(this.addTrueFalseQuestion.get('question').value.trim() === ''){
      this.matComp.openSnackBar('Question can\'t be empty',3000);
      return;
    }
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let data = this.addTrueFalseQuestion.value;
    data['courseCode'] = this.code;

    await this.http.post(this.storeInfo.serverUrl+'/truefalse/add', data, options).toPromise().then(async (response)=>{
      if(response['status']==201){
        this.resetTrueFalseQuestion();
        await this.getTrueFalse();
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['body']['message'],3000);
    })
    this.showSpinner = false;
  }

  setTestCases(event){
    const file = (event.target as HTMLInputElement).files[0];
    this.addCodingQuestion.patchValue({
      testcases : file
    });
    this.addCodingQuestion.get('testcases').updateValueAndValidity()
  }

  setHeaderCode(event){
    const file = (event.target as HTMLInputElement).files[0];
    this.addCodingQuestion.patchValue({
      header: file
    });
    this.addCodingQuestion.get('header').updateValueAndValidity()
  }

  setMainCode(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.addCodingQuestion.patchValue({
      mainCode: file
    });
    this.addCodingQuestion.get('mainCode').updateValueAndValidity();
  }

  setFooterCode(event){
    const file = (event.target as HTMLInputElement).files[0];
    this.addCodingQuestion.patchValue({
      footer : file
    });
    this.addCodingQuestion.get('footer').updateValueAndValidity()
  }

  getFileNameFromHttpResponse(httpResponse) {
    var contentDispositionHeader = httpResponse.headers('Content-Disposition');
    var result = contentDispositionHeader.split(';')[1].trim().split('=')[1];
    return result.replace(/"/g, '');
  }

  download(data,name){

    let dataType = data.type;
    let binaryData = [];
    binaryData.push(data);
    let downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(new Blob(binaryData,{type : dataType}));
    downloadLink.target = "_blank";
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
		document.body.removeChild(downloadLink);
  }

  async downloadItem(_id,path,item){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      responseType: 'blob' as 'json',
      params : new HttpParams().set('courseCode',this.code).set('codingQuestionId',_id).set('item',item)
    };
    var filename = path.replace(/^.*[\\\/]/, '');
    await this.http.get(this.storeInfo.serverUrl+'/codingQuestion/getItem', options).toPromise().then( (resData : Blob) => {
      if(resData['status'] == 200){
        this.download(resData['body'],filename);
      } else {
        // console.log(resData['body']['message']);
        this.matComp.openSnackBar(resData['body']['message'],2000);  
      }
    },error => {
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async saveCodingQuestion(){
    this.showSpinner = true;
    
    let formData = new FormData();
    
    formData.append('title',this.addCodingQuestion.get('title').value);
    formData.append('description',this.addCodingQuestion.get('question').value);
    formData.append('sampleInput',this.addCodingQuestion.get('sampleInput').value);
    formData.append('sampleOutput',this.addCodingQuestion.get('sampleOutput').value);
    
    if(this.addCodingQuestion.get('testcases').value)
      formData.append('testcases',this.addCodingQuestion.get('testcases').value);
    if(this.addCodingQuestion.get('header').value)
      formData.append('header',this.addCodingQuestion.get('header').value);
    if(this.addCodingQuestion.get('mainCode').value) 
      formData.append('mainCode', this.addCodingQuestion.get('mainCode').value);
    if(this.addCodingQuestion.get('footer').value)
      formData.append('footer',this.addCodingQuestion.get('footer').value);
    
    formData.append('courseCode',this.code);

    let url = '/codingQuestion/';
    if(this.addCodingQuestion.get('_id').value){
      url += 'edit';
      formData.append('_id',this.addCodingQuestion.get('_id').value);
    } else {
      url += 'add';
    }

    const options = {
      observe: 'response' as 'body'
    };
    
    await this.http.post(this.storeInfo.serverUrl+url,formData,options).toPromise().then(response=>{
      if(response['status']==201){
        this.getCodingQuestions();
        this.resetAddCodingQuestion();
      }
      this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['statusText'],3000);
    })
    this.showSpinner = false;
  }

  resetMCQQuestion(){
    this.mcqQuestion = this.formBuilder.group({
      question:this.formBuilder.control('')
    })
  }

  resetTrueFalseQuestion(){
    this.addTrueFalseQuestion = this.formBuilder.group({
      question:this.formBuilder.control(''),
      answer:this.formBuilder.control('')
    })
  }

  setEditCodingQuestion(index){
    
    this.resetAddCodingQuestion();
    this.addCodingQuestion.get('title').patchValue(this.codingQuestions[index].title);
    this.addCodingQuestion.get('question').patchValue(this.codingQuestions[index].description);
    this.addCodingQuestion.get('sampleInput').patchValue(this.codingQuestions[index].sampleInput);
    this.addCodingQuestion.get('sampleOutput').patchValue(this.codingQuestions[index].sampleOutput);
    this.addCodingQuestion.get('_id').patchValue(this.codingQuestions[index]._id);
    this.view = 3;
  }

  resetAddCodingQuestion(){
    this.addCodingQuestion = this.formBuilder.group({
      title: this.formBuilder.control(''),
      question: this.formBuilder.control(''),
      sampleInput: this.formBuilder.control(''),
      sampleOutput: this.formBuilder.control(''),
      testcases: this.formBuilder.control(null),
      header: this.formBuilder.control(null),
      footer: this.formBuilder.control(null),
      mainCode: this.formBuilder.control(null),
      _id: this.formBuilder.control(null)
    })
  }
  resetAddOptionForm(){
    this.addOptionForm = this.formBuilder.group({
      option:this.formBuilder.control(''),
      isCorrect: this.formBuilder.control('')
    })
  }

  async deleteQuestion(id,questionType){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set("questionId",id).set('courseCode',this.code)
    };
    await this.http.delete(this.storeInfo.serverUrl+`/${questionType}/delete`,options).toPromise().then(response=>{
      console.log(response);
      // this.matComp.openSnackBar(response['body']['message'],3000);
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    
    this.showSpinner = false;
  }

  moveBack(){
    this.router.navigateByUrl('/home');
  }

  setView(view){
    this.router.navigateByUrl(`/course/${this.code}/${view}`);
  }

  goToPractice(){
    this.router.navigateByUrl(`/course/${this.code}/practice`);
  }

  goToQuestions(){
    this.router.navigateByUrl(`/course/${this.code}/questions`);
  }

  signOut(){
    this.storeInfo.signOut();
    this.router.navigateByUrl('/');
  }
}
