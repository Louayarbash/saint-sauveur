import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
// import { FormGroup } from '@angular/forms';
import { ModalController, IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Observable, ReplaySubject, Subscription } from 'rxjs';
// import { switchMap, map } from 'rxjs/operators';

import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingItemModel } from './firebase-listing.model';
import { FirebaseCreateItemModal } from '../item/create/firebase-create-item.modal';
import { LoginService } from '../../services/login/login.service';
import { DataStore, ShellModel } from '../../shell/data-store';
//import { Toast } from '@ionic-native/toast/ngx';
//import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
//import { File } from '@ionic-native/file/ngx';
//import { FileOpener } from '@ionic-native/file-opener/ngx';

@Component({
  selector: 'app-firebase-listing',
  templateUrl: './firebase-listing.page.html',
  styleUrls: [
    './styles/firebase-listing.page.scss',
    './styles/firebase-listing.shell.scss'
  ],
})
export class FirebaseListingPage implements OnInit, OnDestroy {
  // rangeForm: FormGroup;
  // searchQuery: string;
  // showAgeFilter = false;
  // CoverPic:string;
  segmentValueSubject: ReplaySubject<string> = new ReplaySubject<string>(1);
  segmentValueSubjectObservable: Observable<string> = this.segmentValueSubject.asObservable();

  listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  stateSubscription: Subscription;

  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  items: Array<FirebaseListingItemModel> & ShellModel;
  segmentValue = 'lost';
  lostList: Array<FirebaseListingItemModel>;
  foundList: Array<FirebaseListingItemModel>;
  stolenList: Array<FirebaseListingItemModel>;
  myList: Array<FirebaseListingItemModel>;

  @HostBinding('class.is-shell') get isShell() {
    return (this.items && this.items.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private loginService: LoginService
    //private document: DocumentViewer,
    //private file:File,
    //private fileOpener:FileOpener
  ) { 

  }

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.segmentValueSubjectObservable.subscribe(newTabValue=> this.segmentValue= newTabValue);
    
    // this.searchQuery = '';

    // Route data is a cold subscription, no need to unsubscribe?
    this.route.data.subscribe(
      (resolvedRouteData) => {
        this.listingDataStore = resolvedRouteData['data'];

        // We need to avoid having multiple firebase subscriptions open at the same time to avoid memory leaks
        // By using a switchMap to cancel previous subscription each time a new one arrives,
        // we ensure having just one subscription (the latest)
/*         const updateSearchObservable = this.searchFiltersObservable.pipe(
          switchMap((filters) => {
            // Send a shell until we have filtered data from Firebase
            const searchingShellModel = [
              new FirebaseListingItemModel(),
              new FirebaseListingItemModel()
            ];
            // Wait on purpose some time to ensure the shell animation gets shown while loading filtered data
            const searchingDelay = 400;

            //const dataSourceWithShellObservable = DataStore.AppendShell(filteredDataSource, searchingShellModel, searchingDelay);
            const dataSourceWithShellObservable = DataStore.AppendShell(this.listingDataStore.state, searchingShellModel, searchingDelay);
            
            return dataSourceWithShellObservable.pipe(
              map(filteredItems => {
                // Just filter items by name if there is a search query and they are not shell values
                if (filters.query !== '' && !filteredItems.isShell) {
                  const queryFilteredItems = filteredItems.filter(
                    item =>
                   (item.object.toLowerCase().includes(filters.query.toLowerCase()))
                    )
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
        this.stateSubscription = this.listingDataStore.state.subscribe(
          (state) => {
            console.log("itemData listing",this.items)
            this.items = state;
            if(this.items.isShell == false){
              this.items.map(item => { 
                if(item.images.length > 0){
                  let cover = item.images.find( res => res.isCover == true );
                  if(cover) {
                    this.getProfilePic(cover.storagePath).then(res => item.coverPhotoData = res).catch(err => {item.coverPhotoData = "" ; console.log("CoverPhotoNotFound1",err)});
                    }
                    else{
                    this.getProfilePic(item.images[0].storagePath).then(res => item.coverPhotoData = res).catch(err => {
                      if(err.code === 'storage/object-not-found'){
                        //this.getProfilePic('images/no_image.jpeg').then(res => item.coverPhotoData = res)  
                        item.coverPhotoData = "./assets/sample-images/no_image.jpeg"    
                      }
                      item.coverPhotoData = '' ;
                    });
                    }
                }
                else {
                  item.coverPhotoData ="./assets/sample-images/no_image.jpeg"
                 // this.getProfilePic('images/no_image.jpeg')
                 // .then(res => item.coverPhotoData = res)
                 // .catch( err => { 
                  //  console.log(err); 
                  //  item.coverPhotoData = '' ;} 
                  //  );
              } 
              });
              let lostList= this.items; 
              let foundList= this.items;
              let stolenList= this.items;
              let myList= this.items;

              this.lostList = lostList.filter(item => item.type === 'lost' && item.status === 'active');
              this.foundList = foundList.filter(item => item.type === 'found' && item.status === 'active');
              this.stolenList = stolenList.filter(item => item.type === 'stolen' && item.status === 'active');
              this.myList = myList.filter(item => item.createdBy === this.loginService.getLoginID());
            }
            else {
              this.lostList = this.items;
              this.foundList = this.items;
              this.stolenList = this.items;
            }
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

/*   searchList() {
    this.searchSubject.next({
      query: this.searchQuery
    });
  } */

/*   OpenLocalPDF() {
    console.log("OpenLocalPDF:",this.file.dataDirectory);
    let filePath = this.file.applicationDirectory + "www/assets/"
    let fakeName = Date.now();
    this.file.copyFile(filePath,"NaraMenu.pdf",this.file.dataDirectory,`${fakeName}.pdf`).then(result => {
      this.fileOpener.open(result.nativeURL,'application/pdf');
    });
    
    const options: DocumentViewerOptions = {
       title: 'My PDF'
    }
    this.document.viewDocument(filePath +"/NaraMenu.pdf", 'application/pdf', options) 
  } */
  getProfilePic(picPath : string){
    return this.firebaseService.afstore.storage.ref(picPath).getDownloadURL();
  }

/*   segmentChanged(ev:any) {
    console.log('parent',ev.detail.value);
    this.segmentValue = ev.detail.value;

  } */
}
