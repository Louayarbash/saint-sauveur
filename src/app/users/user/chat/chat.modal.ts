import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController, IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../firebase-user.model';
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { LoginService } from "../../../services/login/login.service";
import * as firebase from 'firebase/app';
import { map, filter } from 'rxjs/operators';
import { ChatItemModel } from '../chat/chat.model'


@Component({
  selector: 'app-firebase-update-user',
  templateUrl: './chat.modal.html',
  styleUrls: [
    './styles/firebase-update-user.modal.scss',
    './styles/firebase-update-user.shell.scss'
  ],
})
export class ChatUserModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() user: FirebaseUserModel;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  //@ViewChild(IonContent) content : IonContent;
  newMsg : string;
  currentUser : string;
  messages : any;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private afs :AngularFirestore,
    private loginService : LoginService
      ) { 
    this.currentUser = this.loginService.getLoginID();
    //this.messages = this.afs.collection('chats').valueChanges();
    this.messages = this.afs.collection<ChatItemModel>('chats',ref=> ref.where('userId', '==' ,'QU1WaWtJoTch9NecQspR').orderBy('createdAt').limitToLast(10)).valueChanges()
    /* .pipe(
      map( res => {console.log(res);  return res.map(res1 => { return res1;})
    })
    ); */

      setTimeout(() => {
        this.content.scrollToBottom(400);
      },400);

  }

  async ngOnInit() {
    await this.loginService.getUserInfo();
    
  }

  dismissModal() {
   this.modalController.dismiss();
   
  }
  sendMessage(){
    if(this.newMsg != ''){
      this.afs.collection('chats').add({
        userId : this.loginService.getLoginID(),
        name: this.user.name,
        text : this.newMsg,
        //createdAt : firebase.firestore.Timestamp.now(),
        //createdAt2 : firebase.firestore.Timestamp.now().seconds,
        createdAt : firebase.firestore.FieldValue.serverTimestamp()
        //createdAt4 : Date.now()
      });
      this.newMsg = '';
      setTimeout(() => {
        this.content.scrollToBottom(400);
      },400);
      
    }

  }
  sendMessage2(){
    if(this.newMsg != ''){
      this.afs.collection('chats').add({
        userId : "testId",
        name: "testName",
        text : this.newMsg,
        createdAt : firebase.firestore.FieldValue.serverTimestamp()
      })
      .then((res) => {
        console.log(res); 
        this.content.scrollToBottom(400);
      })
      .catch((err)=> {console.log(err)});
      this.newMsg = '';
    }

  }

}
