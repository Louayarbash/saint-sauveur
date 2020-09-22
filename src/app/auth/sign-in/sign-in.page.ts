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

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 6 characters long.' }
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
    private loginService: LoginService
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
    this.authRedirectResult = this.authService.getRedirectResult()
    .subscribe(result => {
      if (result.user) {
        this.redirectLoggedUserToMainMenuPage();
      } else if (result.error) {
        this.manageAuthWithProvidersErrors(result.error);
      }
    });

    // Check if url contains our custom 'auth-redirect' param, then show a loader while we receive the getRedirectResult notification
    this.route.queryParams.subscribe(params => {
      const authProvider = params['auth-redirect'];
      if (authProvider) {
        this.presentLoading(authProvider);
      }
    });
  }

  ngOnInit(): void {
    this.menu.enable(false);
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user to the profile page
  redirectLoggedUserToMainMenuPage() {
    // this.dismissLoading();

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
      this.router.navigate(['start-menu'], { replaceUrl: true });
    });
  }

  async presentLoading(authProvider?: string) {
    const authProviderCapitalized = authProvider[0].toUpperCase() + authProvider.slice(1);
    this.redirectLoader = await this.loadingController.create({
      message: authProvider ? 'Signing in with ' + authProviderCapitalized : 'Signin in ...'
    });
    await this.redirectLoader.present();
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  // Before invoking auth provider redirect flow, present a loading indicator and add a flag to the path.
  // The precense of the flag in the path indicates we should wait for the auth redirect to complete.
  prepareForAuthWithProvidersRedirection(authProvider: string) {
    this.presentLoading(authProvider);

    this.location.replaceState(this.location.path(), 'auth-redirect=' + authProvider, this.location.getState());
  }

  manageAuthWithProvidersErrors(errorMessage: string) {
    this.submitError = errorMessage;
    // remove auth-redirect param from url
    this.location.replaceState(this.router.url.split('?')[0], '');
    this.dismissLoading();
  }

  resetSubmitError() {
    this.submitError = null;
  }

  signInWithEmail() {
    this.resetSubmitError();
    this.authService.signInWithEmail(this.loginForm.value['email'], this.loginForm.value['password'])
    .then(user => {
      console.log("inside signInWithEmail")
    // let userId= user.user.uid
/*       this.loginService.getUserInfo(userId).then(res =>{
      console.log(res.buildingId);
      // navigate to user profile
      this.redirectLoggedUserToMainMenuPage()
      
    }) 
      .catch(err=> console.log(err))*/
      this.redirectLoggedUserToMainMenuPage()
    })
    .catch(error => {
      console.log(error);
      this.submitError = error.message;
      this.dismissLoading();
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
