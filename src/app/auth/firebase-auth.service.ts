import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of, Subject, from } from 'rxjs';
import { DataStore } from '../shell/data-store';
import { FirebaseProfileModel } from './profile/firebase-profile.model';
import { Platform } from '@ionic/angular';

import { User, auth } from 'firebase/app';
//import { cfaSignIn, cfaSignOut, mapUserToUserInfo } from 'capacitor-firebase-auth';

@Injectable()
export class FirebaseAuthService {

  currentUser: User;
  userProviderAdditionalInfo: any;
  profileDataStore: DataStore<FirebaseProfileModel>;
  redirectResult: Subject<any> = new Subject<any>();

  constructor(
    public angularFire: AngularFireAuth,
    public platform: Platform
  ) {
    this.angularFire.auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.currentUser = user;
      } else {
        // No user is signed in.
        this.currentUser = null;
      }
    });

    if (!this.platform.is('capacitor')) {
      // when using signInWithRedirect, this listens for the redirect results
      this.angularFire.auth.getRedirectResult()
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
      return from(this.angularFire.auth.signOut());
    // }
  }

  signInWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.auth.signInWithEmailAndPassword(email, password);
  }

  signUpWithEmail(email: string, password: string): Promise<auth.UserCredential> {
    return this.angularFire.auth.createUserWithEmailAndPassword(email, password);
  }

  socialSignIn(providerName: string, scopes?: Array<string>): Observable<any> {
/*     if (this.platform.is('capacitor')) {
      return cfaSignIn(providerName);
    } else { */
      const provider = new auth.OAuthProvider(providerName);

      if (scopes) {
        scopes.forEach(scope => {
          provider.addScope(scope);
        });
      }

      if (this.platform.is('desktop')) {
        return from(this.angularFire.auth.signInWithPopup(provider));
      } else {
        // web but not desktop, for example mobile PWA
        return from(this.angularFire.auth.signInWithRedirect(provider));
      }
    }
  

  signInWithFacebook() {
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
  }

  public getProfileStore(dataSource: Observable<FirebaseProfileModel>): DataStore<FirebaseProfileModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseProfileModel = new FirebaseProfileModel();
    this.profileDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.profileDataStore.load(dataSource);
    return this.profileDataStore;
  }
}