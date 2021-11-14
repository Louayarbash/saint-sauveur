import { Component, OnInit, NgZone } from '@angular/core';
import { Location } from '@angular/common';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { FeatureService } from '../../services/feature/feature.service';
//import { HistoryHelperService } from '../../utils/history-helper.service';
import { AuthService } from '../auth.service';
import { LoginService } from '../../services/login/login.service';
// import { map } from 'rxjs/operators';
import { FcmService } from '../../services/fcm/fcm.service';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.page.html',
  styleUrls: [
    './styles/sign-in.page.scss'
  ]
})
export class SignInPage implements OnInit {
  loginForm: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;
  loading: any;
  validation_messages= {
    'email': [
      { type: 'required', message: "EmailRequired" },
      { type: 'pattern', message: "EnterValidEmail" }
    ], 
    'password': [
      { type: 'required', message: "PasswordIsRequired" },
      { type: 'minlength', message: "PasswordMustBeAtLeast6charactersLong" }
    ]
  }; 
  username: string;

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public menu: MenuController,
    public authService: AuthService,
    private ngZone: NgZone,
    public loadingController: LoadingController,
    public location: Location,
    private featureService: FeatureService,
    private loginService: LoginService,
    private fcmService: FcmService
  //  public historyHelper: HistoryHelperService
  ) {
    /* this.authService.angularFire.onAuthStateChanged((user) => {
      if (user) {
        this.ngZone.run(() => {
        this.router.navigate(['start-menu']);
        console.log("onAuthStateChanged sign in", user)
        // User is signed in.
        this.authService.currentUser = user;
        });
      } 
      else {
        console.log("onAuthStateChanged sign in else", user)
        // No user is signed in.
        this.authService.currentUser = null;
      }
    }); */
    
    // this.username = this.authService.currentUser.email;
    
    this.loginForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ]))
    });

    // Get firebase authentication redirect result invoken when using signInWithRedirect()
    // signInWithRedirect() is only used when client is in web but not desktop
/*     this.authRedirectResult = this.authService.getRedirectResult()
    .subscribe(result => {
      if (result.user) {
        this.redirectLoggedUserToMainMenuPage();
      } else if (result.error) {
        this.manageAuthWithProvidersErrors(result.error);
      }
    }); */

    // Check if url contains our custom 'auth-redirect' param, then show a loader while we receive the getRedirectResult notification
/*     this.route.queryParams.subscribe(params => {
      const authProvider = params['auth-redirect'];
      if (authProvider) {
        this.presentLoading(authProvider);
      }
    }); */
  }

  ngOnInit(): void {
    console.log('sign in oninit');
    this.menu.enable(false);
/*     this.validation_messages = {
      'email': [
        { type: 'required', message: this.featureService.translations.EmailRequired },
        { type: 'pattern', message: this.featureService.translations.EnterValidEmail }
      ],
      'password': [
        { type: 'required', message: this.featureService.translations.PasswordIsRequired },
        { type: 'minlength', message: this.featureService.translations.PasswordMustBeAtLeast6charactersLong }
      ]
    }; */
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user to the profile page
  async redirectLoggedUserToMainMenuPage() {
    //await this.dismissLoading();
    await this.loading.then(res=>{
      res.dismiss();        
    })

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      // Get previous URL from our custom History Helper
      // If there's no previous page, then redirect to profile
      // const previousUrl = this.historyHelper.previousUrl || 'firebase/auth/profile';
      // const previousUrl = 'app/categories';
      // const previousUrl = 'start-menu';

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      // Navigate to profile and replace current url with profile
      this.router.navigate(['/app/start-menu'], { replaceUrl: true });
    });
  }

  //async presentLoading(/*authProvider?: string*/) {
    // const authProviderCapitalized = authProvider[0].toUpperCase() + authProvider.slice(1);
    //this.redirectLoader = await this.loadingController.create({
      //message: "Signin in ..."
      // message: authProvider ? 'Signing in with ' + authProviderCapitalized : 'Signin in ...'
    //});
   // await this.redirectLoader.present();
  //}

   //async dismissLoading() {
    // console.log("dissmiss 100")
    //if (this.redirectLoader) {
      //console.log("dissmiss 2")
      // console.log('Bonga');
    //   return this.redirectLoader.dismiss();
    //}
  //}

  // Before invoking auth provider redirect flow, present a loading indicator and add a flag to the path.
  // The precense of the flag in the path indicates we should wait for the auth redirect to complete.
