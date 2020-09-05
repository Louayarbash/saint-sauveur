import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
// import { FormGroup, FormControl } from '@angular/forms';
import { ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, ReplaySubject, Subscription, merge } from 'rxjs';
// import { switchMap, map } from 'rxjs/operators';

import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';

import { DataStore, ShellModel } from '../../shell/data-store';
//import { Toast } from '@ionic-native/toast/ngx';
// import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { LoginService } from "../../services/login/login.service"
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';



@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html',
  styleUrls: [
    './styles/firebase-listing.page.scss',
    './styles/firebase-listing.ios.scss',
    './styles/firebase-listing.shell.scss'
  ],
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  // rangeForm: FormGroup;
  // searchQuery: string;
  // showAgeFilter = false;
  // CoverPic:string;
  // searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  // searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

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
    // private document: DocumentViewer,
    private file:File,
    private fileOpener:FileOpener,
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
              let eventsList= this.items;

              this.announcementsList = announcementsList.filter(item => item.category === 'announcement' );
              this.regulationsList = regulationsList.filter(item => item.category === 'regulation');
              this.eventsList = eventsList.filter(item => item.category === 'event');

            }
            else {
              this.announcementsList = this.items;
              this.regulationsList = this.items;
              this.eventsList = this.items;
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

  OpenLocalPDF() {
    console.log("OpenLocalPDF:",this.file.dataDirectory);
    let filePath = this.file.applicationDirectory + "www/assets/"
    let fakeName = Date.now();
    this.file.copyFile(filePath,"NaraMenu.pdf",this.file.dataDirectory,`${fakeName}.pdf`).then(result => {
      this.fileOpener.open(result.nativeURL,'application/pdf');
    });
  }

  segmentChanged(ev:any) {
    //console.log(ev.detail.value);
    //console.log(ev.target.value);
    this.segmentValue = ev.detail.value;

    // Check if there's any filter and apply it
    //this.searchList();
  }
}
