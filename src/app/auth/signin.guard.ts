import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
// import { LoginService } from '../services/login/login.service';
// import { FeatureService } from '../services/feature/feature.service';
// import { Storage } from '@ionic/storage';
import { LoginService } from '../services/login/login.service';
import { FeatureService } from '../services/feature/feature.service';
// import { BehaviorSubject } from 'rxjs';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { FcmService } from '../services/fcm/fcm.service';


@Injectable()
export class SignInGuard implements CanLoad {
// a= new BehaviorSubject(true);
  constructor(
    private splashScreen: SplashScreen,
    private authService: AuthService,
    private router: Router,
    private loginService: LoginService,
    private featureService: FeatureService,
    private fcmService: FcmService
  ) {}

    canLoad(){
    console.log("inside sign in guard");
    // return true;
     return this.authService.angularFire.authState.pipe(
      take(1),
      map((auth) => {
        if(!auth){
          return true;
        }
         else {
          this.loginService.initializeApp(auth.uid).then(canAccessApp => {
          if(canAccessApp){
            //alert('canAccessApp' + canAccessApp);
            this.splashScreen.hide();
            console.log("notificationsAllowed", this.loginService.notificationsAllowed());
            if(this.loginService.notificationsAllowed()){
              //alert('notificationsAllowed()' + this.loginService.notificationsAllowed());
              this.fcmService.initPushNotification();
            }
              this.authService.canAccessApp.next(true);
              this.router.navigate(['start-menu'], { replaceUrl: true });
            }
            else {
                this.featureService.presentToast('cant acces the app from sign in guard', 2000);
                this.authService.signOut().subscribe(() => {
                  // Sign-out successful.
                  // Replace state as we are no longer authorized to access profile page.
                  this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
                }, (error) => {
                  console.log('signout error', error);
                });
            }
          }
          )
          .catch((err )=> { this.featureService.presentToast('problem while verifying building or user info. from sign in guard error: '+ err, 2000); return true;})
    }
    }
    )
    )  
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

