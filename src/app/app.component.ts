import { Component } from '@angular/core';
import { Location } from '@angular/common';
//import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, ModalController, Platform } from '@ionic/angular';
import { LangChangeEvent, TranslateService /*, LangChangeEvent*/ } from '@ngx-translate/core';
//import { FcmService } from '../app/services/fcm/fcm.service';
//import { LanguageService } from './language/language.service';
import { FeatureService } from './services/feature/feature.service';
import { LoginService } from './services/login/login.service';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Plugins, NetworkStatus } from '@capacitor/core';
import { CreateProblemModal } from './problems/item/create/firebase-create-item.modal';
const { Network } = Plugins;

//import { LoginService } from './services/login/login.service';

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
  networkStatus: NetworkStatus;
  available_languages = [];
  translations: any;
  textDir = 'ltr';
  buildingName: string;
  userName: string;
  

  /* LA_ add for cordova platform splashScreen statusBar*/
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private location: Location,
  //  private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    //private fcmService : FcmService,
    //public languageService : LanguageService,
    private featureService : FeatureService,
    private alertController: AlertController,
    private authService: AuthService,
    public router: Router,
    private loginService : LoginService,
    private modalController: ModalController//,
   //private routerOutlet: IonRouterOutlet
    ) {      
    this.initializeApp();
}
async getStatus() {
  try {
    
    this.networkStatus = await Network.getStatus();
    //console.log(this.networkStatus,"connected")
    if (!this.networkStatus.connected){
      this.alertController.create({
        header: this.featureService.translations.ConnectionProblem,
        message: this.featureService.translations.PleaseCheckInternetConnection,
        backdropDismiss: false,
        buttons: [{
          text: this.featureService.translations.Retry,
          role: 'cancel',
          handler: () => {
            this.getStatus();
          }
        }, {
          text: this.featureService.translations.Exit,
          handler: () => {
            navigator['app'].exitApp();
          }
        }]
      })
        .then(alert => {
          alert.present();
        });
      
    }
  } catch (e) { console.log("Error", e) }
}

checkConnection(){
  this.featureService.online.subscribe(res => { console.log("status changed", res); if(!res) {
    this.alertController.create({
      header:  this.featureService.translations.ConnectionProblem,
      message: this.featureService.translations.PleaseCheckInternetConnection,
      backdropDismiss: false,
      buttons: [{
        text: this.featureService.translations.Retry,
        role: 'cancel',
        handler: () => {
          this.getStatus();
          console.log('Application exit prevented!');
        }
      }, {
        text: this.featureService.translations.Exit,
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }})

}
   async initializeApp() {    
    this.platform.ready().then(() => {
    console.log("app.component initialize app")

    this.checkConnection();
      this.setLanguage();
      //this.statusBar.styleDefault();
      this.statusBar.styleLightContent();

      this.loginService.currentUserInfo.subscribe(
        userInfo => {
          this.userName= userInfo.firstname + " " + userInfo?.lastname;
        }
        );
        this.loginService.currentBuildingInfo.subscribe(
          buildingInfo => {
            this.buildingName= buildingInfo.name;
          }
          );
        
      // this.splashScreen.hide();

      // Get a FCM token
      //fcmService.requestPermission();
      //this.fcmService.getToken();

      //this.fcmService.listenToNotifications();
    });

    this.platform.backButton.subscribeWithPriority(10, (processNextHandler) => {
      console.log('Back press handler!');
      if (this.location.isCurrentPathEqualTo('/app/start-menu') || this.location.isCurrentPathEqualTo('/auth/sign-in') || this.location.isCurrentPathEqualTo('/auth/sign-up') || this.location.isCurrentPathEqualTo('/auth/sign-up-first-time'))   {

        // Show Exit Alert!
        console.log('Show Exit Alert!');
        this.showExitConfirm();
        processNextHandler()        
      } else {

        // Navigate to back page
        console.log('Navigate to back page');
        this.location.back();

      }

    });
    

    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Handler called to force close!');
      this.alertController.getTop().then(r => {
        if (r) {
          navigator['app'].exitApp();
        }
      }).catch(e => {
        console.log(e);
      })
    });

  }

  showExitConfirm() {
    this.alertController.create({
      //header: 'App termination',
      message: this.featureService.translations.ExitMsg,
      backdropDismiss: false,
      buttons: [{
        text: this.featureService.translations.Stay,
        role: 'cancel',
        handler: () => {
          //console.log('Application exit prevented!');
        }
      }, {
        text: this.featureService.translations.Exit,
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    })
      .then(alert => {
        alert.present();
      });
  }

  async setLanguage() {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
       this.textDir = (event.lang === 'ar') ? 'rtl' : 'ltr';
       //console.log('psst');
       this.featureService.getTranslations(event);
       this.featureService.currentLang = event.lang;
    });     
  }


  async signOut() {
    const alert = await this.alertController.create({
      header: this.featureService.translations.LogOutHeader,
      message: this.featureService.translations.LogOutMessage,
      buttons: [
        {
          text: this.featureService.translations.Yes,
          handler: ()=> {
            this.authService.signOut().subscribe(() => {
              // Sign-out successful.
              // Replace state as we are no longer authorized to access profile page.
              this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
            }, (error) => {
              console.log('signout error', error); 
            });
          }
        }, {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }
  async problemModal() {
    const modal = await this.modalController.create({
      component: CreateProblemModal,
/*       componentProps: {
        'item': this.item
      }, */
      swipeToClose: true//,
     // presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }


  contactDeveloper(){
    window.open("http://parkondo.com/#contact", "_blank");
  }

}
