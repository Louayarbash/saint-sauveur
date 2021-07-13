import { Component, OnInit, NgZone } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, LoadingController } from '@ionic/angular';
import { PasswordValidator } from '../../validators/password.validator';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { FeatureService } from '../../services/feature/feature.service';
import { LoginService } from '../../services/login/login.service';
import { BuildingModel } from '../../buildings/building/building.model';
import { UserModel } from '../../users/user/user.model';
import firebase from 'firebase/app';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: [
    './styles/sign-up.page.scss'
  ]
})
export class SignUpPage implements OnInit {
  signupForm: FormGroup;
  matching_passwords_group: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;
  buildingData: BuildingModel = new BuildingModel();
  userData: UserModel = new UserModel();

  validation_messages = {
    'name': [
      { type: 'required', message: 'Name is required.' }
    ],
    'firstname': [
      { type: 'required', message: 'Firstname is required.' }
    ],
    'lastname': [
      { type: 'required', message: 'Lastname is required.' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 6 characters long.' }
    ],
    'confirm_password': [
      { type: 'required', message: 'Confirm password is required' }
    ],
    'matching_passwords': [
      { type: 'areNotEqual', message: 'Password mismatch' }
    ]
  };

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
  ) {
    this.matching_passwords_group = new FormGroup({
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      'confirm_password': new FormControl('', Validators.required)
    }, (formGroup: FormGroup) => {
      return PasswordValidator.areNotEqual(formGroup);
    });

    this.signupForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'firstname': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'lastname': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'name': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'matching_passwords': this.matching_passwords_group
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
    this.menu.enable(false);
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user to the profile page
  redirectLoggedUserToMainMenuPage() {
    this.dismissLoading();

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      // Get previous URL from our custom History Helper
      // If there's no previous page, then redirect to profile
      // const previousUrl = this.historyHelper.previousUrl || 'start-menu';

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      // Navigate to profile and replace current url with profile
      this.router.navigate(['start-menu'], { replaceUrl: true });
    });
  }

/*   async presentLoading(authProvider?: string) {
    const authProviderCapitalized = authProvider[0].toUpperCase() + authProvider.slice(1);
    this.redirectLoader = await this.loadingController.create({
      message: authProvider ? 'Signing up with ' + authProviderCapitalized : 'Signin up ...'
    });
    await this.redirectLoader.present();
  } */
  async presentLoading() {
    this.redirectLoader = await this.loadingController.create({
      message: this.featureService.translations.SigninIn
    });
    await this.redirectLoader.present();
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  resetSubmitError() {
    this.submitError = null;
  }

  // Before invoking auth provider redirect flow, present a loading indicator and add a flag to the path.
  // The precense of the flag in the path indicates we should wait for the auth redirect to complete.
/*   prepareForAuthWithProvidersRedirection(authProvider: string) {
    this.presentLoading(authProvider);

    this.location.go(this.location.path(), 'auth-redirect=' + authProvider, this.location.getState());
  } */

  manageAuthWithProvidersErrors(errorMessage: string) {
    this.submitError = errorMessage;
    // remove auth-redirect param from url
    this.location.replaceState(this.router.url.split('?')[0], '');
    this.dismissLoading();
  }

  signUpWithEmail() {
    this.presentLoading();
    this.resetSubmitError();
    const values = this.signupForm.value;
    this.authService.signUpWithEmail(values.email, values.matching_passwords.password)
    .then(user => {
      let userId= user.user.uid
      this.createProfile(userId);
    })
    .catch(error => {
      this.dismissLoading();
      this.submitError = error.message;
      this.featureService.presentToast(this.featureService.translations.SignUpProblem, 2000)
    });
  }

  createProfile(uid: string){
    this.buildingData.name= this.signupForm.value.name;
    this.buildingData.createDate= firebase.firestore.FieldValue.serverTimestamp();
    this.buildingData.createdBy = uid;
    this.userData.firstname= this.signupForm.value.firstname;
    this.userData.lastname= this.signupForm.value.lastname;
    this.userData.email= this.signupForm.value.email;
    this.userData.role= 'admin';
    this.userData.status= 'active';
    this.userData.createDate= firebase.firestore.FieldValue.serverTimestamp();
    this.featureService.createItem('buildings', this.buildingData)
    .then((building: any) => {
      this.userData.buildingId= building.id
      this.featureService.createItem('users', this.userData, uid)
      .then(() => {
        // this.redirectLoggedUserToStartMenu();
        this.featureService.presentToast(this.featureService.translations.UserAddedSuccessfully, 2000);
  
        this.loginService.initializeApp(uid).then(canAccessApp => {
          if(canAccessApp){
            console.log("inside signUp WithEmail canAccessApp true");
            this.authService.canAccessApp.next(true);
            // console.log(this.authService.canAccessApp.value);
            this.redirectLoggedUserToMainMenuPage();
          }
          else{
            this.dismissLoading();
            console.log("inside signUp WithEmail canAccessApp false");
            this.authService.canAccessApp.next(false);
            this.featureService.presentToast(this.featureService.translations.CantAccesApp, 2000)
          }
        }
        )
        .catch((err )=> {
          this.dismissLoading();
          console.log(err);
          this.featureService.presentToast(this.featureService.translations.InitializingAppProblem, 2000)});
      }).catch((err) => { 
        this.dismissLoading();
        console.log(err);
        this.featureService.presentToast(this.featureService.translations.AddingUserErrors, 2000);}); 
    }).catch((err) => { 
      this.dismissLoading();
      console.log(err);
      this.featureService.presentToast(this.featureService.translations.AddingBuildingErrors, 2000);});  
  }

  openLanguageChooser(){
    this.featureService.openLanguageChooser();
  }
/* 
  doFacebookSignup(): void {
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

  doGoogleSignup(): void {
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

  doTwitterSignup(): void {
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
  changeLanguage(lang: string){
    this.featureService.changeLanguage(lang);
  }
}
