import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { StoreInfoService }  from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  
  showSpinner:boolean = false;
  showSpinner1:boolean = false;
  
  constructor
    (
      private formBuilder: FormBuilder, 
      private router: Router,
      private http: HttpClient,
      private storeInfo: StoreInfoService,
      private material: MaterialComponentService
    ){ 
      
    }

  async ngOnInit() {
    if(this.storeInfo.isSignedIn()){
      this.router.navigateByUrl('/home');
      return;
    }
    this.showSpinner = true;
    this.form = this.formBuilder.group({
      email : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
    this.showSpinner = false;
  }

  async login(){
    this.showSpinner1 = true;
    this.http.post(this.storeInfo.serverUrl + '/login',this.form.value).pipe().subscribe((data)=>{
      this.showSpinner1 = false;
      if(!data["userId"]){
        this.material.openSnackBar(data['message'],2000);
        this.router.navigateByUrl('/');
        return;
      }
      
      this.storeInfo.setToken(data['token']);
      this.storeInfo.setRefreshToken(data['refreshToken']);
      this.router.navigateByUrl('/home');
    },error =>{
      this.showSpinner1 = false;
      this.material.openSnackBar(error['statusText'],3000);
    })
  }

  reset(){
    this.form = this.formBuilder.group({
      email : this.formBuilder.control(''),
      password : this.formBuilder.control('')
    });
  }

  signUp(){
    this.router.navigate(['signup']);
  }
}
