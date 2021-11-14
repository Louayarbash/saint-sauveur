import { Component, OnInit, HostBinding} from '@angular/core';
import { ModalController, AlertController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel, combinedItemModel } from '../firebase-item.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
import { DataStore } from '../../../shell/data-store';
import dayjs from 'dayjs';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
//import { CallNumber } from '@ionic-native/call-number/ngx';
import { FormGroup, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatModal } from '../chat/chat.modal';
import { ReviewModal } from '../review/review.modal';
//import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss'
  ],
})

export class FirebaseItemDetailsPage implements OnInit { 

  userIsCreator = false;
  acceptOfferButtonHidden : boolean= false;
  proposeButtonHidden : boolean= true;
  cancelRequestDealButtonHidden : boolean= true;
  cancelRequestButtonHidden : boolean= true;
  acceptButtonHidden : boolean= true;
  cancelOfferDealButtonHidden : boolean= true;
  cancelOfferButtonHidden : boolean= true;
  creatorDetails : string;
  responderDetails : string;
  userInfoCreatorBlock : boolean= false;
  userInfoResponderBlock : boolean= false;
  chatButton : boolean= false;
  noteSection : boolean= false;
  loginID : string= this.loginService.getLoginID();
  item: combinedItemModel;
  startTimeString : string;
  endTimeString : string;
  dateTimeString : string;
  endTimeCounter : string;
  startTimeCounter: string;
  dateMsg : string;
  endDateMsg : string;
  startTimeMsg : string;
  endTimeMsg : string;
  userNameCreator : string;
  userNameResponder : string;
  ratingFormCreator : FormGroup;
  ratingFormResponder : FormGroup;
  rating : string = "0";
  creatorRating : Observable<Array<any>>;
  avgCreatorRating : Observable<any>;
  responderRating : Observable<Array<any>>;
  avgResponderRating : Observable<any>;
  isRatedCreator: boolean=false;
  isRatedResponder : boolean=false;
  editDeal: boolean;
  typeIsRequest: boolean;
  parkingInfo: string;
  dealDetails: string;
  buildingObservable: Observable<any>;
  buildingSubscription: Subscription;
  ltr: boolean;

  @HostBinding('class.is-shell') get isShell() {
    return ((this.item && this.item.isShell)/* || (this.relatedUsers && this.relatedUsers.isShell)*/) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private alertController : AlertController,
    private loginService : LoginService,
    private featureService : FeatureService,
    //private callNumber: CallNumber,
    //private socialSharing : SocialSharing,
    private routerOutlet: IonRouterOutlet
  ) { 

  }

  ngOnInit() {
    this.ltr= this.loginService.getUserLanguage() == 'ar' ? false : true; 
    this.ratingFormCreator = new FormGroup({
      rate: new FormControl(this.rating)
    });
    this.ratingFormResponder = new FormGroup({
      rate: new FormControl(this.rating)
    });

    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<combinedItemModel> = resolvedDataStores.item;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
          (state) => {
          this.item = state;

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
            //shared 
              
            this.creatorDetails = this.typeIsRequest ? "RequestorDetails" : "OffererDetails";
            this.responderDetails = this.typeIsRequest ? "ResponderDetails" : "AcceptorDetails";  
            this.dealDetails = this.typeIsRequest ? "RequestDetails" : "OfferDetails";
        
            //this.dateTimeString = dayjs(this.item.date).format('YYYY-MM-DD');
            //this.startTimeString = dayjs(this.item.startDate).format("HH:mm");
            //this.endTimeString = dayjs(this.item.endDate).format('HH:mm');

            this.startTimeCounter = dayjs(this.item.startDate).format('MM/DD/YYYY HH:mm:ss');
            this.endTimeCounter = dayjs(this.item.endDate).format('MM/DD/YYYY HH:mm:ss');
            this.dateMsg = dayjs(this.item.date).format("DD, MMM, YYYY");
            this.endDateMsg = dayjs(this.item.endDate).format("DD, MMM, YYYY");
            this.startTimeMsg = dayjs(this.item.startDate).format("HH:mm");
            this.endTimeMsg = dayjs(this.item.endDate).format('HH:mm');
            this.userNameCreator = this.item.userInfoCreator.firstname + " " + this.item.userInfoCreator.lastname; 
            
            this.userNameResponder = this.item.userInfoResponder ? this.item.userInfoResponder.firstname + " " + this.item.userInfoResponder.lastname : "N/A";

            this.userInfoCreatorBlock = true//(this.loginID !== this.item.createdBy);
            this.chatButton = (this.item.responseBy) ? true : false; 
            //this.ratingCreatorButton = (this.item.status == "ended") ? true : false;
            //this.ratingResponderButton = (this.item.status == "ended") ? true : false;
            this.userInfoResponderBlock = /*(this.loginID == this.item.createdBy) &&*/ (this.item.responseBy) ? true : false;
            this.ratingFormCreator.get('rate').setValue(this.rating);
            this.ratingFormResponder.get('rate').setValue(this.rating);
            this.noteSection = this.item.note ? true : false;
            this.userIsCreator = this.item.createdBy == this.loginID ? true : false;
            if(this.item.createdBy){
              if(!this.typeIsRequest){
                this.parkingInfo = this.item.parkingInfo.level +"/" + this.item.parkingInfo.number;
              }
              this.creatorRating = this.featureService.getUserRating(this.item.createdBy,this.item.type,'creator');
              this.avgCreatorRating = this.creatorRating.pipe(map( arr => { 
                const rating = arr.map(res => {return Number(res.stars)});
                let valueRating = rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0";
                this.ratingFormCreator.get('rate').setValue(valueRating);
                //console.log("rated creator", rating.length)
                this.isRatedCreator = rating.length == 0 ? false : true;
                return rating.length > 0 ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0"
              }));
              this.avgCreatorRating.subscribe(res=>
                console.log("louay123 creator",res)
              )
            }
            if(this.item.responseBy){
              if(this.typeIsRequest){
                this.parkingInfo = this.item.parkingInfo.level + "/" + this.item.parkingInfo.number;
              }
              this.responderRating = this.featureService.getUserRating(this.item.responseBy,this.item.type,'responder');
              this.avgResponderRating = this.responderRating.pipe(map( arr => { 
                const rating = arr.map(res => {return Number(res.stars)});
                console.log("rated responder", rating.length)
                let valueRating = rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0";
                this.ratingFormResponder.get('rate').setValue(valueRating);
                this.isRatedResponder = rating.length == 0 ? false : true;
                return rating.length > 0 ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : "0"
              }));
              this.avgResponderRating.subscribe(res=>
                console.log("louay123 responder",res)
              )
            }
          }
        }
      );
    });
  }
