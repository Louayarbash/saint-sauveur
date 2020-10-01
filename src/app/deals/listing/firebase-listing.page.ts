import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
//import { FormGroup, FormControl } from '@angular/forms';
import { ModalController, AlertController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { /*Observable, ReplaySubject,*/ Observable, ReplaySubject, Subscription,/*, merge, interval*/} from 'rxjs';
//import { switchMap, map } from 'rxjs/operators';
import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
//import { TestPage } from '../item/test/test.page';
FirebaseCreateItemModal

import { DataStore, ShellModel } from '../../shell/data-store';
//import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
//import { File } from '@ionic-native/file/ngx';
//import { FileOpener } from '@ionic-native/file-opener/ngx';
import { LoginService } from '../../services/login/login.service';
import { FeatureService } from '../../services/feature/feature.service'
import dayjs from 'dayjs';
//import { timeout } from 'rxjs/operators';
//import { TranslateService } from '@ngx-translate/core';



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
  /*for segment implementation*/
  loginId = this.loginService.getLoginID();
  segmentValue = 'newRequests';
  // friendsList: Array<any>;
  newRequestsList: Array<FirebaseListingItemModel>;
  newOffersList: Array<FirebaseListingItemModel>;
  myRequestsList: Array<FirebaseListingItemModel>;
  // searchQuery = '';
  // showFilters = false;
  /* end */
  // rangeForm: FormGroup;
  //searchQuery: string;
  // showAgeFilter = false;
  // CoverPic:string;
  // searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  // searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;

  type : string;

/*   a:Array<FirebaseListingItemModel> ;
  b:Array<FirebaseListingItemModel> ;
  c:Array<FirebaseListingItemModel> ; */

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
     
    // this.searchQuery = '';
    

/*     this.rangeForm = new FormGroup({
      dual: new FormControl({lower: 1, upper: 100})
    }); */

    // Route data is a cold subscription, no need to unsubscribe?
    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data'];

        // We need to avoid having multiple firebase subscriptions open at the same time to avoid memory leaks
        // By using a switchMap to cancel previous subscription each time a new one arrives,
        // we ensure having just one subscription (the latest)
/*         const updateSearchObservable = this.searchFiltersObservable.pipe(
          switchMap((filters) => {
            const filteredDataSource = this.firebaseService.searchUsersByAge(
              filters.lower,
              filters.upper
            );
            // Send a shell until we have filtered data from Firebase
            const searchingShellModel = [
              new FirebaseListingItemModel(),
              new FirebaseListingItemModel()
            ];
            // Wait on purpose some time to ensure the shell animation gets shown while loading filtered data
            const searchingDelay = 400;

            const dataSourceWithShellObservable = DataStore.AppendShell(filteredDataSource, searchingShellModel, searchingDelay);
            
            return dataSourceWithShellObservable.pipe(
              map(filteredItems => {
                console.log(filteredItems)        ;        
                // Just filter items by name if there is a search query and they are not shell values
                if (filters.query !== '' && !filteredItems.isShell) {
                  const queryFilteredItems = filteredItems.filter(item =>
                    
                    item.title.toLowerCase().includes(filters.query.toLowerCase()
                    //console.log(item.title)
                  ));
                  // While filtering we strip out the isShell property, add it again
                  return Object.assign(queryFilteredItems, {isShell: filteredItems.isShell});
                } else {
                  return filteredItems;
                }
              })
            ); 
          })
        ); */

        // Keep track of the subscription to unsubscribe onDestroy
        // Merge filteredData with the original dataStore state
/*         this.stateSubscription = merge(
          this.listingDataStore.state,
          updateSearchObservable
        ) */
        this.stateSubscription = this.listingDataStore.state
        .subscribe(
         (state) => {
            this.items = state;
            // console.log("this.item", this.items)
          
            if(!this.items.isShell) {

/*               this.a = this.items.map(item => {item.id = "1"; return item} )
              this.b = this.items.map(item => {item.id = "2"; return item} )
              this.c = this.items.map(item => {item.id = "3"; item.note = "khara"; return item} )

              console.log("a",this.a);
              console.log("b",this.b);
              console.log("c",this.c); 
              console.log("dayjsTS",dayjs(1587782116000))
              console.log("dayjsISO",dayjs("2020-04-24T22:35:16.138-04:00")) */

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
              // console.log("liloooo",this.loginId)
              this.myRequestsList = myRequestsList.filter(item => item.createdBy === this.loginId || item.responseBy === this.loginId);
              this.newRequestsList = newRequestsList.filter(item => ((item.status === "new") || (item.status === "expired") || (item.status === "accepted") || (item.status === "ended")) && (item.createdBy !== this.loginId) && (item.type == "request"));
              this.newOffersList = newOffersList.filter(item => ((item.status === "new") || (item.status === "expired") || (item.status === "accepted") || (item.status === "ended")) && (item.createdBy !== this.loginId) && (item.type == "offer"));
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
/*   segmentChanged(ev:any) {
    //console.log(ev.detail.value);
    //console.log(ev.target.value);
    this.segmentValue = ev.detail.value;

    // Check if there's any filter and apply it
    //this.searchList();
  } */
/*   searchList(): void {
    const query = (this.searchQuery && this.searchQuery !== null) ? this.searchQuery : '';

    if (this.segmentValue === 'myRequests') {
      this.newRequestsList = this.items.filter(item => item.createdBy === this.loginService.getLoginID());
    } else if (this.segmentValue === 'newRequests') {
      this.newRequestsList = this.items.filter(item => item.status === "new");
  }
} */
/*   filterList(list : any[], query): Array<any> {
    return list.filter(item => item.createdBy === this.loginService.getLoginID());
  } */
  async openFirebaseCreateModal() {
    const modal = await this.modalController.create({
      component: FirebaseCreateItemModal,
      componentProps: {
        'type' : this.type
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  async chooseType(){
      let alert = await this.alertController.create({
        header: this.featureService.translations.ChooseType,
        message: this.featureService.translations.ChooseTypeMsg,
        inputs: [{
          name : "request" , 
          type : 'radio' , 
          label : this.featureService.translations.Request, 
          value : "request" ,
          checked: true
        },{
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
  
  
/*   searchList() {
    this.searchSubject.next({
      lower: this.rangeForm.controls.dual.value.lower,
      upper: this.rangeForm.controls.dual.value.upper,
      query: this.searchQuery
    });
  } */
}