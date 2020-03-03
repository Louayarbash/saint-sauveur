import { Component, OnInit, HostBinding} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
//import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';

import { DataStore, ShellModel } from '../../../shell/data-store';
import { FcmService } from '../../../../app/services/fcm/fcm.service';
import { DateService } from '../../../../app/services/date/date.service';
//import * as firebase from 'firebase';
import * as dayjs from 'dayjs';
//import * as moment from 'moment';
import { timer } from 'rxjs';
import { LoginService } from '../../../services/login/login.service';
import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})


export class FirebaseItemDetailsPage implements OnInit {
  userLanguage;
  translations; 
  item: FirebaseItemModel;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  //relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
  AuthId:string;
  startTimeString : string;
  endTimeString : string;
  dateTimeString : string;
  endTimeCounter : string;
  startTimeCounter: string;
  dateMsg : string;
  startTimeMsg : string;
  endTimeMsg : string;
  subscribeTimer : any;
  timeLeft : number = 60;

  @HostBinding('class.is-shell') get isShell() {
    return ((this.item && this.item.isShell)/* || (this.relatedUsers && this.relatedUsers.isShell)*/) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private alertController : AlertController,
    private FCM : FcmService,
    private dateService: DateService,
    private loginService : LoginService,
    public translate : TranslateService
  ) { 
    this.AuthId = this.firebaseService.auth.getLoginID();
     console.log("AuthId",this.AuthId);
    }

  ngOnInit() {

    this.userLanguage = this.loginService.getUserLanguage();
    console.log("1", this.userLanguage);
    //this.getTranslations();
    this.translate.use(this.userLanguage);
    this.translate.onLangChange.subscribe(() => {
      console.log("here",this.translate.currentLang);
     this.getTranslations();
     console.log("onLangChange",this.translations);
   });
    console.log("2", this.translate.currentLang);

    console.log("3",this.translate);
    console.log("4",this.translations);
    //this.getTranslations();


    this.FCM.getToken();
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseItemModel> = resolvedDataStores.item;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
          (state) => {
          this.item = state;

          if (this.item.date){
            this.dateTimeString = this.item.date.slice(0,10);//this.dateService.timestampToISOString(this.item.date).slice(0,10);
          
            this.startTimeString = this.item.startDate;//this.dateService.timestampToISOString(this.item.startTime);
            this.endTimeString = this.item.endDate;//this.dateService.timestampToISOString(this.item.endTime);
  
            this.startTimeCounter = dayjs(this.item.startDate).format('MM/DD/YYYY HH:mm:ss');//this.dateService.timestampToString(this.item.startTime,'MM/DD/YYYY HH:mm:ss') as string;
            this.endTimeCounter = dayjs(this.item.endDate).format('MM/DD/YYYY HH:mm:ss');//this.dateService.timestampToString(this.item.endTime,'MM/DD/YYYY HH:mm:ss') as string;
            this.dateMsg = dayjs(this.item.date).format("DD, MMM, YYYY");//this.dateService.timestampToString(this.item.date,"DD, MMM, YYYY");
            this.startTimeMsg = dayjs(this.item.startDate).format("HH:mm");//this.dateService.timestampToString(this.item.startTime,"HH:mm");
            this.endTimeMsg = dayjs(this.item.endDate).format('HH:mm');//this.dateService.timestampToString(this.item.endTime,"HH:mm");
          }
          

/*        this.dateMsg = dayjs(this.dateTimeString).format('DD, MMM, YYYY') as string;
          this.startTimeMsg = dayjs(this.startTimeString).format('HH:mm') as string;
          this.endTimeMsg = dayjs(this.endTimeString).format('HH:mm') as string; */

        }
      );
        /*relatedUsersDataStore.state.subscribe(
        (state) => {
          this.relatedUsers = state;
        }
        ); */
    });
  }
  async openFirebaseUpdateModal() {
    //let itemToUpdate : FirebaseItemModel;
    delete this.item.isShell;
    //let itemToEdit = <FirebaseItemModel>this.item;
    //console.log("before modal, ",itemToEdit);
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as FirebaseItemModel
      }
    });
    await modal.present();
  }
  async proposeParking(){
    const alert = await this.alertController.create({
      header: "Please confirm!",
      message: "Are you sure you want to give your parking on " + this.dateMsg + " from " + this.startTimeMsg + " to " + this.endTimeMsg + "?",
      buttons: [
         {
          text: "OKAY",
          handler: ()=> {
            this.firebaseService.proposeParking(this.item);
          }
        },
        {
          text: "Cancel",
           handler: ()=> {
          
            }, 
            
          }
      ]
    });
    await alert.present();
  }
  async cancelDeal(){
    const alert = await this.alertController.create({
      header: "Please confirm!",
      message: "Are you sure you want to cancel this deal?",
      buttons: [
         {
          text: "OKAY",
          handler: ()=> {
            this.firebaseService.cancelDeal(this.item);
          }
        },
        {
          text: "Cancel",
           handler: ()=> {
          
            }, 
            
          }
      ]
    });
    await alert.present();

  }
  oberserableTimer() {
    const source = timer(0, 1000);
    const abc = source.subscribe(val => {
      console.log(val, '-');
      this.subscribeTimer = this.timeLeft - val;
      if(this.subscribeTimer == 50){
        abc.unsubscribe();
      }
    });
  }
  getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translate.getTranslation(this.translate.currentLang)
    .subscribe((translations) => {
      this.translations = translations;
      console.log("inside getTranslations",this.translations);
    });
  }
  
  
}
