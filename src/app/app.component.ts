import { Component } from '@angular/core';
/*import { Plugins } from '@capacitor/core';
const { SplashScreen } = Plugins;*/
/*LA_ add for cordova*/
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
/*END*/
import { TranslateService /*, LangChangeEvent*/ } from '@ngx-translate/core';
import { FcmService } from '../app/services/fcm/fcm.service';
//import { Router } from '@angular/router';
//import { FCM } from '@ionic-native/fcm/ngx';
import { LanguageService } from './language/language.service';
// import { LoginService } from './services/login/login.service';
import { FeatureService } from './services/feature/feature.service';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: [
    './side-menu/styles/side-menu.scss',
    './side-menu/styles/side-menu.shell.scss',
    './side-menu/styles/side-menu.responsive.scss'
  ]
})
export class AppComponent {

  appPages = [
    {
      title: 'Categories',
      url: '/app/categories',
      ionicIcon: 'list-outline'
    },
    {
      title: 'Profile',
      url: '/app/user',
      ionicIcon: 'person-outline'
    },
   /*  {
      title: 'Contact Card',
      url: '/contact-card',
      customIcon: './assets/custom-icons/side-menu/contact-card.svg'
    }, */
    {
      title: 'Notifications',
      url: '/app/notifications',
      ionicIcon: 'notifications-outline'
    }
  ];
  accountPages = [
    {
      title: 'Log In',
      url: '/auth/sign-in',
      ionicIcon: 'log-in-outline'
    },
    {
      title: 'Sign Up',
      url: '/auth/sign-up',
      ionicIcon: 'person-add-outline'
    },
    {
      title: 'Tutorial',
      url: '/walkthrough',
      ionicIcon: 'school-outline'
    },
    {
      title: 'Getting Started',
      url: '/getting-started',
      ionicIcon: 'rocket-outline'
    }/* ,
    {
      title: '404 page',
      url: '/page-not-found',
      ionicIcon: 'alert-circle-outline'
    } */
  ];

  available_languages = [];
  translations;
  textDir = 'ltr';
  /* LA_ add for cordova platform splashScreen statusBar*/
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    // private oneSignal : OneSignal,
    // private alertController :AlertController,
    // private toastCtrl : ToastController,
    private fcmService : FcmService,
    // private router :Router,
    // private ngZone : NgZone,
    // private fcm : FCM,
    public languageService : LanguageService,
    // private loginService : LoginService,
    private featureService : FeatureService,
    // private angularFireAuth: AngularFireAuth,
    // private AuthService: AuthService
    // private afs : AngularFirestore
    ) {

    this.initializeApp();
    //this.setLanguage();
    
/*     platform.ready().then(() => {

    }

); */
}
   async initializeApp() {
    
    this.platform.ready().then(() => {

      this.setLanguage();
      //this.statusBar.styleDefault();
      this.statusBar.styleLightContent();
      this.splashScreen.hide();

      // Get a FCM token
      //fcmService.requestPermission();
      this.fcmService.getToken();

      //this.fcm.getToken();

      // Listen to incoming messages
      /* this.fcmService.listenToNotifications()
       .pipe(
        tap(msg => {
          // show a toast
          console.log("inside listenToNotifications wasTaped value is",msg.wasTapped);
          const toast = this.toastCtrl.create({
            message: msg.body,
            duration: 4000
          });
          toast.then(a=>{a.present()});
        })
      ).subscribe(a => {console.log(a)});  */
      //.toPromise().then(a=>{console.log(a)});
      //this.fcm.onNotification().subscribe(data => {
      this.fcmService.listenToNotifications();
    });
  }

/*   setupPush(){
    this.oneSignal.startInit('885c10e6-138a-4553-9c7d-bf17812dbceb', '373200357220');
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);

    this.oneSignal.handleNotificationReceived().subscribe(data => {
      let msg = data.payload.body;
      let title = data.payload.title;
      let additionalData = data.payload.additionalData;
      this.showAlert(title,msg,additionalData.foo);
    });
    this.oneSignal.handleNotificationOpened().subscribe(data => {
      let additionalData = data.notification.payload.additionalData;
      this.showAlert('Notification opened','You already read this before',additionalData.task);
    });
    this.oneSignal.endInit();
  } */

/*   async showAlert(title,msg,task){
    const alert = await this.alertController.create({
      header:title,
      subHeader:msg,
      buttons:[
        {
          text: `Action: ${task}`,
          handler:()=>{

          }
        }
      ]
    })
    alert.present();
  } */
 /*END */
  /*async initializeApp() {
    try {
     await SplashScreen.hide();
    } catch (err) {
     console.log('This is normal in a browser', err);
    }
  }*/

  async setLanguage() {
    // this language will be used as a fallback when a translation isn't found in the current language

    //this.translate.setDefaultLang('en');
    // let currentLanguage: string;
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    // await this.loginService.getUserLanguage().then( res => { 
    //  currentLanguage = res.data().language;
    // } );
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    // console.log(currentLanguage);
    // console.log("current lang1",this.translatee.currentLang);
    // this is to determine the text direction depending on the selected language
    // for the purpose of this example we determine that only arabic and hebrew are RTL.
    // this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   this.textDir = (event.lang === 'ar' || event.lang === 'iw') ? 'rtl' : 'ltr';
    // });
    //this.getTranslations();
    //this.loginService.getUserInfo().then( a=> { return console.log("Louay from app.component111", a) } ).catch(err=>console.log(err));
    this.translate.onLangChange.subscribe((lang) => {
      // console.log('hon',lang);
      this.featureService.getTranslations(lang);
    });
    // console.log("2",this.translatee.currentLang);
    // console.log("3",this.translatee);
  }
/*   getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translatee.getTranslation(this.translatee.currentLang)
    .subscribe((translations) => {
      console.log("inside getTranslationss",translations);
      this.translations = translations;
    });
  } */


/*   async openLanguageChooser() {
    this.available_languages = this.languageService.getLanguages()
    .map(item =>
      ({
        name: item.name,
        type: 'radio',
        label: item.name,
        value: item.code,
        checked: item.code === this.translatee.currentLang
      })
    );

    const alert = await this.alertController.create({
      header: this.featureService.translations.SELECT_LANGUAGE,
      inputs: this.available_languages,
      cssClass: 'language-alert',
      buttons: [
        {
          text: this.featureService.translations.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: this.featureService.translations.OK,
          handler: (data) => {
            if (data) {
              this.loginService.setUserLanguage(data).then(() => { this.translatee.use(data) });
            }
          }
        }
      ]
    });
    await alert.present();

  } */

}
