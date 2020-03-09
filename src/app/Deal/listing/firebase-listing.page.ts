import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalController} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, ReplaySubject, Subscription/*, merge*/ } from 'rxjs';
//import { switchMap, map } from 'rxjs/operators';

import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
//import { TestPage } from '../item/test/test.page';
FirebaseCreateItemModal

import { DataStore, ShellModel } from '../../shell/data-store';
//import { Toast } from '@ionic-native/toast/ngx';
//import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
//import { File } from '@ionic-native/file/ngx';
//import { FileOpener } from '@ionic-native/file-opener/ngx';
import { LoginService } from '../../services/login/login.service';
import { FeatureService } from '../../services/feature/feature.service'
//import { TranslateService } from '@ngx-translate/core';



@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html',
  styleUrls: [
    './styles/firebase-listing.page.scss',
    './styles/firebase-listing.ios.scss',
    './styles/firebase-listing.shell.scss',
    '../../user/friends/styles/user-friends.page.scss',
    '../../user/friends/styles/user-friends.shell.scss',
    '../../user/friends/styles/user-friends.md.scss',
    '../../user/friends/styles/user-friends.ios.scss'
  ],
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  /*for segment implementation*/
  segmentValue = 'allrequests';
  //friendsList: Array<any>;
  newRequestsList: Array<any>;
  myRequestsList: Array<any>;
  searchQuery = '';
  showFilters = false;
  /* end */
  userLanguage;
  translations; 
  rangeForm: FormGroup;
  //searchQuery: string;
  showAgeFilter = false;
  CoverPic:string;
  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private loginService : LoginService,
    private featureService : FeatureService
  ) { }



  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.searchQuery = '';

    this.rangeForm = new FormGroup({
      dual: new FormControl({lower: 1, upper: 100})
    });

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

            this.newRequestsList = this.items;
            if(!this.items.isShell){
              this.myRequestsList = this.filterList(this.items, "pending");
            }
            else this.myRequestsList = this.items;
            
            //this.myRequestsList = this.newRequestsList.filter(item => item.status.toLowerCase().includes("pending"));//this.items;

            
          },
          (error) => console.log(error),
          () => console.log('stateSubscription completed')
        );
      },
      (error) => console.log(error)
    );
  }
  segmentChanged(ev): void {
    console.log(ev.detail.value);
    this.segmentValue = ev.detail.value;

    // Check if there's any filter and apply it
    this.searchList();
  }
  searchList(): void {
    const query = (this.searchQuery && this.searchQuery !== null) ? this.searchQuery : '';

    if (this.segmentValue === 'allrequests') {
      this.newRequestsList = this.items;//this.filterList(this.items, query);
    } else if (this.segmentValue === 'myrequests') {
      this.myRequestsList = this.filterList(this.items, "pending");
  }
      /* else if (this.segmentValue === 'following') {
      this.followingList = this.filterList(this.data.following, query);
    } */
}


  filterList(list, query): Array<any> {

    //return list.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    return list.filter(item => item.status.toLowerCase().includes(query.toLowerCase()));
    //return list.filter(item =>  item.status == query
/*       if(item.status)
      { 
        console.log("herereeee");
        item.status == query;
      } */
      
    
    //);
  }
  async openFirebaseCreateModal() {
    const modal = await this.modalController.create({
      component: FirebaseCreateItemModal
      //component:TestPage
    });
    await modal.present();
  }
/*   searchList() {
    this.searchSubject.next({
      lower: this.rangeForm.controls.dual.value.lower,
      upper: this.rangeForm.controls.dual.value.upper,
      query: this.searchQuery
    });
  } */

}
