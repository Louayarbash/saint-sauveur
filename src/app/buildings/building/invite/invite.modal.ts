import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
//import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../../../users/user/firebase-user.model';
import { AngularFirestore } from "@angular/fire/firestore";
//import { Observable } from "rxjs";
import { LoginService } from "../../../services/login/login.service";
import firebase from 'firebase/app';
//import { map, filter } from 'rxjs/operators';
import { InviteModel } from './invite.model'
import { FeatureService } from '../../../services/feature/feature.service';


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
  @Input() item: FirebaseUserModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  // @ViewChild(IonContent) content : IonContent;
  emailsList: string;
  InvitationMsg: string
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
  sendInvitations(){
    let invitation : InviteModel = new InviteModel();
    invitation.invitationMessage = this.InvitationMsg;
    invitation.createDate = firebase.firestore.FieldValue.serverTimestamp();
    invitation.userId = this.loginId;
    invitation.emails= this.emailsList.split(';')
    invitation.buildingId= this.buildingId;

    if(this.emailsList){
      this.afs.collection('invitations').add({...invitation})
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.InvitationSent, 2000);
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.InvitationSendingErrors, 2000);
      console.log(err)
    });


    }
  }
/*    sendMessage2(){

    let chatMsg : ChatModel = new ChatModel();
    chatMsg.channelId = "chatTicketPage_" + this.item.id;
    chatMsg.date = firebase.firestore.FieldValue.serverTimestamp();
    chatMsg.userId = "AdminUserId";
    chatMsg.text = this.msgText;
    //chatMsg.name = "Admin";

    if(this.msgText != ''){
      this.afs.collection('chatTicket').add({...chatMsg});
      this.msgText = '';
      setTimeout(() => {
        this.content.scrollToBottom(400);
      },400); 
    }

  }  */

}
