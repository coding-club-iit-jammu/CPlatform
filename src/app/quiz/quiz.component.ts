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
  submitting:Boolean = false;
  showSideNav:Boolean = true;
  showSpinner:Boolean = false;
  submitted:Boolean = false;
  view:Boolean = false; //False for First View and True for Second View.
  opened:Boolean;
  // app-ide related
  headerCode: string;
  footerCode: string;
  mainCode: string;
  problemInput: string;

  questions:any;
  questionType:string;
  current = {
    section: 0,
    question: 0
  }
  instructions:string = '';

  constructor(private http: HttpClient, private router: Router,
              private activatedRoute: ActivatedRoute, private formBuilder: FormBuilder,
              private storeInfo: StoreInfoService, private matComp: MaterialComponentService) {
                setInterval(() => {
                  let t = this.getTimeRemaining(this.endTime.toString());
                  this.time = t.days + " D : " + t.hours + " H : " + t.minutes + " M : " + t.seconds + ' S';
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
    this.fetchInstructions();
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

  async fetchInstructions(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code).set('testId',this.testId)
    };
    await this.http.get(this.storeInfo.serverUrl+'/test/getInstructions', options).toPromise().then(async (response)=>{
      if(response['status'] == 200){
        this.instructions = response['body']['instructions'];
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
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
          this.instructions = response['body']['instructions'];
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

  async changeQuestion(q:number){
    this.current.question = q;
    if (this.questionType == "codingQuestion") {
      await this.setCodingQuestionParameters(q);
    }
    this.questions[q].visited = true;
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

  showInstructions(){
    document.getElementById('instructionBtn').click();
  }

  async submitQuestion(currentQuestion,questionType){
    this.submitting = true;
    this.questions[currentQuestion]['submitted'] = false; 
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
      // submit coding question handled separately
      this.submitting = false;
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
    this.submitting = false;
  }

  async submitCodingQuestion(selectedCodingQuestion, submitCode, langId, langVersion) {
    this.submitting = true;
    this.questions[selectedCodingQuestion]['submitted'] = false;
    this.submitted = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let data = {
      questionId : this.questions[selectedCodingQuestion]['questionId'],
      questionType: 'codingQuestion',
      courseCode: this.code,
      submitCode: submitCode,
      langId: langId,
      langVersion: langVersion,
      test_id: this.test_id,
      userTestRecordId: this.userTestRecordId,
    }
    
    await this.http.post(this.storeInfo.serverUrl+'/test/submitQuestion',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
      if(response['body']['ended'] && response['body']['ended']==true){
        this.showSpinner = false;
        this.matComp.openSnackBar("Test Ended.",5000);
        this.router.navigateByUrl(`/course/${this.code}/`);
      } else {
        if(response['status'] == 200){
          this.questions[selectedCodingQuestion]['submitted'] = true; 
        }
      }
    },error=>{
      console.log(error)
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.submitting = false;
    this.submitted = false;
  }
  
  async nextQuestion(){
    await this.changeQuestion(this.current.question+1)
  }

  async previousQuestion(){
    await this.changeQuestion(this.current.question-1)
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

  async setCodingQuestionParameters(question) {
    let q = this.questions[question];
    // console.log(q);
    this.headerCode = q.headerCode;
    this.footerCode = q.footerCode;
    this.mainCode = q.mainCode;
    this.problemInput = q.sampleInput;
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
          this.current.question = 0;
          this.questions = [];
          this.matComp.openSnackBar(response['body']['message'],5000);
        } else {
          this.questions = response['body']['questions'];
          this.questionType = response['body']['questionType'];
          if(this.questions && this.questions.length>0){
            this.questions[0].visited = true;
          }
          this.current.question = 0;
          await this.setCodingQuestionParameters(0);
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
          this.matComp.openSnackBar("Test Complete. Please End Test.",5000);
          this.questions = [];
          // this.router.navigateByUrl(`/course/${this.code}/`);
        }
      }
    },(error)=>{
      this.matComp.openSnackBar("Something\'s is wrong. Try Again.",2500);
    })
    this.showSpinner = false;
  }

}
