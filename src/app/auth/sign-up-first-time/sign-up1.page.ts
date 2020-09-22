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
// import { sendInvitationEmails } from 'functions/src';

@Component({
  selector: 'app-sign-up1',
  templateUrl: './sign-up1.page.html',
  styleUrls: [
    './styles/sign-up1.page.scss'
  ]
})
export class SignUp1Page implements OnInit {
  signup1Form: FormGroup;
  matching_passwords_group: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;
  buildingData: BuildingModel = new BuildingModel();
  userData: UserModel = new UserModel();

  validation_messages = {
    'firstname': [
      { type: 'required', message: this.featureService.translations.FirstnameRequired }
    ],
    'lastname': [
      { type: 'required', message: this.featureService.translations.LastnameRequired }
    ],
    'email': [
      { type: 'required', message: this.featureService.translations.EmailRequired },
      { type: 'pattern', message: this.featureService.translations.EnterValidEmail }
    ],
/*     'invitationCode': [
      { type: 'required', message: this.featureService.translations.InvitationCodeRequired }
    ], */
    'password': [
      { type: 'required', message: this.featureService.translations.PasswordIsRequired },
      { type: 'minlength', message: this.featureService.translations.PasswordMustBeAtLeast6charactersLong }
    ],
    'confirm_password': [
      { type: 'required', message: this.featureService.translations.ConfirmPasswordIsRequired }
    ],
    'matching_passwords': [
      { type: 'areNotEqual', message: this.featureService.translations.PasswordMismatch }
    ]
  };
  // emailIsValid: boolean;
  emailFound: boolean= false;
  buildingId: string;

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

    this.signup1Form = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
/*       'invitationCode': new FormControl('', Validators.compose([
        Validators.required
      ])), */
      'firstname': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'lastname': new FormControl('', Validators.compose([
        Validators.required
      ])),
      'matching_passwords': this.matching_passwords_group
    });

    // Get firebase authentication redirect result invoken when using signInWithRedirect()
    // signInWithRedirect() is only used when client is in web but not desktop
    this.authRedirectResult = this.authService.getRedirectResult()
    .subscribe(result => {
      if (result.user) {
        this.redirectLoggedUserToStartMenu();
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
  redirectLoggedUserToStartMenu() {
    this.dismissLoading();

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      // Get previous URL from our custom History Helper
      // If there's no previous page, then redirect to profile
      // const previousUrl = this.historyHelper.previousUrl || 'firebase/auth/profile';
      // const previousUrl = 'start-menu';

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      // Navigate to profile and replace current url with profile
      this.router.navigate(['start-menu'], { replaceUrl: true });
    });
  }

  async presentLoading(authProvider?: string) {
    const authProviderCapitalized = authProvider[0].toUpperCase() + authProvider.slice(1);
    this.redirectLoader = await this.loadingController.create({
      message: authProvider ? 'Signing up with ' + authProviderCapitalized : 'Signin up ...'
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
  prepareForAuthWithProvidersRedirection(authProvider: string) {
    this.presentLoading(authProvider);

    this.location.go(this.location.path(), 'auth-redirect=' + authProvider, this.location.getState());
  }

  manageAuthWithProvidersErrors(errorMessage: string) {
    this.submitError = errorMessage;
    // remove auth-redirect param from url
    this.location.replaceState(this.router.url.split('?')[0], '');
    this.dismissLoading();
  }

  signUpUserWithEmail(): void {
    this.resetSubmitError();
    const values = this.signup1Form.value;
    this.authService.signUpWithEmail(values.email, values.matching_passwords.password)
      .then(user => {
        let userId= user.user.uid
        this.createUserProfile(user.user.uid);
        this.loginService.getUserInfo(userId).then(res =>{
          console.log(res.buildingId);
          this.redirectLoggedUserToStartMenu();
        }
        )
        .catch(err=> console.log(err))
        // navigate to user profile
        // this.redirectLoggedUserToProfilePage();
      })
      .catch(error => {
        this.submitError = error.message;
      });
  }

  createUserProfile(uid: string){

    this.userData.buildingId= this.buildingId;
    this.userData.firstname= this.signup1Form.value.firstname;
    this.userData.lastname= this.signup1Form.value.lastname;
    this.userData.email= this.signup1Form.value.email;
    this.userData.role= 'user';
    this.userData.createDate= firebase.firestore.FieldValue.serverTimestamp();

    this.featureService.createItem('users', this.userData, uid)
    .then(() => {
      this.redirectLoggedUserToStartMenu();
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      // loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      console.log(err);
     });
  }

  openLanguageChooser(){
/*     console.log('1',this.signupForm.get('email').hasError('required')) 
    console.log('2',this.signupForm.get('email').hasError('pattern'))
    console.log('3',this.signupForm.get('email').hasError('pattern') && this.signupForm.get('email').hasError('required')) */
    this.featureService.openLanguageChooser();
  }

  checkEmail(){
    this.featureService.checkEmail(this.signup1Form.value.email)
    // .toPromise().then((result)=> {
      .subscribe((result: any[])=> { 
      console.log(result, /*result.lenght*/); 
      if(result.length > 0) { 
        this.buildingId = result[0].buildingId;
        console.log("result", result.length); 
        // this.emailIsValid= true; 
        this.emailFound= true;
        this.featureService.presentToast(this.featureService.translations.EmailFound + this.buildingId, 2000);
      }
      else{
        this.featureService.presentToast(this.featureService.translations.NoInvitaionFound, 2000);
      }
    }
    )
    // .catch(err => console.log(err));
  }
  changeLanguage(lang: string){
    this.featureService.changeLanguage(lang);
  }

}
