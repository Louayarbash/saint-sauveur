import { Component, OnInit, HostBinding} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel, combinedItemModel } from '../firebase-item.model';
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

import { FormGroup, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatModal } from '../chat/chat.modal';
import { ReviewModal } from '../review/review.modal';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})

export class FirebaseItemDetailsPage implements OnInit {
  acceptOfferButtonHidden : boolean;
  proposeButtonHidden : boolean;
  cancelRequestDealButtonHidden : boolean;
  cancelRequestButtonHidden : boolean;
  acceptButtonHidden : boolean;
  cancelOfferDealButtonHidden : boolean;
  cancelOfferButtonHidden : boolean;
  userInfoCreatorBlock : boolean;
  userInfoResponderBlock : boolean;
  chatWithCreatorButton : boolean;
  ratingCreatorButton : boolean;
  ratingResponderButton : boolean;
  noteSection : boolean;
  loginID : string;
  item: combinedItemModel;
  startTimeString : string;
  endTimeString : string;
  dateTimeString : string;
  endTimeCounter : string;
  startTimeCounter: string;
  dateMsg : string;
  startTimeMsg : string;
  endTimeMsg : string;
  userNameCreator : string;
  userNameResponder : string;
  ratingFormCreator : FormGroup;
  ratingFormResponder : FormGroup;
  rating : string = "1";
  creatorRating : Observable<Array<any>>;
  avgCreatorRating : Observable<any>;
  responderRating : Observable<Array<any>>;
  avgResponderRating : Observable<any>;
  notRatedYetCreator: boolean;
  notRatedYetResponder : boolean;
  editDeal: boolean;
  typeIsRequest: boolean;

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
    private callNumber: CallNumber,
    private socialSharing : SocialSharing
  ) { 

    this.loginID = this.loginService.getLoginID();
    this.editDeal = false;
   
    this.proposeButtonHidden = true;
    this.cancelRequestButtonHidden = true;
    this.cancelRequestDealButtonHidden = true;
    this.acceptButtonHidden = true;
    this.cancelOfferButtonHidden = true;
    this.cancelOfferDealButtonHidden = true;
    this.userInfoCreatorBlock = false;
    this.userInfoResponderBlock = false;
    this.chatWithCreatorButton = false;
    this.ratingCreatorButton = false;
    this.ratingResponderButton = false;
    this.noteSection = false;
    this.notRatedYetCreator = false;
    this.notRatedYetResponder = false;
    /*Offer */
    this.acceptOfferButtonHidden = true;  
  }

  ngOnInit() {
    this.ratingFormCreator = new FormGroup({
      rate: new FormControl(this.rating)
    });
    this.ratingFormResponder = new FormGroup({
      rate: new FormControl(this.rating)
    });
    //console.log("rere1",this.rating);
    //console.log("Deals details inside OnInit",this.loginService.buildingId);
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

            this.typeIsRequest = this.item.type == "request" ? true : false;

            //request
            this.proposeButtonHidden = this.typeIsRequest ? ((this.loginID == this.item.createdBy) || this.item.status == "accepted" || !(this.item.status == "new")) : true;
            this.cancelRequestButtonHidden = this.typeIsRequest ? !((this.loginID == this.item.createdBy) && this.item.status == "new") : true;
            this.cancelRequestDealButtonHidden = this.typeIsRequest ? !((this.item.status == "accepted") || ((this.loginID == this.item.createdBy) && (this.item.status == "started"))) : true;
            //offer
            this.acceptButtonHidden = !this.typeIsRequest ? ((this.loginID == this.item.createdBy) || this.item.status == "accepted" || !(this.item.status == "new")) : true;
            this.cancelOfferButtonHidden = !this.typeIsRequest ? !((this.loginID == this.item.createdBy) && this.item.status == "new") : true;
            this.cancelOfferDealButtonHidden = !this.typeIsRequest ? !((this.item.status == "accepted") || ((this.loginID == this.item.createdBy) && (this.item.status == "started"))) : true;
          
            //this.dateTimeString = dayjs(this.item.date).format('YYYY-MM-DD');
            //this.startTimeString = dayjs(this.item.startDate).format("HH:mm");
            //this.endTimeString = dayjs(this.item.endDate).format('HH:mm');
            this.startTimeCounter = dayjs(this.item.startDate).format('MM/DD/YYYY HH:mm:ss');
            this.endTimeCounter = dayjs(this.item.endDate).format('MM/DD/YYYY HH:mm:ss');
            this.dateMsg = dayjs(this.item.date).format("DD, MMM, YYYY");
            this.startTimeMsg = dayjs(this.item.startDate).format("HH:mm");
            this.endTimeMsg = dayjs(this.item.endDate).format('HH:mm');
            this.userNameCreator = this.item.userInfoCreator.name + " " + this.item.userInfoCreator.lastname; 
            this.userNameResponder = this.item.userInfoResponder.name + " " + this.item.userInfoResponder.lastname;

            this.userInfoCreatorBlock = (this.loginID !== this.item.createdBy);
            this.chatWithCreatorButton = (this.item.responseBy == this.loginID) ? true : false; 
            this.ratingCreatorButton = (this.item.status == "ended") ? true : false;
            this.ratingResponderButton = (this.item.status == "ended") ? true : false;
            this.userInfoResponderBlock = (this.loginID == this.item.createdBy) && (this.item.responseBy) ? true : false;
            this.ratingFormCreator.get('rate').setValue(this.rating);
            this.ratingFormResponder.get('rate').setValue(this.rating);
            this.noteSection = this.item.note ? true : false;
            this.editDeal = (this.loginID == this.item.createdBy) ? true : false;
            if(this.item.createdBy){
              this.creatorRating = this.featureService.getUserRating(this.item.createdBy);
              this.avgCreatorRating = this.creatorRating.pipe(map( arr => { 
                const rating = arr.map(res => {return Number(res.stars)});
                let valueRating = rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0";
                this.ratingFormCreator.get('rate').setValue(valueRating);
                this.notRatedYetCreator = rating.length ? false : true;
                return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'NotRatedYet'
              }));
            }
            if(this.item.responseBy){
              this.responderRating = this.featureService.getUserRating(this.item.responseBy);
              this.avgResponderRating = this.responderRating.pipe(map( arr => { 
                const rating = arr.map(res => {return Number(res.stars)});
                let valueRating = rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0";
                this.ratingFormResponder.get('rate').setValue(valueRating);
                this.notRatedYetResponder = rating.length ? false : true;
                return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'NotRatedYet'
              }));
            }
          }
          //console.log("rere2",this.rating);
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
    //delete this.item.isShell;
    
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as ItemModel
      }
    });
    await modal.present(); 
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

  async openChatModal() {
    //console.log("dddd",this.item);
    const modal = await this.modalController.create({
      component: ChatModal,
      componentProps: {
        'item': this.item 
      }
    });

    await modal.present();
  }
