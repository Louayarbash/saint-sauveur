import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject, Subscription, merge } from 'rxjs';
import { FirebaseService } from '../firebase-integration.service';
import { NotificationListingItemModel } from './firebase-listing.model';
import { LoginService } from '../../services/login/login.service';
import { FeatureService } from '../../services/feature/feature.service';
import { DataStore, ShellModel } from '../../shell/data-store';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html'
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  
  segmentValueSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
  segmentValueSubjectObservable: Observable<string> = this.segmentValueSubject.asObservable();
  listingDataStore: DataStore<Array<NotificationListingItemModel>>;
  stateSubscription: Subscription;
  userIsAdmin= false;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<NotificationListingItemModel> & ShellModel;
  notificationsList: Array<NotificationListingItemModel>;


  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    //private routerOutlet: IonRouterOutlet,
    private loginService: LoginService,
    private featureService: FeatureService,
    private menu: MenuController
  ) {  }

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.menu.enable(true); 
    this.userIsAdmin = this.loginService.isUserAdmin();
    //this.getUsersList(null)
    // Route data is a cold subscription, no need to unsubscribe?
 
    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data'];

        // Keep track of the subscription to unsubscribe onDestroy
        // Merge filteredData with the original dataStore state
        this.stateSubscription = merge(
          this.listingDataStore.state
          
        ).subscribe(
          (state) => {
            this.items = state;
            this.notificationsList = this.items;
            //if (event) event.target.complete();
            if(!this.items.isShell){

              this.items.map( item => {
         
                switch (item.type) {
                  case "sale" : item.typeTranslation = this.featureService.translations.SaleMenu;
                  break;
                  case "rent-sale" : item.typeTranslation = this.featureService.translations.RentSaleMenu;
                  break;
                  case "lost-found" : item.typeTranslation = this.featureService.translations.LostFoundMenu;
                  break;
                  case "publications" : item.typeTranslation = this.featureService.translations.PublicationsMenu;
                  break;
                  case "events" : item.typeTranslation = this.featureService.translations.EventsMenu;
                  break;
                  case "deal" : item.typeTranslation = this.featureService.translations.ParkingDealsMenu;
                  break;
                  default:
                    item.typeTranslation = item.typeTranslation;
                }  
              });

              this.notificationsList == this.items;

            }
             else {
              this.notificationsList= this.items;

            }
             console.log("notiications",this.items)
          },
          (error) => console.log(error),
          () => console.log('stateSubscription completed')
        );

/*         if (event)
        setTimeout(() => {
          console.log('Async operation has ended');
          event.target.complete();
        }, 2000); */
        
      },
      (error) => { console.log(error) 
/*       if (event)
      event.target.complete(); */
    }
    )  
  }  
}
