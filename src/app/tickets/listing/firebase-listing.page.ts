import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, ReplaySubject, Subscription, merge } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { CreateTicketModal } from '../ticket/create/create-ticket.modal';
import { LoginService } from '../../services/login/login.service';
import { DataStore, ShellModel } from '../../shell/data-store';
// import { filter } from 'core-js/fn/array';
import { FeatureService } from '../../services/feature/feature.service';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html'
})
export class FirebaseListingPage implements OnInit, OnDestroy {

  rangeForm: FormGroup;
  searchQuery: string;
  showAgeFilter = false;
  
  segmentValueSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
  segmentValueSubjectObservable: Observable<string> = this.segmentValueSubject.asObservable();

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;
  userIsAdmin= false;
  segmentValue = 'active';

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;
  ticketsList: Array<FirebaseListingItemModel>;
  activeList: Array<FirebaseListingItemModel>;
  archivedList: Array<FirebaseListingItemModel>;
  ltr: boolean;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private loginService: LoginService,
    private featureService: FeatureService
  ) {  }

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.ltr= this.loginService.getUserLanguage() == 'ar' ? false : true;    

    this.segmentValueSubjectObservable.subscribe(newTabValue=> this.segmentValue= newTabValue);
    this.userIsAdmin = this.loginService.isUserAdmin();
    this.searchQuery = '';

    // Route data is a cold subscription, no need to unsubscribe?
    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data'];

        // We need to avoid having multiple firebase subscriptions open at the same time to avoid memory leaks
        // By using a switchMap to cancel previous subscription each time a new one arrives,
        // we ensure having just one subscription (the latest)
        const updateSearchObservable = this.searchFiltersObservable.pipe(
          switchMap((filters) => {
            // Send a shell until we have filtered data from Firebase
            const searchingShellModel = [
              new FirebaseListingItemModel()
            ];
            // Wait on purpose some time to ensure the shell animation gets shown while loading filtered data
            const searchingDelay = 0;

            //const dataSourceWithShellObservable = DataStore.AppendShell(filteredDataSource, searchingShellModel, searchingDelay);
            const dataSourceWithShellObservable = DataStore.AppendShell(this.listingDataStore.state, searchingShellModel, searchingDelay);
            
            return dataSourceWithShellObservable.pipe(
              map(filteredItems => {
                // Just filter items by name if there is a search query and they are not shell values
                if (filters.query !== '' && !filteredItems.isShell) {
                  const queryFilteredItems = filteredItems.filter(
                    item =>
                    (item.reference.toLowerCase().includes(filters.query.toLowerCase()))
                  );
                  // While filtering we strip out the isShell property, add it again
                  return Object.assign(queryFilteredItems, {isShell: filteredItems.isShell});
                } else {
                  return filteredItems;
                }
              })
            );
          })
        );

        // Keep track of the subscription to unsubscribe onDestroy
        // Merge filteredData with the original dataStore state
        this.stateSubscription = merge(
          this.listingDataStore.state,
          updateSearchObservable
        ).subscribe(
          (state) => {
            this.items = state;
            if(!this.items.isShell){
              this.items.map( item => {
                switch (item.status.toLowerCase()) {
                  case "active" : item.statusTranslation = this.featureService.translations.Active;
                  break;
                  case "resolved" : item.statusTranslation = this.featureService.translations.Resolved;
                  break;
                  case "closed" : item.statusTranslation = this.featureService.translations.Closed;
                  break;
                  default:
                    item.statusTranslation = "Undefined";
                } 
                
                switch (item.subject) {
                  case "ElevatorBooking" : item.subjectTranslation = this.featureService.translations.ElevatorBooking;
                  break;
                  case "NewKeyRequest" : item.subjectTranslation = this.featureService.translations.NewKeyRequest;
                  break;
                  default:
                    item.subjectTranslation = item.subject;
                } 
              });
              let ticketsList= this.items;
              let activeList= this.items;
              let archivedList= this.items;

              if(this.userIsAdmin){
                this.activeList = activeList.filter(item => item.status === 'active');
                this.archivedList = archivedList.filter(item => item.status !== 'active');
                console.log("activeList", this.activeList);
                console.log("archivedList",this.archivedList);
              }
              else {
                this.ticketsList = ticketsList.filter(item => item.createdBy === this.loginService.getLoginID());
              }
            }
             else {
              this.ticketsList= this.items;
              this.activeList= this.items;
              this.archivedList= this.items;
            }
            // console.log("tickets",this.items)
          },
          (error) => console.log(error),
          () => console.log('stateSubscription completed')
        );
      },
      (error) => console.log(error)
    );
  }

  async openFirebaseCreateModal() {
    const modal = await this.modalController.create({
      component: CreateTicketModal,
      componentProps: {
        // segmentValue : this.segmentValue,
        segmentValueSubject: this.segmentValueSubject
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  searchList() {
    this.searchSubject.next({
      query: this.searchQuery
    });
  }
/*   segmentChanged(ev:any) {
    //console.log(ev.detail.value);
    //console.log(ev.target.value);
    this.segmentValue = ev.detail.value;

    // Check if there's any filter and apply it
    //this.searchList();
  } */
}