/*   prepareForAuthWithProvidersRedirection(authProvider: string) {
    this.presentLoading(authProvider);

    this.location.replaceState(this.location.path(), 'auth-redirect=' + authProvider, this.location.getState());
  } */

  manageAuthWithProvidersErrors(errorMessage: string) {
    this.submitError = errorMessage;
    // remove auth-redirect param from url
    this.location.replaceState(this.router.url.split('?')[0], '');
    //this.dismissLoading();
    this.loading.then(res=>{
      res.dismiss();        
    })
  }

  resetSubmitError() {
    this.submitError = null;
  }

  signInWithEmail() {
    this.loading = this.featureService.presentLoadingWithOptions(5000);
    this.resetSubmitError();
    //console.log(this.loginForm.value['email']);
    //console.log(this.loginForm.value['password']);
    this.loginForm.value['email'], this.loginForm.value['password']
    this.authService.signInWithEmail(this.loginForm.value['email'], this.loginForm.value['password'])
    .then(user => {
    
      console.log("inside signInWithEmail", user);
      this.loginService.initializeApp(user.user.uid).then(canAccessApp => {
        if(canAccessApp){

          if(this.loginService.notificationsAllowed()){
            //alert('notificationsAllowed()' + this.loginService.notificationsAllowed());
            this.fcmService.initPushNotification();
          }

          this.authService.canAccessApp.next(true);
          // console.log("inside signInWithEmail canAccessApp true", this.authService.canAccessApp.getValue());
          // console.log("inside signInWithEmail canAccessApp true", this.authService.canAccessApp.value);
          // console.log(this.authService.canAccessApp.value);
          this.redirectLoggedUserToMainMenuPage();
        }
        else{
          this.loading.then(res=>{
            res.dismiss();
            this.authService.canAccessApp.next(false);
            this.featureService.presentToast(this.featureService.translations.ProblemAccessingParkondo, 2000)          
          })
/*           this.dismissLoading().then(()=>{

          }) */
          
          console.log("inside signInWithEmail canAccessApp false", this.authService.canAccessApp.value);
          
          
        }
      }
      )
      .catch(()=> {
        //this.dismissLoading();
        this.loading.then(res=>{
          res.dismiss();        
        })
        this.featureService.presentToast(this.featureService.translations.ProblemVerifyingBuildinOrUserInfo , 2000)});
    })
    .catch(error => {
      console.log(error);
      this.submitError = error.message;
      //this.dismissLoading();
      this.loading.then(res=>{
        res.dismiss();        
      })
    });
  }

  /* doFacebookLogin(): void {
    this.resetSubmitError();
    this.prepareForAuthWithProvidersRedirection('facebook');

    this.authService.signInWithFacebook()
    .subscribe((result) => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      // const token = result.credential.accessToken;
      this.redirectLoggedUserToProfilePage();
    }, (error) => {
      this.manageAuthWithProvidersErrors(error.message);
    });
  }

  doGoogleLogin(): void {
    this.resetSubmitError();
    this.prepareForAuthWithProvidersRedirection('google');

    this.authService.signInWithGoogle()
    .subscribe((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // var token = result.credential.accessToken;
      this.redirectLoggedUserToProfilePage();
    }, (error) => {
        console.log(error);
      this.manageAuthWithProvidersErrors(error.message);
    });
  }

  doTwitterLogin(): void {
    this.resetSubmitError();
    this.prepareForAuthWithProvidersRedirection('twitter');

    this.authService.signInWithTwitter()
    .subscribe((result) => {
      // This gives you a Twitter Access Token. You can use it to access the Twitter API.
      // var token = result.credential.accessToken;
      this.redirectLoggedUserToProfilePage();
    }, (error) => {
      console.log(error);
      this.manageAuthWithProvidersErrors(error.message);
    });
  } */
  openLanguageChooser(){
    this.featureService.openLanguageChooser();
  }
  changeLanguage(lang: string){
    this.featureService.changeLanguage(lang);
  }
  signOut(){
    this.authService.signOut();
  }
}