/*   ngOnDestroy() {
    this.buildingSubscription.unsubscribe()
} */
  async openFirebaseUpdateModal() {
    //delete this.item.isShell;
    
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as ItemModel
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present(); 
  }

  
  call(number : string) {
/*     console.log(number);
  this.callNumber.callNumber(number, true)
  .then(res => console.log('Launched dialer!', res))
  .catch(err => console.log('Error launching dialer', err)); */
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
  async openReviewModal(subject : string) {
    const modal = await this.modalController.create({
      component: ReviewModal,
      componentProps: {
        'item': this.item,
        'subject' : subject
      }
    });
    await modal.present();
  }

  share(){
    
  //this.socialSharing.share("Following is the parking information: "+ "Parking level: " + this.item.parkingInfo.level + "Parking number: " + this.item.parkingInfo.number ).then(() => {}).catch(err => {})
  this.featureService.share({
    title: 'Following is the parking information:',
    text: "Parking level: " + this.item.parkingInfo.level + " \ " + "Parking number: " + this.item.parkingInfo.number,
    //url: 'http://ionicframework.com/',
    dialogTitle: 'Share parking info'
  })
  }

   async proposeParking() {
    console.log(this.item)
    let radioObject: any[];
    let userParking: { id: number; number: string; }[];
    let radioObjectFiltered : any[];
    let correctedParking : any[];
    userParking= this.loginService.getUserParking();

      //this.buildingSubscription = 
      this.featureService.getItem('buildings', this.loginService.getBuildingId()).subscribe( async (building) => {
      let levels = building.parkings;
      
      console.log("levels",levels);
      console.log("parking",userParking);

        //let userParking = [];
        if (userParking) {
          radioObject = userParking.map((parking: { id: number; number: string; }, index: number) => {
            let level = levels.find( (level: { id: number; }) => level.id === parking.id );
            if(level){
              //level.desc;
              let checked = index == 0 ? true : false; 
              return { id: parking.id, number : parking.number, name : level.description , type : 'radio' , label : this.featureService.translations.Level + ": " + level.description + ' #' + parking.number , value : {level : level.description ,number : parking.number} ,checked: checked}
            }
          });
          radioObjectFiltered = radioObject.filter(function(res: {id : number; number : string}) {
            return res != null;
          });
          correctedParking = radioObjectFiltered.map(parking => {return {id : parking.id, number : parking.number}}
          ) 
    }
    if(radioObjectFiltered && radioObject){
      if(radioObjectFiltered.length != radioObject.length){
        this.featureService.presentToast("Parking info. updated",3000)
        this.loginService.updateUserParking(correctedParking)
      }
    
    let message = "";
    if(this.dateMsg == this.endDateMsg){
      message = this.featureService.getTranslationParams("ProposeParkingConfirmation",{date : this.dateMsg, startTime : this.startTimeMsg, endTime : this.endTimeMsg});
    }
    else{
      message = this.featureService.getTranslationParams("ProposeParkingConfirmation2",{date : this.dateMsg, startTime : this.startTimeMsg, endDate : this.endDateMsg, endTime : this.endTimeMsg});
    }
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: message,
      //cssClass: 'alertCancel',
      inputs:  radioObjectFiltered ,
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: (data:any)=> {
           this.item.parkingInfo = data;
           //console.log(data);
           this.firebaseService.proposeParking(this.item);
         }
       },
       {
         text: this.featureService.translations.Cancel,
          handler: ()=> {
           },            
         }
     ]
    })

    await alert.present();
  }
  else {
    const alert = await this.alertController.create({
      header: this.featureService.translations.Attention,
      message: this.featureService.translations.NoParkingFound,
      //cssClass: 'alertCancel',
      buttons: [
       {
         text: this.featureService.translations.OK,
          handler: ()=> {
            this.router.navigate(['app/profil',this.loginService.getLoginID()]);
           },            
         }
     ]
    });
    await alert.present();
  }
}
  );

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
    let message = "";
    if(this.dateMsg == this.endDateMsg){
      message = this.featureService.getTranslationParams("AcceptParkingConfirmation",{date : this.dateMsg, startTime : this.startTimeMsg, endTime : this.endTimeMsg});
    }
    else{
      message = this.featureService.getTranslationParams("AcceptParkingConfirmation2",{date : this.dateMsg, startTime : this.startTimeMsg, endDate: this.endDateMsg, endTime : this.endTimeMsg});
    }

    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: message,
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: ()=> {
           //this.item.parkingInfo = data;
           //console.log(data);
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
      message: this.featureService.translations.CancelOfferConfirmation,
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
        message: this.featureService.translations.CancelOfferDealConfirmation,
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
          message: this.featureService.translations.CancelOfferDealConfirmation,
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
