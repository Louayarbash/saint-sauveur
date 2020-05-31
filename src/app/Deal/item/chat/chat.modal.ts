import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
//import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
//import { FirebaseUserModel } from '../firebase-user.model';
import { AngularFirestore } from "@angular/fire/firestore";
//import { Observable } from "rxjs";
import { LoginService } from "../../../services/login/login.service";
import * as firebase from 'firebase/app';
//import { map, filter } from 'rxjs/operators';
import { ChatModel } from '../chat/chat.model'
import { combinedItemModel } from '../firebase-item.model';


@Component({
  //selector: 'app-firebase-chat',
  selector: 'app-firebase-chat',
  templateUrl: './chat.modal.html',
  styleUrls: [
    './styles/chat.modal.scss',
    './styles/chat.shell.scss'
  ],
})
export class ChatModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item : combinedItemModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  //@ViewChild(IonContent) content : IonContent;
  msgText : string;
  currentUserId : string = this.loginService.getLoginID();
  currentUserName : string = this.loginService.getLoginName();
  messages : any;
  //loginId = this.loginService.getLoginID(); 
  otherUserName : string;
  userName : string;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private afs :AngularFirestore,
    private loginService : LoginService
      ) {
  }

  ngOnInit() {
    this.otherUserName = this.item.createdBy == this.currentUserId ? this.item.userInfoResponder.firstname : this.item.userInfoCreator.firstname;
    this.userName = this.loginService.getLoginName();
    this.messages = this.afs.collection<ChatModel>('chats',ref=> ref.where('channelId', '==' ,"chatDealPage_" + this.item.id + "*_*" + this.item.createdBy + "*_*" + this.item.responseBy).orderBy('createdAt')).valueChanges();
    setTimeout(() => {
      this.content.scrollToBottom(400);
    },400); 
  }

  dismissModal() {
   this.modalController.dismiss();
   
  }
  sendMessage(){
    let chatMsg : ChatModel = new ChatModel();
    chatMsg.channelId = "chatDealPage_" + this.item.id + "*_*" + this.item.createdBy + "*_*" + this.item.responseBy;
    chatMsg.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    chatMsg.userId = this.currentUserId;
    chatMsg.text = this.msgText;
    //chatMsg.name = this.user.name;
    console.log(chatMsg);
    if(this.msgText != ''){
      this.afs.collection('chats').add({...chatMsg});
      this.msgText = '';
      setTimeout(() => {
        this.content.scrollToBottom(400);
      },400); 
    }
  }

}
