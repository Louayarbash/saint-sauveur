//reference https://angularfirebase.com/lessons/ionic-native-with-firebase-fcm-push-notifications-ios-android/
import { Injectable } from '@angular/core';
//import { Firebase } from '@ionic-native/firebase/ngx';
// import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
//import { FCM } from '@ionic-native/fcm/ngx';
//import { AngularFireAuth } from '@angular/fire/auth';
import {  AlertController } from '@ionic/angular';
import { LoginService } from "../login/login.service"
import { FeatureService } from "../feature/feature.service"
// import { mergeMapTo,mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from '@capacitor/core';

const { PushNotifications } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    //private fcm : FCM, 
    public afs: AngularFirestore,
    private loginService : LoginService,
    //private platform: Platform,
    private router : Router,
    private alertController: AlertController,
    private featureService : FeatureService
  ) {

    // alert('Initializing HomePage test push notifications app comp');
    // console.log('Initializing HomePage test push notifications');
  


     
  }
  // Save the token to firestore
  // Get permission from the user
    async initPushNotification() {

    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        //alert('Initializing HomePage test push notifications FAILED');
        // Show some error
      }
    }); 

    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) => {
        // alert('Push registration success, token: ' + token.value);
        
        if( token.value && this.loginService.getLoginID()) {
           this.saveTokenToFirestore(token.value);
        }
      },
    );
  
    PushNotifications.addListener('registrationError', (error: any) => {
      // alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotification) => {
        console.log(notification);
        //alert('Push received1: ' + JSON.stringify(notification));

        this.navigateToURL(notification.data.header,notification.data.message,notification.data.landing_page);
        
      },
    );

    //PushNotifications.addListener(
      //'pushNotificationActionPerformed',
      //(notification: PushNotificationActionPerformed) => {
    // alert('Push action performed: ' + JSON.stringify(notification));
    // },
    // );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
       (notification: PushNotificationActionPerformed) => {
        //alert('Push action performed1: ' + JSON.stringify(notification));

        this.router.navigate([notification.notification.data.landing_page]);
      },
    );
  }
  
  private saveTokenToFirestore(token:string) {
    console.log("token", token);
    // alert('saveTokenToFirestore' + this.loginService.getUserTokens());
    let tokens = this.loginService.getUserTokens();
if(tokens){
  if(tokens.indexOf(token) == -1) {
    tokens.push(token)
    const docData = {
      tokens : tokens
      // userId: this.loginService.getLoginID(),
      // buildingId: this.loginService.getBuildingId()
    }
    const userRef = this.afs.collection('users').doc(this.loginService.getLoginID())
    userRef.update(docData);
    // alert('update done ' + this.loginService.getUserTokens());
    }

}
else{
  //alert('update done ' + this.loginService.getUserTokens());
    const docData = {
      tokens : [token]
      // userId: this.loginService.getLoginID(),
      // buildingId: this.loginService.getBuildingId()
    }
    const userRef = this.afs.collection('users').doc(this.loginService.getLoginID())
    userRef.update(docData);

}

    }

/*     listenToNotifications() {
      return this.fcm.onNotification()
       .subscribe(data => {
        console.log("inside listenToNotifications...data.wasTapped value is: ",data.wasTapped);
        console.log("Data :", data);
        if(data.wasTapped){
         //this.router.navigate(['deal/details/' + data.id]);
         this.router.navigate(['deal/listing']);
         console.log("Received ionic 5 in background service fcm",data.landing_page);
         console.log("Received ionic 5 in background service fcm",data.id);
        }
        else{
          this.navigateToLisingRequests("New parking request ionic 5!","You want to check if you can help?" +  data.body);
          //this.router.navigate(['deal/listing']);
          //this.router.navigate(['deal/details/FQiH1zYrg5Vdmss4jFGM']);// + data.id]);
          console.log("Received ionic 5 in foreground service fcm",data.landing_page);
          console.log("Received ionic 5 in foreground service fcm",data.id);
        }
      }
      ); 
    }  */

  async navigateToURL(header: string,message: string,url: string){
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
         {
          text: this.featureService.translations.OK,
          handler: ()=> {
            this.router.navigate([url]);
          }
        },
        {
          text: this.featureService.translations.Cancel,
           handler: ()=> {
            
            }, 
            
          }
      ]
    });
    await alert.present();
  } 
}