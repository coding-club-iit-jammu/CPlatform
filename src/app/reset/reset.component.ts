import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {
  _id : String;
  token : String;
  form: FormGroup;
  showSpinner:boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private storeInfo: StoreInfoService,
    private matComp: MaterialComponentService
  ) { }

  ngOnInit() {
    this.showSpinner = true;
    this._id = this.activatedRoute.snapshot.paramMap.get('_id').toString();
    this.token = this.activatedRoute.snapshot.paramMap.get('token').toString();
    this.location.go('/reset')
    this.form = this.formBuilder.group({
      password: this.formBuilder.control('',Validators.required),
      confirmPassword: this.formBuilder.control('',Validators.required)
    });
    if(sessionStorage.getItem('token')){
      this.router.navigateByUrl('/home');
      return;
    }
    this.showSpinner = false;

  }
  async onSubmit(data) {
    this.showSpinner = true;
    var reset_token = this._id + "/" + this.token;
    if(data.confirmPassword === data.password){
      const options = {
        observe : 'response' as 'body',
        headers: new HttpHeaders({
          'Content-Type':  'application/json',
          'Reset-token' : this.token.toString(),
          'User-ID' : this._id.toString()
        })
      };
      this.http.post(this.storeInfo.serverUrl + '/changePassword',data, options).subscribe((response)=>{
        console.log(response)
        if(response['status']==200){
          this.matComp.openSnackBar('Password Changed Successfuly!', 2500);
        } else{
          this.matComp.openSnackBar(response['message'],2500);
        }
        this.router.navigate(['/']);
        this.showSpinner = false;
      },error=>{
        // console.log(error);
        this.matComp.openSnackBar(error.error.message,2500);
        this.showSpinner = false
      })

    } else {
      this.showSpinner = false;
    }
  }
  navToLogin(){
    this.router.navigate(['/']);
  }

}
