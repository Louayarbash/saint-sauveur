import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  canActivate(){
      return this.authService.angularFire.authState.pipe(
        map((auth) => {
          if(auth){
            console.log("authguard true", auth)
            return true;
          }
          else{
            console.log("authguard false", auth)
            this.router.navigate(['/auth/sign-in']);
            return false;
          }
        } )

      );
    
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
}
