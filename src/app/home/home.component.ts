import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  httpOptions: any;
  showSpinner: Boolean = false;

  addCourseForm: FormGroup;
  studentAccessCode: FormArray = new FormArray([]);
  joinCourseForm: FormGroup;

  userData: any = {
    name : '',
    branch : '',
    email : '',
    courses: {
      teaching: [],
      teachingAssistant: [],
      studying : []
    }
  }
  constructor(private http: HttpClient,
              private storeInfo: StoreInfoService,
              private formBuilder: FormBuilder,
              private router: Router,
              private matComp: MaterialComponentService
              ) { 
              }

  ngOnInit() {
    this.resetJoinCourseForm();
    this.resetAddCourseForm();
  
    if(!sessionStorage.getItem('token')){
      this.router.navigateByUrl('/');
    }

    this.fetchUserData();
  }

  async addCourse(){
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      headers : new HttpHeaders({
        'Authorization' : 'Bearer ' + sessionStorage.getItem('token')
      })
    }
    await this.http.post(this.storeInfo.serverUrl + '/course/add',this.addCourseForm.value,options)
    .toPromise().then((data)=>{
      this.matComp.openSnackBar(data['body']['message'],2000);
      if(data['status'] == 201)
        this.resetAddCourseForm();
      
    },(error)=>{
      this.matComp.openSnackBar(error['message'],3000);
    })
    this.showSpinner = false;
  }

  async joinCourse(){
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      headers : new HttpHeaders({
        'Authorization' : 'Bearer ' + sessionStorage.getItem('token')
      })
    }
    
    await this.http.post(this.storeInfo.serverUrl + '/course/join',this.joinCourseForm.value,options)
    .toPromise().then((data)=>{
      this.matComp.openSnackBar(data['body']['message'],2000);
      if(data['status'] == 202){
        this.fetchUserData();
        this.resetJoinCourseForm();
      }
      
    },(error)=>{
      this.matComp.openSnackBar(error['statusText'],2000);
    })
    this.showSpinner = false;
  }



  async fetchUserData(){
    this.showSpinner = true;
    const options = {
      observe : 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    await this.http.get(this.storeInfo.serverUrl + '/user/get',options).toPromise().then((data)=>{
      if(data['status'] == 200){
        this.userData = data['body'];
        this.storeInfo.userData = data['body'];
      } else {
        this.matComp.openSnackBar(data['body']['message'],2000);
      }
    }, error =>{
      this.matComp.openSnackBar('Network Problem!',2000);
    });
    this.showSpinner = false;
  }

  
  resetAddCourseForm(){
    this.addCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      title : this.formBuilder.control(''),
      instructorCode : this.formBuilder.control(''),
      teachingAssistantCode: this.formBuilder.control(''),
      studentCode: new FormArray([])
    });
  }
  
  addGroupCode(){
    let arraay = this.addCourseForm.get('studentCode') as FormArray; 
    let l = arraay.length;
    let fg = this.formBuilder.group({
      groupId: this.formBuilder.control("G"+(l+1)),
      code: this.formBuilder.control('')
    })
    arraay.push(fg);
  }

  resetStudentAccessCode(){
    let arraay = this.addCourseForm.get('studentCode') as FormArray; 
    arraay.clear();
  }

  resetJoinCourseForm(){
    this.joinCourseForm = this.formBuilder.group({
      code : this.formBuilder.control(''),
      joiningCode: this.formBuilder.control('')
    }); 
  }

  openCourse(code,role){
    this.router.navigate(['/course',code]);
  }

  signOut(){
    this.storeInfo.signOut();
    this.router.navigateByUrl('/');
  }
}
