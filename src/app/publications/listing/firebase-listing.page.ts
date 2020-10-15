import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
import { DataStore, ShellModel } from '../../shell/data-store';
import { LoginService } from "../../services/login/login.service"

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html'
})

export class FirebaseListingPage implements OnInit, OnDestroy {

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;
  userIsAdmin = false;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;
  segmentValue = 'announcements';
  announcementsList: Array<FirebaseListingItemModel>;
  regulationsList: Array<FirebaseListingItemModel>;
  eventsList: Array<FirebaseListingItemModel>;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private loginService: LoginService
    // private transfer : FileTransfer
  ) { }
  
  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.userIsAdmin = this.loginService.isUserAdmin();
/*     this.searchQuery = '';

    this.rangeForm = new FormGroup({
      dual: new FormControl({lower: 1, upper: 100})
    }); */

    // Route data is a cold subscription, no need to unsubscribe?
    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data'];

        this.stateSubscription = this.listingDataStore.state
        .subscribe(
         (state) => {
            this.items = state;
            console.log("this.item", this.items)
          
            if(this.items.isShell == false) {
/*              this.items.map(item => {
                item.date = dayjs(item.date).format('DD, MMM, YYYY');
                item.startTimeCounter = dayjs(item.startDateTS * 1000).format('MM/DD/YYYY HH:mm:ss');
                item.endTimeCounter = dayjs(item.endDateTS * 1000).format('MM/DD/YYYY HH:mm:ss');
                item.startTime = dayjs(item.startDate).format("HH:mm");
                item.endTime = dayjs(item.endDate).format('HH:mm');
              }); */

              let announcementsList= this.items; 
              let regulationsList= this.items;

              this.announcementsList = announcementsList.filter(item => item.category === 'announcement' );
              this.regulationsList = regulationsList.filter(item => item.category === 'regulation');

            }
            else {
              this.announcementsList = this.items;
              this.regulationsList = this.items;

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
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

/*   OpenLocalPDF() {
    console.log("OpenLocalPDF:",this.file.dataDirectory);
    let filePath = this.file.applicationDirectory + "www/assets/"
    let fakeName = Date.now();
    this.file.copyFile(filePath,"NaraMenu.pdf",this.file.dataDirectory,`${fakeName}.pdf`).then(result => {
      this.fileOpener.open(result.nativeURL,'application/pdf');
    });
  } */

  segmentChanged(ev:any) {
    //console.log(ev.detail.value);
    //console.log(ev.target.value);
    this.segmentValue = ev.detail.value;

    // Check if there's any filter and apply it
    //this.searchList();
  }
}
