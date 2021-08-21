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
import { ChatModel } from './chat.model'


@Component({
  selector: 'app-firebase-update-user',
  templateUrl: './chat.modal.html',
  styleUrls: [
    './styles/firebase-update-user.modal.scss'
  ],
})
export class ChatModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: UserModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  // @ViewChild(IonContent) content : IonContent;
  msgText: string= "";
  messages: any;
  loginId = this.loginService.getLoginID(); 
  userName = this.loginService.getLoginName();

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private afs:AngularFirestore,
    private loginService: LoginService
      ) { 
  }

  ngOnInit() {
    this.messages = this.afs.collection<ChatModel>('chatTicket',ref=> ref.where('channelId', '==' ,"chatTicketPage_" + this.item.id).orderBy('date')).valueChanges();
    setTimeout(() => {
      this.content.scrollToBottom(400);
    },400); 
    console.log("ticket",this.item);
  }

  dismissModal() {
   this.modalController.dismiss();
   
  }
  sendMessage(){
    let chatMsg : ChatModel = new ChatModel();
    chatMsg.channelId = "chatTicketPage_" + this.item.id;
    chatMsg.date = firebase.firestore.FieldValue.serverTimestamp();
    chatMsg.userId = this.loginId;
    chatMsg.text = this.msgText;
    //chatMsg.name = this.user.name;
    console.log(chatMsg);
    if(this.msgText != ''){
      this.afs.collection('chatTicket').add({...chatMsg});
      this.msgText = '';
      setTimeout(() => {
        this.content.scrollToBottom(400);
      },200); 
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
