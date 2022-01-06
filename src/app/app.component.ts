import { ChangeDetectorRef, Component } from '@angular/core';
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
import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2/ngx';
//import firebase from 'firebase';
import firebase from 'firebase/app';

const { Network } = Plugins;
const PRODUCT_KEY = 'pro_version';//'pro_version_subscription';
//const PRODUCT_KEY2 = 'pro_version_subscription';

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
  //buildingName: string;
  userName: string;
  products: IAPProduct[] = [];
  isPro: boolean;
  proStatusUpdate: firebase.firestore.FieldValue;
  proExpirationDate: firebase.firestore.FieldValue;
  proStatus: string= 'N/A';
  storeExpiryDate: string= "jjj";
  storeLastRenewalDate= new Date(Date.now());
  storeBillingPeriod: number = 0;
  status: string = "status";
  id: string;
  proFirstExpirationDate: firebase.firestore.FieldValue;
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
    private modalController: ModalController,
    private store: InAppPurchase2,
    private changeDetectorRef: ChangeDetectorRef
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
    //purchase product
    console.log("platforms", this.platform.platforms())
    console.log("platform desktop", this.platform.is("desktop"))
    if (!this.platform.is("desktop")){
      this.store.ready(()=> {
        this.products = this.store.products;
        this.changeDetectorRef.detectChanges();
      })
    }
          
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
            //this.buildingName= buildingInfo.name;
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

  registerProduct(){
    this.store.register({
      id: PRODUCT_KEY,
      type: this.store.CONSUMABLE,
    },
    
    );
/*     this.store.register(    {
      id: PRODUCT_KEY2,
      type: this.store.PAID_SUBSCRIPTION,
    }    
    ); */

    console.log(PRODUCT_KEY, this.store.get(PRODUCT_KEY))
    //console.log(PRODUCT_KEY2, this.store.get(PRODUCT_KEY2))



/*     this.store.register({
      id: PRODUCT_KEY2,
      type: this.store.PAID_SUBSCRIPTION,
    });  */

    this.store.refresh()

    //this.id = this.store.get(PRODUCT_KEY).id;
    //this.storeExpiryDate = this.store.get(PRODUCT_KEY).expiryDate?.toDateString();
    //this.storeBillingPeriod= this.store.get(PRODUCT_KEY).billingPeriod;
    //this.storeLastRenewalDate= this.store.get(PRODUCT_KEY).lastRenewalDate;
  }
  
/*   setupListeners(){
    this.store.when('product')
    .approved((p: IAPProduct) => {
      if (p.id === PRODUCT_KEY) {
        //this.isPro = true;
       let nextExpirationDate: Date;
       if (this.loginService.getProExpirationDate()) {        
        nextExpirationDate = new Date(new Date(this.loginService.getProExpirationDate().toDate()).setFullYear(new Date(this.loginService.getProExpirationDate().toDate()).getFullYear() + 1))
        //this.featureService.updateItem('church',{proExpirationDate: nextExpirationDate, proStatusUpdate: firebase.firestore.FieldValue.serverTimestamp(), proStatus: "finished", productState: p.state})
        //his.featureService.createItem("proActions",{ buildingId: this.loginService.getBuildingId(), proExpirationDate: nextExpirationDate, date: firebase.firestore.FieldValue.serverTimestamp(), productState: p.state})
      }
      else {
        nextExpirationDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        //this.featureService.updateItem('church',{proFirstExpirationDate: nextExpirationDate, proExpirationDate: nextExpirationDate, proStatusUpdate: firebase.firestore.FieldValue.serverTimestamp(), proStatus: "finished", productState: p.state})
        //this.featureService.createItem("proActions",{ buildingId: this.loginService.getBuildingId(), proExpirationDate: nextExpirationDate, date: firebase.firestore.FieldValue.serverTimestamp(), productState: p.state})
      }    
        console.log("approved", p)
      } 
      this.changeDetectorRef.detectChanges();
  
      return p.verify();
    })
    .verified((p: IAPProduct) => p.finish());
  
    /*this.store.when(PRODUCT_KEY)
    .expired(()=> {
      console.log("expired")
      this.featureService.updateItem('buildings',this.loginService.getBuildingId(),{ proStatusUpdate:firebase.firestore.FieldValue.serverTimestamp(), proStatus: "expired"})
      this.isPro = false;
      this.status = "expired"
    }); */




}
