import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, Subject, from, BehaviorSubject } from 'rxjs';
// import { DataStore } from '../shell/data-store';
// import { FirebaseProfileModel } from './profile/profile.model';
import { Platform } from '@ionic/angular';
//import { LoginService } from '../services/login/login.service';
import { Router } from '@angular/router';


import { User, auth } from 'firebase/app';
// import { AngularFirestore } from '@angular/fire/firestore';
//import { cfaSignIn, cfaSignOut, mapUserToUserInfo } from 'capacitor-firebase-auth';

@Injectable()
export class AuthService {

  currentUser: User;
  // userProviderAdditionalInfo: any;
  // profileDataStore: DataStore<FirebaseProfileModel>;
  // redirectResult: Subject<any> = new Subject<any>();
  canAccessApp: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    public angularFire: AngularFireAuth,
    public platform: Platform,
    // private loginService: LoginService,
    // private afs: AngularFirestore,
    private router: Router
  ) {
    this.angularFire.onAuthStateChanged((user) => {
      console.log('onAuthStateChanged');
      if (user) {
        this.canAccessApp.next(true);
        // User is signed in.
        this.currentUser = user;
      }
      else {
        this.canAccessApp.next(false);
        this.router.navigate(['auth/sign-in'], { replaceUrl: true });
        // No user is signed in.
        this.currentUser = null;
      }
    });
  }

/*   getUserId(){
    return this.angularFire.user;
  } */

  /* getRedirectResult(): Observable<any> {
    return this.redirectResult.asObservable();
  } */

  // Get the currently signed-in user
/*   getLoggedInUser() {
    return this.currentUser;
  } */

  signOut(): Observable<any> {
/*     if (this.platform.is('capacitor')) {
      return cfaSignOut();
    } else { */
      
      return from(this.angularFire.signOut());
    // }
  }

  signInWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.signInWithEmailAndPassword(email, password);
  }

  signUpWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.createUserWithEmailAndPassword(email, password);
  }

}