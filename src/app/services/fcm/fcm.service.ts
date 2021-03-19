//reference https://angularfirebase.com/lessons/ionic-native-with-firebase-fcm-push-notifications-ios-android/
import { Injectable } from '@angular/core';
//import { Firebase } from '@ionic-native/firebase/ngx';
// import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
//import { FCM } from '@ionic-native/fcm/ngx';
//import { AngularFireAuth } from '@angular/fire/auth';
import { Platform, AlertController } from '@ionic/angular';
import { LoginService } from "../login/login.service"
// import { mergeMapTo,mergeMap } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    //private fcm : FCM, 
    public afs: AngularFirestore,
    private loginService : LoginService,
    private platform: Platform,
    private router : Router,
    private alertController: AlertController
  ) {
     
  }
  // Save the token to firestore
  // Get permission from the user
/*    async get_save_Token() {
     
    let token: string;

    if (this.platform.is('android')) {
      console.log("android");
      token = await this.fcm.getToken();
      
    } else if (this.platform.is('ios')) {
      token = await this.fcm.getToken();
      //await this.fcm.hasPermission();//grantPermission();
    }
    else token = await this.fcm.getToken();

    if( token && this.loginService.getLoginID()) {
      return this.saveTokenToFirestore(token);
    }
    return;
  }
  
  private saveTokenToFirestore(token) {
    console.log("token", token);
    const devicesRef = this.afs.collection('devices')
    const docData = { 
      token,
      userId: this.loginService.getLoginID(),
      buildingId: this.loginService.getBuildingId()
    }
  
    return devicesRef.add(docData);
  }
  // Listen to incoming FCM messages
   //listenToNotifications() {
    //return this.fcm.onNotification();
  //} 

   listenToNotifications() {
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
    }
  onTokenRefresh() {
    this.fcm.onTokenRefresh().subscribe(token => {
      //backend.registerToken(token);
    });
  }

  subscribe(){
    this.fcm.subscribeToTopic('marketing');
  }

  unSubscribe(){
    this.fcm.unsubscribeFromTopic('marketing');
  }
  async navigateToLisingRequests(header,message){
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
         {
          text: "OKAY",
          handler: ()=> {
            this.router.navigate(['deal/listing']);
          }
        },
        {
          text: "Dismiss",
           handler: ()=> {
            
            }, 
            
          }
      ]
    });
    await alert.present();
  } */
}