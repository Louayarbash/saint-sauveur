import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
//import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../../../users/user/user.model';
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
  templateUrl: './invite.modal.html',
  styleUrls: [
    './styles/firebase-update.modal.scss',
    './styles/firebase-update.shell.scss'
  ],
})
export class InviteModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: UserModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  // @ViewChild(IonContent) content : IonContent;
  emailsList: string
  InvitationMsg= this.featureService.translations.InvitationMsg
  invitaions: any;
  loginId = this.loginService.getLoginID(); 
  buildingId = this.loginService.getBuildingId();

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private afs:AngularFirestore,
    private loginService: LoginService,
    private featureService: FeatureService
      ) { 
  }

  ngOnInit() {
    this.invitaions = this.afs.collection<InviteModel>('invitations',ref=> ref.where('buildingId', '==' , this.buildingId).orderBy('createDate', 'desc')).valueChanges();

  }

  dismissModal() {
   this.modalController.dismiss();
  }

  /* async sendNotificationEmail(mailOptions: any){

    let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    // service: 'gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'marcelouay@gmail.com',
      pass: 'li2annalahama3ana'
    }
  });

  let info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);
}  */

  sendInvitations(){

    let invitation : InviteModel = new InviteModel();
    invitation.invitationMessage = this.InvitationMsg;
    invitation.createDate = firebase.firestore.FieldValue.serverTimestamp();
    invitation.userId = this.loginId;
    invitation.emails= this.emailsList.split(';')
    invitation.buildingId= this.buildingId;

    if(this.emailsList){
      let emailsListUpdated = this.emailsList.replace(';',',');
      console.log('after replace', emailsListUpdated);
      let mailOptions = {
          from: '"Fred Foo 👻" <foo@example.com>', // sender address
          to: this.emailsList, // list of receivers
          subject: "Invitation to join Parkondo building managment app", // Subject line
          text: this.InvitationMsg, // plain text body
          html: "<b>" + this.InvitationMsg + "</b>" // html body
      };
    
    this.afs.collection('invitations').add({...invitation})
    .then(() => {
      this.featureService.sendNotificationEmail(mailOptions).
/*       toPromise().then((data:any) => {
        console.log("data.json", data);
        console.log("JSON.stringify(data.json)", JSON.stringify(data));
        let res: any = data;
        if(res.messageId){
          this.featureService.presentToast('Email has been sent & messageId = ' + res.messageId, 10000);
        }
        else{
          this.featureService.presentToast('Email sending errors', 10000);
        }
      }, 
      err => {        
        console.log("errrroooorrr",err);
        // this.featureService.presentToast('Email sending errors1' + err.error, 10000);
      }); */
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
      }, 
      err => {        
        console.log("response error",err);
        this.featureService.presentToast('Emails sent with errors' + err.error, 10000);
      }, () => {
        console.log("complete");
      }); 

      // this.featureService.presentToast(this.featureService.translations.InvitationSent, 2000);
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.InvitationSendingErrors, 2000);
      console.log(err)
    });


    }
  }

}
