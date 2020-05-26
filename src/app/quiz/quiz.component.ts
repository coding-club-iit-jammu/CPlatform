import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup} from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';
import { MaterialComponentService } from '../services/material-component.service';
import { StoreInfoService } from '../services/store-info.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
  animations: [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ height: 0, opacity: 0 }),
            animate('1s ease-out', 
                    style({ height: 300, opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({ height: 300, opacity: 1 }),
            animate('1s ease-in', 
                    style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})
export class QuizComponent implements OnInit {

  code:any;
  testId:any;
  groupId:any;

  test_id:any;
  userTestRecordId:any;

  remainTime:any = "30:00:00";
  time:String;
  endTime:any = new Date();

  startTestForm:FormGroup;

  showSideNav:Boolean = true;
  showSpinner:Boolean = false;
  submitted:Boolean = false;
  view:Boolean = false; //False for First View and True for Second View.
  opened:Boolean;

  questions:any;
  questionType:string;
  current = {
    section: 0,
    question: 0
  }

  headerCode: string;
  footerCode: string;
  mainCode: string;
  problemInput: string;
  selectedCodingQuestion:any;

  constructor(private http: HttpClient, private router: Router,
              private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
              private storeInfo: StoreInfoService, private matComp: MaterialComponentService) {
                setInterval(() => {
                  let t = this.getTimeRemaining(this.endTime.toLocaleString('en-In'));
                  this.time = t.days + " : " + t.hours + " : " + t.minutes + " : " + t.seconds;
                }, 500);
              }

  async ngOnInit() {
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
      return;
    }
    this.showSpinner = true;
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
    this.groupId = this.activatedRoute.snapshot.paramMap.get('groupId');

    console.log(this.code,this.testId,this.groupId);
    this.resetStartTestForm();
    this.showSpinner = false;
  }

  getTimeRemaining(endtime){
    var t = Date.parse(endtime) - Date.parse(new Date().toString());
    var seconds = Math.floor( (t/1000) % 60 );
    var minutes = Math.floor( (t/1000/60) % 60 );
    var hours = Math.floor( (t/(1000*60*60)) % 24 );
    var days = Math.floor( t/(1000*60*60*24) );
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  resetStartTestForm(){
    this.startTestForm = this.formBuilder.group({
      groupId:this.formBuilder.control(this.groupId),
      password:this.formBuilder.control(''),
      testId:this.formBuilder.control(this.testId)
    })
  }

  async joinTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = this.startTestForm.value;
    data['courseCode'] = this.code;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/joinTest', data, options).toPromise().then(async (response)=>{
      if(response['status']==200){
        if(response['body']['userTestRecord']){
          this.userTestRecordId = response['body']['userTestRecord'];
          this.test_id = response['body']['test_id'];
          this.endTime = response['body']['endTime'];
          await this.getQuestions();
          this.view = true;
        } else {
          this.matComp.openSnackBar(response['body']['message'],3000);
        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;    
  }

  changeQuestion(q:number){
    this.current.question = q;
  }

  async endTest(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {}
    data['courseCode'] = this.code;
    data['userTestRecordId'] = this.userTestRecordId;
    data['test_id'] = this.test_id;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/endTest', data, options).toPromise().then(async (response)=>{
      if(response['status'] == 200 ){
        this.showSpinner = false; 
        this.matComp.openSnackBar(response['body']['message'],3000);
        this.router.navigateByUrl(`/course/${this.code}`);
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

  async submitQuestion(currentQuestion,questionType){
    this.showSpinner = true;
    let answer = [];
    let resAnswer;

    if(questionType == 'mcq'){
      for(let x of this.questions[currentQuestion]['options']){
        if(x['response']){
          answer.push(x['code']);
        }
      }
      resAnswer = (answer.sort()).toString();
    } else if(questionType == 'trueFalse'){
      resAnswer = this.questions[currentQuestion]['response'];
    } else {
      this.showSpinner = false;
      return;
    }
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {
      questionId : this.questions[currentQuestion]['questionId'],
      questionType: questionType,
      answer: resAnswer,
      courseCode: this.code,
      userTestRecordId: this.userTestRecordId,
      test_id: this.test_id
    }
    await this.http.post(this.storeInfo.serverUrl+'/test/submitQuestion',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
      if(response['body']['ended'] && response['body']['ended']==true){
        this.showSpinner = false;
        this.matComp.openSnackBar("Test Ended.",5000);
        this.router.navigateByUrl(`/course/${this.code}/`);
      } else {
        if(response['status'] == 200){
          this.questions[currentQuestion]['submitted'] = true; 
        }
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async submitCodingQuestion(selectedCodingQuestion, submitCode, langId, langVersion) {
    this.showSpinner = true;
    this.submitted = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    // fetch user code from the child component, passed in function
    // console.log(submitCode);
    let data = {
      questionId : this.questions[selectedCodingQuestion]['questionId'],
      questionType: 'codingQuestion',
      courseCode: this.code,
      submitCode: submitCode,
      langId: langId,
      langVersion: langVersion,
      test_id: this.test_id
    }
    
    await this.http.post(this.storeInfo.serverUrl+'/test/submitQuestion',data,options).toPromise().then(response=>{
      if (response['body']['error']) {
        this.matComp.openSnackBar(response['body']['error']['message'],10000);  
      }
      this.matComp.openSnackBar(response['body']['message'],10000);
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['error']['message'],3000);
    })
    
    this.showSpinner = false;
    this.submitted = false;
  }
  
  nextQuestion(){
    this.changeQuestion(this.current.question+1)
  }

  previousQuestion(){
    this.changeQuestion(this.current.question-1)
  }

  async getEndTime(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code).set('test_id',this.test_id)
    };
    await this.http.get(this.storeInfo.serverUrl+'/test/getEndTime', options).toPromise().then(async (response)=>{
      if(response['status'] == 200){
        this.endTime = response['body']['endTime'];
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

  async getQuestions(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code)
                              .set('userTestRecordId',this.userTestRecordId)
                              .set('test_id',this.test_id)
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/test/getQuestions', options).toPromise().then(async (response)=>{
      if(response['status']==200 ){
        if(response['body']['ended'] && response['body']['ended']==true){
          this.showSpinner = false;
          this.matComp.openSnackBar(response['body']['message'],5000);
        } else {
          this.questions = response['body']['questions'];
          this.questionType = response['body']['questionType'];
          this.current.question = 0;
        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

  async nextSection(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {}
    data['courseCode'] = this.code;
    data['userTestRecordId'] = this.userTestRecordId;
    data['test_id'] = this.test_id;
    
    await this.http.post(this.storeInfo.serverUrl+'/test/submitSection', data, options).toPromise().then(async (response)=>{
      if(response['status']==200 ){
        this.matComp.openSnackBar(response['body']['message'],3000);
        if( response['body']['ended']==false){
          await this.getQuestions();
        } else {
          this.showSpinner = false;
          this.matComp.openSnackBar("Test Ended.",5000);
          this.router.navigateByUrl(`/course/${this.code}/`);
        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

}
