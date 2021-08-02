import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginService } from '../services/login/login.service';

@Injectable()
export class PageGuard implements CanLoad {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService
  ) {}


  canLoad(){
    console.log("inside page guard canAccessApp", this.authService.canAccessApp.value);
    return this.authService.canAccessApp.pipe(
      filter(res => res !== null),
      take(1),
      map((canAccessApp) => {
        console.log(this.loginService.getLoginName(),"inside page guard",)
        if(canAccessApp && this.loginService.getLoginID() !== "N/A"){
          console.log("canAccessApp if", canAccessApp);
          return true;
      }
      else {
        console.log("canAccessApp else", canAccessApp);
        this.router.navigate(['/auth/sign-in'],{ replaceUrl: true});
          return false;
      }
    })
    )
    /* if (this.authService.canAccessApp) {
      console.log('current user if', this.authService.currentUser);
      console.log('logged in ', this.authService.angularFire.currentUser);
      return true;
    } else {
      console.log('current user else', this.authService.currentUser);
      console.log('not logged in ', this.authService.angularFire.currentUser);
      // Navigate to the login page
      this.router.navigate(['/auth/sign-in'],{ replaceUrl: true});
      return false;
  } */

}
/*       return this.authService.angularFire.authState.pipe(
        take(1),
        map((auth) => {
          if(auth){
            console.log("page.guard true", auth)
            return true;
          }
          else{
            console.log("page.guard false", auth)
            this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
            return false;
          }
        } )

      ); */
    
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