/*   rateUser(){
    
    this.featureService.setUserRating("this.item.id", "this.item.responseBy", "this.item.userInfoResp.name", this.item.createdBy , "test", this.ratingForm.get('rate').value);//.catch(err => { console.log(err)});

  } */
  async openReviewModal() {
    const modal = await this.modalController.create({
      component: ReviewModal,
      componentProps: {
        'item': this.item 
      }
    });
    await modal.present();
  }

  share(){
  this.socialSharing.share("Following is the parking information: "+ "Parking level: " + this.item.parkingInfo.level + "Parking number: " + this.item.parkingInfo.number ).then(() => {}).catch(err => {})
  }

   async proposeParking() {
    let radioObject: any[];
    let userParking: { id: number; number: string; }[];
    let radioObjectFiltered : any[];
    let correctedParking : any[];
    await this.loginService.getUserParking().then(()=>{
      userParking  = this.loginService.parking
    });

      this.featureService.getItem('building', this.loginService.getBuildingId()).subscribe( async building => {
      let levels = building.parking;
      
      console.log("levels",levels);
      console.log("parking",userParking);

        //let userParking = [];
        if (userParking) {
          radioObject = userParking.map((parking: { id: number; number: string; }, index: number) => {
            let level = levels.find( (level: { id: number; }) => level.id === parking.id );
            if(level){
              level.desc;
              let checked = index == 0 ? true : false; 
              return { id: parking.id, number : parking.number, name : level.desc , type : 'radio' , label : this.featureService.translations.Level + ": " + level.desc + ' #' + parking.number , value : {level : level.desc ,number : parking.number} ,checked: checked}
            }
          });
          radioObjectFiltered = radioObject.filter(function(res: {id : number; number : string}) {
            return res != null;
          });
          correctedParking = radioObjectFiltered.map(parking => {return {id : parking.id, number : parking.number}}
          ) 
    }
    if(radioObjectFiltered.length != radioObject.length){
      this.featureService.presentToast("Parking info. updated",3000)
      this.loginService.updateUserParking(correctedParking)
    }
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.getTranslationParams("ProposeParkingConfirmation",{valueDate : this.dateMsg, valueFrom : this.startTimeMsg, valueTo : this.endTimeMsg}),
      //cssClass: 'alertCancel',
      inputs:  radioObjectFiltered ,
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: (data:any)=> {
           this.item.parkingInfo = data;
           console.log(data);
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
  });
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
  async cancelRequestDeal(){
    if (this.item.createdBy == this.loginID){
      const alert = await this.alertController.create({
        header: this.featureService.translations.PleaseConfirm,
        message: this.featureService.translations.CancelRequestDealConfirmation,
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
          message: this.featureService.translations.CancelRequestDealConfirmation,
          buttons: [
             {
              text: this.featureService.translations.OK,
              handler: ()=> {
                this.firebaseService.cancelRequestDeal(this.item);
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

  async acceptOffer(){
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.getTranslationParams("AcceptParkingConfirmation",{valueDate : this.dateMsg, valueFrom : this.startTimeMsg, valueTo : this.endTimeMsg}),
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: (data:any)=> {
           this.item.parkingInfo = data;
           console.log(data);
           this.firebaseService.acceptOffer(this.item);
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
  async cancelOffer(){
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.CancelRequestConfirmation,
      buttons: [
         {
          text: this.featureService.translations.OK,
          handler: ()=> {
            this.firebaseService.cancelOffer(this.item);
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
  async cancelOfferDeal(){
    if (this.item.createdBy == this.loginID){
      const alert = await this.alertController.create({
        header: this.featureService.translations.PleaseConfirm,
        message: this.featureService.translations.CancelRequestDealConfirmation,
        buttons: [
           {
            text: this.featureService.translations.OK,
            handler: ()=> {
              this.firebaseService.cancelOffer(this.item);
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
                this.firebaseService.cancelOfferDeal(this.item);
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
}
