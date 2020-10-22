import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import dayjs from 'dayjs';
import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
import { LoginService } from "../../services/login/login.service"
import { DataStore, ShellModel } from '../../shell/data-store';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html'
})

export class FirebaseListingPage implements OnInit, OnDestroy {
  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;
  userIsAdmin = false;
  items: Array<FirebaseListingItemModel> & ShellModel;
  segmentValue = 'upcoming';
  upcomingList: Array<FirebaseListingItemModel>;
  archiveList: Array<FirebaseListingItemModel>;
  segmentValueSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
  segmentValueSubjectObservable: Observable<string> = this.segmentValueSubject.asObservable();

   @HostBinding('class.is-shell') get isShell() {
    return (this.items ) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private loginService: LoginService
  ) {
  }
  
  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.segmentValueSubjectObservable.subscribe(newTabValue=> this.segmentValue= newTabValue);
    console.log("oninit")
    this.userIsAdmin = this.loginService.isUserAdmin();
    // Route data is a cold subscription, no need to unsubscribe?
    this.route.data.subscribe(
      (resolvedRouteData) => {
        console.log("this.item", resolvedRouteData)
        this.listingDataStore = resolvedRouteData['data'];

        this.stateSubscription = this.listingDataStore.state
        .subscribe(
         (state) => {
            this.items = state;
            if(!this.items.isShell) {
/*             this.items.map(item => {
              item.date = dayjs(item.dateTS * 1000).format('DD, MMM, YYYY');
              item.startTime = dayjs(item.startDate).format("HH:mm"); 
              item.endTime = dayjs(item.endDate).format('HH:mm');
            }); */

              let upcomingList= this.items; 
              let archiveList= this.items;            
               
              this.upcomingList = upcomingList.filter(item => item.startDateTS > dayjs().unix());
              this.archiveList = archiveList.filter(item => item.startDateTS < dayjs().unix());
            
          }
            else {
              this.upcomingList = this.items;
              this.archiveList = this.items;
            }
            console.log("this.item", this.items)
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
      component: FirebaseCreateItemModal,
      componentProps: {
        segmentValue : this.segmentValue,
        segmentValueSubject: this.segmentValueSubject
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  segmentChanged(ev:any) {
    this.segmentValue = ev.detail.value;
  }
}