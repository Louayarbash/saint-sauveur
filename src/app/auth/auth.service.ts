import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, Subject, from, BehaviorSubject } from 'rxjs';
import { DataStore } from '../shell/data-store';
import { FirebaseProfileModel } from './profile/profile.model';
import { Platform } from '@ionic/angular';
//import { LoginService } from '../services/login/login.service';
// import { Router } from '@angular/router';


import { User, auth } from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
//import { cfaSignIn, cfaSignOut, mapUserToUserInfo } from 'capacitor-firebase-auth';

@Injectable()
export class AuthService {

  currentUser: User;
  userProviderAdditionalInfo: any;
  profileDataStore: DataStore<FirebaseProfileModel>;
  redirectResult: Subject<any> = new Subject<any>();
  canAccessApp: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(
    public angularFire: AngularFireAuth,
    public platform: Platform,
    // private loginService: LoginService,
    private afs: AngularFirestore,
    // private router: Router
  ) {
    this.angularFire.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("onAuthStateChanged serviceif user", user)
        let canAccessApp = await this.initializeApp(user.uid).then(res=> {return res});
        this.canAccessApp.next(canAccessApp);
        console.log("this.canAccessApp.value if user", this.canAccessApp.value)
        // User is signed in.
        // this.canAccessApp= true;
        this.currentUser = user;
      } 
      else {
        console.log("onAuthStateChanged service else", user)
        this.canAccessApp.next(false);
        console.log("this.canAccessApp.value", this.canAccessApp.value)
        // this.router.navigate(['auth/sign-in']);
        // No user is signed in.
        //this.canAccessApp= false;
        this.currentUser = null;
      }
    });

    if (!this.platform.is('capacitor')) { 
      // when using signInWithRedirect, this listens for the redirect results
      this.angularFire.getRedirectResult()
      .then((result) => {
        // result.credential.accessToken gives you the Provider Access Token. You can use it to access the Provider API.
        if (result.user) {
          this.userProviderAdditionalInfo = result.additionalUserInfo.profile;
          this.redirectResult.next(result);
        }
      }, (error) => {
        this.redirectResult.next({error: error.code});
      });
    }
  }

  getUserId(){
    return this.angularFire.user;
  }

  getRedirectResult(): Observable<any> {
    return this.redirectResult.asObservable();
  }

  public getProfileDataSource(): Observable<FirebaseProfileModel> {
    const userModel = new FirebaseProfileModel();
    const provierData = this.currentUser.providerData[0];

    const userData = this.userProviderAdditionalInfo ? this.userProviderAdditionalInfo : provierData;

    // Default imgs are too small and our app needs a bigger image
    switch (provierData.providerId) {
      case 'facebook.com':
        userModel.image = provierData.photoURL + '?height=400';
        break;
      case 'password':
        userModel.image = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
        break;
      case 'twitter.com':
        userModel.image = provierData.photoURL.replace('_normal', '_400x400');
        break;
      case 'google.com':
        userModel.image = provierData.photoURL.split('=')[0];
        break;
      default:
        userModel.image = provierData.photoURL;
    }

    userModel.name = userData.name || userData.displayName || 'What\'s your name?';
    userModel.role = 'How would you describe yourself?';
    userModel.description = userData.description || 'Anything else you would like to share with the world?';
    userModel.phoneNumber = userData.phoneNumber || 'Is there a number where I can reach you?';
    userModel.email = userData.email || 'Where can I send you emails?';
    userModel.provider = (provierData.providerId !== 'password') ? provierData.providerId : 'Credentials';

    return of(userModel);
  }

  // Get the currently signed-in user
  getLoggedInUser() {
    return this.currentUser;
  }

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

  // socialSignIn(providerName: string, scopes?: Array<string>): Observable<any> {
/*     if (this.platform.is('capacitor')) {
      return cfaSignIn(providerName);
    } else { */
  /*     const provider = new auth.OAuthProvider(providerName);

      if (scopes) {
        scopes.forEach(scope => {
          provider.addScope(scope);
        });
      }

      if (this.platform.is('desktop')) {
        return from(this.angularFire.signInWithPopup(provider));
      } else {
        // web but not desktop, for example mobile PWA
        return from(this.angularFire.signInWithRedirect(provider));
      }
    } */
  

/*   signInWithFacebook() {
    const provider = new auth.FacebookAuthProvider();
    return this.socialSignIn(provider.providerId);
  }

  signInWithGoogle() {
    const provider = new auth.GoogleAuthProvider();
    const scopes = ['profile', 'email'];
    return this.socialSignIn(provider.providerId, scopes);
  }

  signInWithTwitter() {
    const provider = new auth.TwitterAuthProvider();
    return this.socialSignIn(provider.providerId);
  } */

  public getProfileStore(dataSource: Observable<FirebaseProfileModel>): DataStore<FirebaseProfileModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseProfileModel = new FirebaseProfileModel();
    this.profileDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.profileDataStore.load(dataSource);
    return this.profileDataStore;
  }
  async initializeApp(uid: string)//: Promise<boolean> 
    {
    try {
      const user= await this.afs.firestore.collection("users").doc(uid).get();
      let userData= user.data();


      const building= await this.afs.firestore.collection("buildings").doc(userData.buildingId).get();
      let buildingData= building.data();
 
      // this.authService.canAccessApp = (this.userStatus == 'active' && this.buildingStatus =='active');
      return  (userData.status == 'active' && buildingData.status =='active')
    } 
    catch (err) {
      console.log(err);
    }
  }

}