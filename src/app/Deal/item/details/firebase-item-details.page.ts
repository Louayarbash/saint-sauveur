import { Component, OnInit, HostBinding} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel, combinedItemModel } from '../firebase-item.model';
//import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
import { DataStore, ShellModel } from '../../../shell/data-store';
import { FcmService } from '../../../../app/services/fcm/fcm.service';
//import { DateService } from '../../../../app/services/date/date.service';
import * as dayjs from 'dayjs';
//import { timer } from 'rxjs';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
//import { TranslateService } from '@ngx-translate/core';
import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})


export class FirebaseItemDetailsPage implements OnInit {
  proposeButtonHidden : boolean;
  cancelDealButtonHidden : boolean;
  cancelRequestButtonHidden : boolean;
  userInfoRequBlock : boolean;
  userInfoRespBlock : boolean;
  loginID : string;
  item: combinedItemModel;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  //relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
 // AuthId:string;
  startTimeString : string;
  endTimeString : string;
  dateTimeString : string;
  endTimeCounter : string;
  startTimeCounter: string;
  dateMsg : string;
  startTimeMsg : string;
  endTimeMsg : string;
  //subscribeTimer : any;
  //timeLeft : number = 60;
  //creator information
  userNameRequ : string;
  userNameResp : string;
  //userPhoneRequ : string;
  //userPhoneResp : string;

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
    //private dateService: DateService,
    private loginService : LoginService,
    private featureService : FeatureService,
    private callNumber: CallNumber
  ) { 
    this.loginID = this.loginService.getLoginID();
    this.cancelDealButtonHidden = true;
    this.proposeButtonHidden = true;
    this.cancelRequestButtonHidden = true;
    this.userInfoRequBlock = false;
    this.userInfoRespBlock = false;
    }

  ngOnInit() {
    console.log("Deals details inside OnInit",this.loginService.buildingId);
    this.FCM.getToken();
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<combinedItemModel> = resolvedDataStores.item;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
          (state) => {
          this.item = state;
          //console.log("ITEM",this.item)
          //console.log("USERINFO",this.item.userInfoRequ)
          //console.log("USERINFO2",this.item.userInfoResp)

          if (this.item.date){
            //this.dateTimeString = dayjs(this.item.date).format('YYYY-MM-DD');
            //this.startTimeString = dayjs(this.item.startDate).format("HH:mm");
            //this.endTimeString = dayjs(this.item.endDate).format('HH:mm');
            this.startTimeCounter = dayjs(this.item.startDate).format('MM/DD/YYYY HH:mm:ss');
            this.endTimeCounter = dayjs(this.item.endDate).format('MM/DD/YYYY HH:mm:ss');
            this.dateMsg = dayjs(this.item.date).format("DD, MMM, YYYY");
            this.startTimeMsg = dayjs(this.item.startDate).format("HH:mm");
            this.endTimeMsg = dayjs(this.item.endDate).format('HH:mm');
            this.userNameRequ = this.item.userInfoRequ.name + " " + this.item.userInfoRequ.lastname; 
            this.userNameResp = this.item.userInfoResp.name + " " + this.item.userInfoResp.lastname;
            this.cancelDealButtonHidden = !((this.item.status == "accepted") || ((this.loginID == this.item.createdBy) && (this.item.status == "started")));
            this.proposeButtonHidden = (this.loginID == this.item.createdBy) || this.item.status == "accepted" || !(this.item.status == "new");
            this.cancelRequestButtonHidden = !((this.loginID == this.item.createdBy) && this.item.status == "new");
            this.userInfoRequBlock = (this.loginID !== this.item.createdBy);
            this.userInfoRespBlock = (this.loginID == this.item.createdBy) && (this.item.responseBy) ? true : false;
            //console.log("Louay", this.item.responseBy);
          }
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
    delete this.item.isShell;
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
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.getTranslationParams("ProposeParkingConfirmation",{valueDate : this.dateMsg, valueFrom : this.startTimeMsg, valueTo : this.endTimeMsg}),//("ProposeParkingConfirmation",{valueDate : '111', valueFrom : '222', valueTo : '333'}),//"Are you sure you want to give your parking on " + this.dateMsg + " from " + this.startTimeMsg + " to " + this.endTimeMsg + "?",
      buttons: [
         {
          text:  this.featureService.translations.OK,
          handler: ()=> {
            this.firebaseService.proposeParking(this.item);
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
  async cancelRequest(){
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.CancelRequestConfirmation,
      buttons: [
         {
          text: this.featureService.translations.OK,
          handler: ()=> {
            this.firebaseService.cancelRequest(this.item);
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
  async cancelDeal(){
    if (this.item.createdBy == this.loginID){
      const alert = await this.alertController.create({
        header: this.featureService.translations.PleaseConfirm,
        message: this.featureService.translations.CancelDealConfirmation,
        buttons: [
           {
            text: this.featureService.translations.OK,
            handler: ()=> {
              this.firebaseService.cancelRequest(this.item);
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
    else if (this.item.responseBy && (this.item.responseBy == this.loginID)) {
        const alert = await this.alertController.create({
          header: this.featureService.translations.PleaseConfirm,
          message: this.featureService.translations.DealCancelationConfirmation,
          buttons: [
             {
              text: this.featureService.translations.OK,
              handler: ()=> {
                this.firebaseService.cancelDeal(this.item);
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
/*   oberserableTimer() {
    const source = timer(0, 1000);
    const abc = source.subscribe(val => {
      console.log(val, '-');
      this.subscribeTimer = this.timeLeft - val;
      if(this.subscribeTimer == 50){
        abc.unsubscribe();
      }
    });
  } */
  
  call(number : string) {
    console.log(number);
  this.callNumber.callNumber(number, true)
  .then(res => console.log('Launched dialer!', res))
  .catch(err => console.log('Error launching dialer', err));
  }
  
}
