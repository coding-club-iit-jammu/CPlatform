import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';
import { FormGroup,FormBuilder,FormControl, FormArray } from '@angular/forms';
@Component({
  selector: 'app-create-test',
  templateUrl: './create-test.component.html',
  styleUrls: ['./create-test.component.css']
})
export class CreateTestComponent implements OnInit {

  code: String;
  testId: String;
  showSpinner:Boolean = false;

  test:any;
  testForm:FormGroup;

  constructor(private router:Router, private activatedRoute: ActivatedRoute,
              private http: HttpClient, private storeInfo: StoreInfoService,
              private matComp: MaterialComponentService, private formBuilder: FormBuilder) { }

  async ngOnInit() {
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
    }
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
    this.resetTestForm();
    await this.getTestData();
  }

  private toDateString(date: Date): string {
    return (date.getFullYear().toString() + '-' 
       + ("0" + (date.getMonth() + 1)).slice(-2) + '-' 
       + ("0" + (date.getDate())).slice(-2))
       + 'T' + date.toTimeString().slice(0,5);
  }

  addGroup(data){
    let arraay = this.testForm.get('groups') as FormArray; 
    let l = arraay.length;
    let fg = this.formBuilder.group({ 
      groupId: this.formBuilder.control(data.groupId),
      startTime: this.formBuilder.control(this.toDateString(new Date(data['startTime']))),
      endTime: this.formBuilder.control(this.toDateString(new Date(data['endTime']))),
      password:this.formBuilder.control(data['password']),
      showPassword:this.formBuilder.control(false)
    })
    arraay.push(fg);
  }

  addMCQ(data){
    let arraay = this.testForm.get('mcq') as FormArray; 
    let l = arraay.length;
    let fg = this.formBuilder.group({
      question: this.formBuilder.control(data['question']['_id']),
      questionContent: this.formBuilder.control(data['question']['question']),
      marks: this.formBuilder.control(data['marks'])
    })
    arraay.push(fg);
  }

  removeMCQ(i){
    let arraay = this.testForm.get('mcq') as FormArray;
    arraay.removeAt(i);
  }

  addTrueFalse(data){
    let arraay = this.testForm.get('trueFalse') as FormArray; 
    let l = arraay.length;
    let fg = this.formBuilder.group({
      question: this.formBuilder.control(data['question']['_id']),
      questionContent: this.formBuilder.control(data['question']['question']),
      marks: this.formBuilder.control(data['marks'])
    })
    arraay.push(fg);
  }

  removeTrueFalseQuestion(i){
    let arraay = this.testForm.get('trueFalse') as FormArray;
    arraay.removeAt(i);
  }

  addCodingQuestion(data){
    let arraay = this.testForm.get('codingQuestion') as FormArray; 
    let l = arraay.length;
    let fg = this.formBuilder.group({
      question: this.formBuilder.control(data['question']['_id']),
      title: this.formBuilder.control(data['question']['title']),
      marks: this.formBuilder.control(data['marks'])
    })
    arraay.push(fg);
  }

  removeCodingQuestion(i){
    let arraay = this.testForm.get('codingQuestion') as FormArray;
    arraay.removeAt(i);
  }

  fillTestForm(data){
    
    this.testForm.patchValue({
      title:data.title,
      instructions:data.instructions,
      _id:data._id
    });
    
    for(let x of data['groups']){
      this.addGroup(x);
    }
    
    for(let x of data['questions']['mcq']){
      this.addMCQ(x);
    }
    
    for(let x of data['questions']['trueFalse']){
      this.addTrueFalse(x);
    }
    
    for(let x of data['questions']['codingQuestion']){
      this.addCodingQuestion(x);
    }
    console.log(this.testForm.value);
  }

  resetTestForm(){
    this.testForm = this.formBuilder.group({
      _id:this.formBuilder.control(''),
      title: this.formBuilder.control(''),
      instructions:this.formBuilder.control(''),
      groups: new FormArray([]),
      mcq: new FormArray([]),
      trueFalse: new FormArray([]),
      codingQuestion: new FormArray([])
    })
  }

  async getTestData(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString()).set('testId',this.testId.toString())
    };

    await this.http.get(this.storeInfo.serverUrl+'/test/getTestData',options).toPromise().then((response)=>{
      if(response['status']==200){
        this.test = response['body'];
        this.fillTestForm(response['body']);
      }
    },error=>{
      console.log(error);
    });

    this.showSpinner = false;
  }

  async saveTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = this.testForm.value;
    data['courseCode'] = this.code;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/saveTestData', data, options).toPromise().then((response)=>{
      if(response['status']==200){
        this.matComp.openSnackBar(response['body']['message'],3000);
      }
    },(error)=>{
      this.matComp.openSnackBar(error['statusText'],2500);
    })
    this.showSpinner = false;
  }

  async startTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {}
    data['_id'] = this.testForm.get('_id').value;
    data['courseCode'] = this.code;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/startTest', data, options).toPromise().then((response)=>{
      if(response['status']==200){
        this.matComp.openSnackBar(response['body']['message'],3000);
      }
    },(error)=>{
      this.matComp.openSnackBar(error['statusText'],2500);
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
