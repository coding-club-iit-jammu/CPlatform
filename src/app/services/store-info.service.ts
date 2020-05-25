import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class StoreInfoService {

  token:string;
  serverUrl: string;
  role = {
  };

  userid:string;
  constructor() {
    this.serverUrl = environment.serverUrl;
  }

  getToken(){
    return localStorage.getItem('token');
  }

  getRefreshToken(){
    return localStorage.getItem('refreshToken');
  }

  setToken(token){
    localStorage.setItem('token',token);
  }

  setRefreshToken(refreshToken){
    localStorage.setItem('refreshToken',refreshToken);
  }

  isSignedIn(){
    return this.getToken()?true:false;
  }


  signOut(){
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
  }


}
