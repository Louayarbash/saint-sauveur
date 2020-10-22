import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';

import { ModalController, AlertController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { /*Observable, ReplaySubject,*/ Observable, ReplaySubject, Subscription} from 'rxjs';
import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
import { DataStore, ShellModel } from '../../shell/data-store';
import { LoginService } from '../../services/login/login.service';
import { FeatureService } from '../../services/feature/feature.service'
import dayjs from 'dayjs';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html',
  styleUrls: [
    './styles/firebase-listing.page.scss',
    './styles/firebase-listing.ios.scss'
  ],
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  segmentValueSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
  segmentValueSubjectObservable: Observable<string> = this.segmentValueSubject.asObservable();
  loginId = this.loginService.getLoginID();
  loginName = this.loginService.getLoginName();
  segmentValue = 'newRequests';
  newRequestsList: Array<FirebaseListingItemModel>;
  newOffersList: Array<FirebaseListingItemModel>;
  myRequestsList: Array<FirebaseListingItemModel>;


  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;

  type : string;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private loginService : LoginService,
    private featureService : FeatureService,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet
  ) {
  }
  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }
   ngOnInit() {

    this.segmentValueSubjectObservable.subscribe(newTabValue=> this.segmentValue= newTabValue);

    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data']; 

        this.stateSubscription = this.listingDataStore.state
        .subscribe(
         (state) => {
            this.items = state;
            // console.log("this.item", this.items)
          
            if(!this.items.isShell) {

              this.items.map(item => {
                item.date = dayjs(item.date).format('DD, MMM, YYYY');
                item.startTimeCounter = dayjs(item.startDateTS * 1000).format('MM/DD/YYYY HH:mm:ss');
                item.endTimeCounter = dayjs(item.endDateTS * 1000).format('MM/DD/YYYY HH:mm:ss');
                item.startTime = dayjs(item.startDate).format("HH:mm"); 
                item.endTime = dayjs(item.endDate).format('HH:mm');
              });

              let myRequestsList = this.items;
              let newRequestsList = this.items;
              let newOffersList = this.items;

              this.myRequestsList = myRequestsList.filter(item => item.createdBy === this.loginId || item.responseBy === this.loginId);
              this.newRequestsList = newRequestsList.filter(item => ((item.status === "new") /*|| (item.status === "expired") || (item.status === "accepted") || (item.status === "ended")*/) && (item.createdBy !== this.loginId) && (item.type == "request"));
              this.newOffersList = newOffersList.filter(item => ((item.status === "new") /*|| (item.status === "expired") || (item.status === "accepted") || (item.status === "ended")*/) && (item.createdBy !== this.loginId) && (item.type == "offer"));
              // console.log("myRequestsList",this.myRequestsList);
              // console.log("newRequestsList",this.newRequestsList);
              // console.log("newOffersList",this.newOffersList);
            }
            else {
              this.myRequestsList = this.items;
              this.newRequestsList = this.items;
            }
          },
          (error) => console.log(error),
          () => console.log('stateSubscription completed')
        );
/*           (error) => console.log(error),
          () => {
            return console.log('stateSubscription completed');
          }
        ); */
      },
      (error) => console.log(error)
    );
  }

  async openFirebaseCreateModal() {
    const modal = await this.modalController.create({
      component: FirebaseCreateItemModal,
      componentProps: {
        type : this.type,
        // segmentValue : this.segmentValue,
        segmentValueSubject: this.segmentValueSubject
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  async chooseType(){
    let canOffer= this.loginService.getUserParkingInfo()?.length > 0 ? true : false;
      let alert = await this.alertController.create({
        // cssClass: 'alertDealCreate',
        header: this.featureService.translations.ChooseType,
        message: canOffer ? this.featureService.translations.ChooseTypeMsg : this.featureService.translations.ChooseTypeMsgNoParking,
        inputs: [{
          name : "request" , 
          type : 'radio' , 
          label : this.featureService.translations.Request, 
          value : "request" ,
          checked: true
        },{
          disabled: !canOffer,
          name : "offer" , 
          type : 'radio' , 
          label : this.featureService.translations.Offer, 
          value : "offer" ,
          checked: false
        }],
        buttons: [
         
          {
            text: this.featureService.translations.Cancel,
            handler: () => {
        
            }
          },
          {
            text: this.featureService.translations.OK,
            handler : (data:any)=> {
              this.type = data;
              this.openFirebaseCreateModal();
            }
          }
        ]
      });
      await alert.present();
    }

}