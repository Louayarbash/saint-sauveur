import { Injectable, NgZone } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { LoginService } from '../services/login/login.service';
import { FeatureService } from '../services/feature/feature.service';

@Injectable()
export class SignInGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private featureService: FeatureService,
    private ngZone: NgZone
  ) {}

  canActivate(){
      return this.authService.angularFire.authState.pipe(
        map((auth) => {
          
          if(!auth){
            console.log("sign in guard true", auth)
            return true;
          }
          else{
            
           this.loginService.getUserInfoObservable(auth.uid).subscribe(user => {
              if((user.status == 'active') && (user.buildingId)){
                this.loginService.userInfo= user;
                this.loginService.getBuildingInfoObservable(user.buildingId).subscribe(building=> {
                  
                  if(building.status=='active'){
                     this.ngZone.run(() => {
                    this.router.navigate(['start-menu']);
                   });
                  }
                  else{
                    this.featureService.presentToast('Building account is not active',3000);
                    this.authService.signOut()
/*                     .toPromise().then(() =>
                    this.ngZone.run(() => {
                     this.router.navigate(['auth/sign-in'])
                    }) 
                    ); */
                  }
                }); 
                
              }
              else{
                console.log("user is not active");
                this.featureService.presentToast('User status problem',3000);
                this.authService.signOut();
                  // this.ngZone.run(() => {
                    // this.router.navigate(['auth/sign-in']);
                  // }
              }
            })
          } 
         
          
        }));
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
