import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StoreInfoService } from '../services/store-info.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  _id : String;
  token : String;
  showSpinner:boolean = false;
  verf_status : String = "Wait...";
  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private storeInfo: StoreInfoService,
    private router: Router
  ) { }

  ngOnInit() {
    this.verf_status = "Verifying...";
    this._id = this.activatedRoute.snapshot.paramMap.get('_id').toString();
    this.token = this.activatedRoute.snapshot.paramMap.get('token').toString();
    this.location.go('/verify')
    const options = {
      observe : 'response' as 'body',
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Verify-token' : this.token.toString(),
        'User-ID' : this._id.toString()
      })
    };
    
    this.http.post(this.storeInfo.serverUrl + '/verify', {}, options).subscribe((response)=>{
      this.verf_status = response["body"]["message"] + " Redirecting in 5 sec..";
      setTimeout(() => {
          this.router.navigate(['/']);
      }, 5000);  //5s
    },error=>{
      this.verf_status = error;
    })
  }

}
