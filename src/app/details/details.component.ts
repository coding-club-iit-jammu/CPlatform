import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { MaterialComponentService } from '../services/material-component.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

    form: FormGroup;
    showSpinner:boolean = false;
    
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private http: HttpClient,
        private storeInfo: StoreInfoService,
        private matComp: MaterialComponentService
      ) {
    }

    async ngOnInit() {
      this.showSpinner = true;
      this.form = this.formBuilder.group({
        name : this.formBuilder.control('', Validators.required),
        branch: this.formBuilder.control('', Validators.required),
        email: this.formBuilder.control('',Validators.required),
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
    if(data.confirmPassword === data.password){
      const options = {
        observe : 'response' as 'body',
        headers: new HttpHeaders({
          'Content-Type':  'application/json'
        })
      };
      this.http.post(this.storeInfo.serverUrl + '/createUser',data, options).subscribe((response)=>{
        if(response['status']==201){
          this.matComp.openSnackBar('Verification Email set to your email.', 2500);
        } else if(response['status']==200){
          this.matComp.openSnackBar('User Already Registered.',2500);
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
