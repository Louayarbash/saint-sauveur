import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, ReplaySubject, Subscription, merge } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
//import { FirebaseCreateUserModal } from '../user/create/firebase-create-user.modal';
import { LoginService } from '../../services/login/login.service';
import { DataStore, ShellModel } from '../../shell/data-store';
import { InviteModal } from '../../buildings/building/invite/invite.modal';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html'
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  searchQuery: string;
  activeToggle: boolean = true;
  // showAgeFilter = false;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

/*   activeToggleSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  activeToggleFiltersObservable: Observable<any> = this.activeToggleSubject.asObservable(); */

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;
  ltr: boolean;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private loginService: LoginService
  ) { }

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.ltr= this.loginService.getUserLanguage() == 'ar' ? false : true;   
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
              new FirebaseListingItemModel(),
              new FirebaseListingItemModel()
            ];
            // Wait on purpose some time to ensure the shell animation gets shown while loading filtered data
            const searchingDelay = 0;

            //const dataSourceWithShellObservable = DataStore.AppendShell(filteredDataSource, searchingShellModel, searchingDelay);
            const dataSourceWithShellObservable = DataStore.AppendShell(this.listingDataStore.state, searchingShellModel, searchingDelay);
            
            return dataSourceWithShellObservable.pipe(
              map(filteredItems => {
                // Just filter items by name if there is a search query and they are not shell values
                if (/*filters.query !== '' &&*/ !filteredItems.isShell) {
                  //console.log(filters.query)
                  //console.log(filters.toggle)
                  const queryFilteredItems = filteredItems.filter(                    
                    item =>                     
                    (// item.app.toLowerCase().includes(filters.query.toLowerCase()) || 
                    item.firstname.toLowerCase().concat(' ').concat(item.lastname.toLowerCase()).includes(filters.query.toLowerCase()) && (item.status == (filters.toggle ? "active" : "inactive" ) ))
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
            //console.log("USERS",this.items)
          },
          (error) => console.log(error),
          () => console.log('stateSubscription completed')
        );
      },
      (error) => console.log(error)
    );
  }

/*   async openFirebaseCreateModal() {
    const modal = await this.modalController.create({
      component: FirebaseCreateUserModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  } */

  async inviteModal() {
    const modal = await this.modalController.create({
      component: InviteModal,
/*       componentProps: {
        'item': this.item
      }, */
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }

  searchList() {
    //console.log("louay",this.activeToggle)
    this.searchSubject.next({
      query: this.searchQuery,
      toggle: this.activeToggle
    });
  }
/*   searchActiveToggle() {
    this.activeToggleSubject.next({
      query: this.activeToggle
    });
  } */
}
