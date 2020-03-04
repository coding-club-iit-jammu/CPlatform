import { Injectable } from '@angular/core';
import { auth } from 'firebase/app';
import { AngularFireAuth } from "@angular/fire/auth";

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  userState: any;

  constructor(
    public afAuth: AngularFireAuth
  ) {    
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userState = user;
        localStorage.setItem('user', JSON.stringify(this.userState));
        JSON.parse(localStorage.getItem('user'));
      } else {
        localStorage.setItem('user', null);
        JSON.parse(localStorage.getItem('user'));
      }
    })
  }

  // Auth provider
  AuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
    .then((res) => {
      console.log(res)
    }).catch((error) => {
      console.log(error)
    })
  }  

  // Login with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }  

  // Signin with email/password
  SignIn(email, password) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log(res)
      }).catch((error) => {
        console.log(error)
      })
  }

  // Sign out 
  SignOut() {
    return this.afAuth.auth.signOut().then(() => {
      localStorage.removeItem('user');
    })
  }

}