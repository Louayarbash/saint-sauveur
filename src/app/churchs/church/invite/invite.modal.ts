import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
//import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
//import { FirebaseService } from '../../firebase-integration.service';
//import { UserModel } from '../../../users/user/user.model';
import { AngularFirestore } from "@angular/fire/firestore";
//import { Observable } from "rxjs";
import { LoginService } from "../../../services/login/login.service";
import firebase from 'firebase/app';
//import { map, filter } from 'rxjs/operators';
import { InviteModel } from './invite.model'
import { FeatureService } from '../../../services/feature/feature.service';
// const nodemailer = require('nodemailer');


@Component({
  selector: 'invite-user',
  templateUrl: './invite.modal.html'
})
export class InviteModal implements OnInit {
  // "user" is passed in firebase-details.page
  //@Input() item: UserModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  // @ViewChild(IonContent) content : IonContent;
  emailsList: string
  InvitationMsg= this.featureService.translations.InvitationMsg
  invitaions: any;
  loginId = this.loginService.getLoginID(); 
  disableSubmit: boolean;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    //public firebaseService: FirebaseService,
    public router: Router,
    private afs:AngularFirestore,
    private loginService: LoginService,
    private featureService: FeatureService
      ) { 
  }

  ngOnInit() {
    this.disableSubmit= false;
    this.invitaions = this.afs.collection<InviteModel>('invitations',ref=> ref.orderBy('createDate', 'desc')).valueChanges();

  }

  dismissModal() {
   this.modalController.dismiss();
  }

  sendInvitations(){
    this.disableSubmit= true;
    let invitation : InviteModel = new InviteModel();
    invitation.invitationMessage = this.InvitationMsg;
    invitation.createDate = firebase.firestore.FieldValue.serverTimestamp();
    invitation.userId = this.loginId;
    //console.log("1",this.emailsList);
    this.emailsList = this.emailsList.toLowerCase().replace(/\s/g,'').replace(/;/g,',');
    invitation.emails= this.emailsList.toLowerCase().replace(/\s/g,'').split(',')
    //console.log("2",invitation.emails);
    if(this.emailsList){
      //let emailsListUpdated = this.emailsList.replace(/;/g,',');
      //console.log('after replace', this.emailsList);
       let options = {
          //from: '"Parkondo App" <donotreply@parkondo.com>', // sender address
          emailsList: this.emailsList, // list of receivers
          //subject: "Invitation to join Parkondo App", // Subject line
          invitationMsg: this.InvitationMsg, // plain text body
          //html: "<b>" + this.InvitationMsg + "</b>" // html body

      }; 
    
    this.afs.collection('invitations').add({...invitation})
    .then(() => {
      this.featureService.sendNotificationEmail(options).
       subscribe((data:any) => {
        console.log("data.json", data);
        console.log("JSON.stringify(data.json)", JSON.stringify(data));
        let res: any = data;
        if(res.messageId){
          this.featureService.presentToast(this.featureService.translations.InvitationSent, 2000);
          console.log('messageId = ' + res.messageId);
          this.emailsList = '';          
        }
        else{
          console.log('missing messageId');
        }
        this.disableSubmit= false;
      }, 
      err => {        
        this.disableSubmit= false;
        console.log("response error",err);
        this.featureService.presentToast('Emails sent with errors', 2000);
      }, () => {
        this.disableSubmit= false;
        console.log("complete");
      }); 

      // this.featureService.presentToast(this.featureService.translations.InvitationSent, 2000);
    }
    ).catch((err)=> {
      this.disableSubmit= false;
      this.featureService.presentToast(this.featureService.translations.InvitationSendingErrors, 2000);
      console.log(err)
    });


    }
  }

}
