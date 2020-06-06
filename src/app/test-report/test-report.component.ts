import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StoreInfoService } from '../services/store-info.service';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-test-report',
  templateUrl: './test-report.component.html',
  styleUrls: ['./test-report.component.css']
})
export class TestReportComponent implements OnInit {

  testId: string;
  test_id: string;
  code: string;
  notFound:boolean = false;

  stats = {
    maxMarks:0,
    minMarks:0,
    avgMarks:0
  }
  marks:Number = 0;
  userTestRecord:any = {
    mcq:[],
    trueFalse:[],
    codingQuestion:[],
    securedMarks:0
  }

  showSpinner:boolean = false;

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
              private storeInfo: StoreInfoService, private http: HttpClient,
              private matComp: MaterialComponentService) { }

  ngOnInit() {
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
    }
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
   
    this.checkRevealMarks();
  }

  // Check if marks have been released. If so get test_id;
  async checkRevealMarks(){
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      params: new HttpParams().set('courseCode',this.code).set('testId',this.testId)
    }

    await this.http.get(this.storeInfo.serverUrl+'/test/checkRevealMarks',options).toPromise().then((response)=>{
      if(response['status'] == 200){
        this.test_id = response['body']['test_id'];
        if(response['body']['revealMarks'] == false){
          this.matComp.openSnackBar('Marks not released for this test.',2000);
          this.setView(3);
        } else {
          this.getUserTestRecord();
        }
      }
    },error=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }

  async getUserTestRecord(){
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      params: new HttpParams().set('courseCode',this.code).set('test_id',this.test_id)
    }

    await this.http.get(this.storeInfo.serverUrl+'/test/getUserTestRecord',options).toPromise().then((response)=>{
      if(response['status'] == 200){
        this.stats = response['body']['stats'];
        if(response['body']['userTestRecord']){
          this.test_id = response['body']['test_id'];
          this.marks = response['body']['userTestRecord']['securedMarks'];
          this.userTestRecord.mcq = response['body']['userTestRecord']['mcq']['problems'];
          this.userTestRecord.trueFalse = response['body']['userTestRecord']['trueFalse']['problems'];
          this.userTestRecord.codingQuestion = response['body']['userTestRecord']['codingQuestion']['problems'];
          this.userTestRecord.securedMarks = response['body']['userTestRecord']['securedMarks'];
          this.notFound = false;
        } else {
          this.notFound = true;
          this.marks = 0;
        }
      }
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
