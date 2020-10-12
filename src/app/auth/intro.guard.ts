import { Injectable } from '@angular/core';
import {  CanLoad, Router } from '@angular/router';
// import { map } from 'rxjs/operators';
// import { AuthService } from './auth.service';
// import { LoginService } from '../services/login/login.service';
// import { FeatureService } from '../services/feature/feature.service';
import { Storage } from '@ionic/storage';
export const INTRO_KEY = 'intro-seen';

@Injectable()
export class IntroGuard implements CanLoad {

  constructor(
    // private authService: AuthService,
    private router: Router,
    private storage: Storage
  ) {}

  async canLoad(){
    const hasSeenIntro= await this.storage.get(INTRO_KEY);
    console.log("hasSeenIntro",hasSeenIntro);
    // console.log("hasSeenIntro.value",hasSeenIntro.value);
    if(hasSeenIntro){
        return true;
    }
    else {
        console.log('walkthrough not seen');
        this.router.navigate(['/walkthrough'], { replaceUrl: true });
        return false;
    }
  }
}
/*   canActivate(): boolean {

    // check if user is authenticated
    if (this.authService.getLoggedInUser() != null) {
      console.log('current user ', this.authService.currentUser);
      console.log('logged in ', this.authService.angularFire.currentUser);
      return true;
    } else {
      console.log('current user ', this.authService.currentUser);
      console.log('not logged in ', this.authService.angularFire.currentUser);
      // Navigate to the login page
      this.router.navigate(['/auth/sign-in']);
      return false;
  }

} */

