import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MaterialComponentService } from '../services/material-component.service';
import { HttpClient, HttpHeaders, HttpParams, HttpHandler } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { IdeComponent } from '../ide/ide.component';

interface LeaderboardEntry {
  name: string,
  score: number,
  rank: number
}

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css']
})
export class PracticeComponent implements OnInit {

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private http: HttpClient,
              private storeInfo: StoreInfoService,
              private matComp: MaterialComponentService,
              ) { }
  
  showSpinner: Boolean = false;
  view:Number = 0;
  code:string;
  courseTitle:string;
  role:string;
  title:string;
  mcqQuestions=[];
  trueFalseQuestions=[];
  codingQuestions=[];

  selectedMCQ:any;
  selectedTrueFalse:any;
  selectedCodingQuestion:any;

  headerCode: string;
  footerCode: string;
  mainCode: string;
  problemInput: string;
  submitted: Boolean;
  leaderboard: LeaderboardEntry[];
  userRank = {
    name:'',
    rank:'',
    score:''
  }
  userData : any = {
    name : '',
    branch : '',
    email : '',
    courses: {
      teaching: [],
      teachingAssistant: [],
      studying : []
    }
  }

  async ngOnInit() {
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
      return;
    }
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId').toString();
    this.leaderboard = [];

    this.getMCQ();
    this.getTrueFalse();
    this.getCodingQuestion();
    this.getLeaderBoard();
    await this.fetchUserData();
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
     await this.http.get(this.storeInfo.serverUrl + '/CodeofIDE/getidecode',options).toPromise().then((code)=>{
      if(code['status'] == 200){
        if(code['body'].data.length===0)
        {
          this.http.post(this.storeInfo.serverUrl+ '/CodeofIDE/saveidecode',{email:this.userData.email}).toPromise()
        }
        
        
      }
    else {
        this.matComp.openSnackBar(code['body']['message'],2000);
      }
    }, error =>{
      this.matComp.openSnackBar('Network Problem!',2000);
    });
    this.showSpinner = false;
    

  }

  async getLeaderBoard() {
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      params: new HttpParams().set('courseCode', this.code.toString())
    };
    await this.http.get(this.storeInfo.serverUrl+'/practice/leaderboard', options).toPromise().then( (response) => {
      if (response['status'] == 200) {
        // update the LeaderBoard Entries
        let entries = response['body']['message'];
        this.userRank = response['body']['userEntry'];
        this.leaderboard = [];
        for (let entry of entries) {
          let leaderboardEntry = {name: "", score: 0,rank:1};
          leaderboardEntry.name = entry.name;
          leaderboardEntry.score = entry.score;
          leaderboardEntry.rank = entry.rank;
          this.leaderboard.push(leaderboardEntry);
        }
      }
    }, (error) => {
      this.matComp.openSnackBar(error['statusText'],2000);
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
    await this.http.get(this.storeInfo.serverUrl+'/practice/getMCQ',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.mcqQuestions = response['body']['mcq'];
        this.role = response['body']['role'];
        this.title = response['body']['title'];
      }
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  solveQuestion(question,questionType:String){
    if(questionType=='mcq'){
      this.selectedMCQ = question;
      this.view = 1;
    } else if(questionType == 'trueFalse'){
      this.selectedTrueFalse = question;
      this.view = 2;
    } else if(questionType == 'codingQuestion'){
      this.selectedCodingQuestion = question;
      this.setCodingQuestionParameters(question);
      this.view = 3;
    } else {
      this.view = 0;
      this.matComp.openSnackBar("Something is wrong, please try again.",2000);
    }
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
    await this.http.get(this.storeInfo.serverUrl+'/practice/getTrueFalse',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.trueFalseQuestions = response['body']['trueFalse'];
        this.role = response['body']['role'];
        this.title = response['body']['title'];
      }
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async setCodingQuestionParameters(question) {
    let q = this.codingQuestions[question];
    this.headerCode = q.header;
    this.footerCode = q.footer;
    this.mainCode = q.mainCode;
    this.problemInput = q.sampleInput;
  }

  async getCodingQuestion(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString())

    };
    await this.http.get(this.storeInfo.serverUrl+'/practice/getCodingQuestion',options).toPromise().then(response=>{
      if(response['status'] == 200){
        this.codingQuestions = response['body']['codingQuestion'];
        this.role = response['body']['role'];
        this.title = response['body']['title'];
      }
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async submitMCQ(selectedMCQ){
    this.showSpinner = true;
    let answer = [];
    for(let x of this.mcqQuestions[selectedMCQ]['options']){
      if(x['response']){
        answer.push(x['code']);
      }
    }
    let resAnswer = (answer.sort()).toString();
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {
      questionId : this.mcqQuestions[selectedMCQ]['_id'],
      questionType: 'mcq',
      answer: resAnswer,
      courseCode: this.code
    }
    await this.http.post(this.storeInfo.serverUrl+'/practice/submitMCQ',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
      this.getLeaderBoard();
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  //for fetching previous submission
  async fetchPrevSubmission(selectedCodingQuestion){

    this.showSpinner = true;
    const data = {
      questionId : this.codingQuestions[selectedCodingQuestion]['_id'],
      questionType: 'codingQuestion',
      courseCode: this.code,
      
    }
    const options = {
      observe : 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams({fromObject: data})
    };
   	

    this.http.get(this.storeInfo.serverUrl+'/practice/getprevsubmission',options).toPromise().then((code)=>{
      if(code['status']==200){
        var textFile = null,
              makeTextFile = function (text) {
                var data = new Blob([text], {type: 'text/plain'});
                // If we are replacing a previously generated file we need to
                // manually revoke the object URL to avoid memory leaks.
                if (textFile !== null) {
                  window.URL.revokeObjectURL(textFile);
                }
                textFile = window.URL.createObjectURL(data);
                return textFile;
              };
              var link= document.getElementById("downloadlink")
              
              var questionNo = this.codingQuestions[selectedCodingQuestion]._id;
              
              for (var currentQuestion of code['body']['data'].questions.codingQuestion)
              {
                if (currentQuestion.question== questionNo)
                {
                  link.setAttribute('href', makeTextFile(currentQuestion.response));
                  link.click();
                  break;
                }
              }
             
      } else {
        this.matComp.openSnackBar(code['message'],2000);
      }
    }, error =>{
      this.matComp.openSnackBar('Network Problem!',2000);
      
    })
    this.showSpinner = false;
  
  }
  //for getting user info
  async fetchUserData(){
    
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    await this.http.get(this.storeInfo.serverUrl + '/user/get',options).toPromise().then((data)=>{
      if(data['status'] == 200){
        this.userData = data['body'];
        
        
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
      }
    }, error =>{
      this.matComp.openSnackBar('Network Problem!',2000);
    });
    this.showSpinner = false;
  }

  async submitTrueFalse(selectedTrueFalse){
    this.showSpinner = true;
    
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    let data = {
      questionId : this.trueFalseQuestions[selectedTrueFalse]['_id'],
      questionType: 'trueFalse',
      answer: this.trueFalseQuestions[selectedTrueFalse]['response'],
      courseCode: this.code
    }
    await this.http.post(this.storeInfo.serverUrl+'/practice/submitTrueFalse',data,options).toPromise().then(response=>{
      this.matComp.openSnackBar(response['body']['message'],2000);
      this.getLeaderBoard();
    },error=>{
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

    let headerExists = false;
    if (this.headerCode != null && this.headerCode != "") {
      headerExists = true;
    }
    // fetch user code from the child component, passed in function
    let data = {
      questionId : this.codingQuestions[selectedCodingQuestion]['_id'],
      questionType: 'codingQuestion',
      courseCode: this.code,
      submitCode: submitCode,
      langId: langId,
      langVersion: langVersion,
      headerExists: headerExists
    }
    
    await this.http.post(this.storeInfo.serverUrl+'/practice/submitCodingQuestion',data,options).toPromise().then(response=>{
      if (response['body']['error']) {
        this.matComp.openSnackBar(response['body']['error']['message'],10000);  
      } else {
        this.matComp.openSnackBar(response['body']['message'],10000);
        this.getLeaderBoard();
      }
    },error=>{
      
      this.matComp.openSnackBar(error['error']['message'],3000);
    })
    
    this.showSpinner = false;
    this.submitted = false;
    

  }


  setView(view){
    // if (view == 4) {
    //   this.router.navigateByUrl(`/ide`);
    //   return;
    // }
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

  moveBack(){
    this.router.navigateByUrl('/home');
  }
}
