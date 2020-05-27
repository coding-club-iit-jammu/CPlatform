import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';
import * as CanvasJS from '../../assets/canvasjs.min.js';

@Component({
  selector: 'app-test-statistics',
  templateUrl: './test-statistics.component.html',
  styleUrls: ['./test-statistics.component.css']
})
export class TestStatisticsComponent implements OnInit {

  code: string;
  testId: string;
  showSpinner:Boolean = false;
  fetchingLeaderboard:Boolean = false;

  spreadContainer = [];
  questionStats = {
    mcq:[],
    trueFalse:[],
    codingQuestion:[]
  }
  stats:Object = {
    minMarks:0,
    avgMarks:0,
    maxMarks:0,
    minStudents:[],
    maxStudents:[]
  };
  constructor(private router:Router, private activatedRoute: ActivatedRoute,
    private http: HttpClient, private storeInfo: StoreInfoService,
    private matComp: MaterialComponentService) { }

  ngOnInit() {
    if(!this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('');
    }
    this.code = this.activatedRoute.snapshot.paramMap.get('courseId');
    this.testId = this.activatedRoute.snapshot.paramMap.get('testId');
    this.getQuestionWiseStats();
    this.getSpread();
  }

  createSpreadChart(id,values){
    let points = [];
    for(let x in values){
      points.push({
        label: x + '%',
        y: values[x]
      })
    };

    let chart = new CanvasJS.Chart('chartContainerAll', {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: `Marks Distribution`
      },
      data: [{
        type: "column",
        dataPoints: points
      }]
    });
      
    chart.render();
  }

  async getSpread(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString()).set('testId',this.testId.toString())
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/test/getSpread',options).toPromise().then((response)=>{
      if(response['status']==200){
        this.spreadContainer = Object.keys(response['body']['marks']);
        this.stats = response['body']['stats'];
        return response['body']['marks'];
      }
    },error=>{
      console.log(error);
    }).then((marks)=>{
        this.createSpreadChart('All',marks['all']);
    });

    this.showSpinner = false;
  }

  async getQuestionWiseStats(){
    this.showSpinner = true;
    const options = {
      observe: 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      }),
      params: new HttpParams().set('courseCode',this.code.toString()).set('testId',this.testId.toString())
    };
    
    await this.http.get(this.storeInfo.serverUrl+'/test/getQuestionWiseStats',options).toPromise().then((response)=>{
      if(response['status']==200){
        this.questionStats.mcq = Object.values(response['body']['mcq']);
        this.questionStats.trueFalse = Object.values(response['body']['trueFalse']);
        this.questionStats.codingQuestion = Object.values(response['body']['codingQuestion']);
      }
    },error=>{
      console.log(error);
    });

    this.showSpinner = false;
  }

  moveBack(){
    this.router.navigateByUrl('/home');
  }

  navToTest(){
    this.router.navigateByUrl(`/course/${this.code}/tests/${this.testId}/settings`);
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
