import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController,  IonRouterOutlet} from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel, FirebaseCombinedItemModel } from '../firebase-item.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
import { SliderModal } from '../slider/slider.modal';
import { DataStore } from '../../../shell/data-store';
import { Observable } from 'rxjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { Images } from '../../../type'

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})


export class FirebaseItemDetailsPage implements OnInit {
  noImage = 'images/no_image.jpeg';
  item: FirebaseCombinedItemModel;
  profileUrl: Observable<string | null>;
  sliderUrl: Observable<string | null>;
  photoSlider : any[] = [''];  
  
  photoSliderEmpty : any[];
  slidesOptions = {
      zoom: {
      toggle: true // Disable zooming to prevent weird double tap zomming on slide images
    } 
  }; 
  status : string;
  userIsCreator = false;
  postImages : Images[] = [];

  @HostBinding('class.is-shell') get isShell() {
    return ((this.item && this.item.isShell)/* || (this.relatedUsers && this.relatedUsers.isShell)*/) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private featureService : FeatureService,
    private loginService : LoginService,
    private routerOutlet: IonRouterOutlet
  ) { 
    }

  ngOnInit() {
    this.route.data.subscribe((resolvedRouteData) => {    
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseCombinedItemModel> = resolvedDataStores.item;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
         (state) => {
           console.log("itemData-details", state)
          this.item = state;
          if((this.item.images.length !== 0) && !(this.item.isShell)){
            console.log("length !== 0",this.item.photos.length);
            this.photoSlider = this.item.photos.map(res => {return res.photoData});
            this.postImages = this.item.photos;
          }
          else if((this.item.images.length == 0) && !(this.item.isShell)){
            this.getPic(this.noImage).subscribe(a=>{this.photoSlider[0] = a});
            console.log("length === 0", this.photoSlider[0]);
            this.postImages = [];
          }
          this.userIsCreator = this.item.createdBy == this.loginService.getLoginID() ? true : false;
          switch (this.item.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "inactive" : this.status = this.featureService.translations.InActive;
            break;
            case "closed" : this.status = this.featureService.translations.Closed;
            break;
            default:
              this.status = "";
          }
/*           else if(!(this.item.isShell)){
            this.getPic(this.noImage).subscribe(a=>{this.photoSlider[0] = a});
            console.log("length === 0 - 2", this.photoSlider[0]);
          } */
        }
      );
        /*relatedUsersDataStore.state.subscribe(
        (state) => {
          this.relatedUsers = state;
        }
        ); */
    });
  }

  async openFirebaseUpdateModal() {

    const {photos, creatorDetails, ...itemData} = this.item; // Remove photos and creatorDetails from the item object

    //let itemToUpdate : FirebaseItemModel;
    // delete this.item.photos;
    // delete this.item.isShell;
    //let itemToEdit = <FirebaseItemModel>this.item;
    //console.log("before modal, ",itemToEdit);
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': itemData as FirebaseItemModel,
        'postImages' : this.postImages as Images[]
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  async openSliderModal(){
    const modal = await this.modalController.create({
      component: SliderModal, 
      componentProps: {
        'photoSlider' : this.photoSlider
      },
      swipeToClose: true, 
      presentingElement: this.routerOutlet.nativeEl,
      cssClass: 'sliderModal'
      
    });
    await modal.present();
  }

  getPic(picPath : string): Observable<any>{
    const ref = this.firebaseService.afstore.ref(picPath);
    return ref.getDownloadURL();
  }
/*     getPics(imagesFullPath : string[]){
    this.photoSlider = [""];
    for (let index = 0; index < imagesFullPath.length; index++) {
     this.firebaseService.afstore.ref(imagesFullPath[index]).getDownloadURL().toPromise().then(DownloadURL => { this.photoSlider[index] = DownloadURL } );
    }
    console.log('photoSlider',this.photoSlider);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  } */

  sendEmail(){
    const email = {
      to: this.item.creatorDetails.email,
      subject: this.item.subject,
      body: 'How are you?',
      isHtml: true
    }

    this.featureService.emailComposer.isAvailable().then((available: boolean) => {
      if(available) {
        this.featureService.emailComposer.open(email)
        // Now we know we can send an email, calls hasClient and hasAccount
        // Not specifying an app will return true if at least one email client is configured
      }
     });
/* let email = {
  to: this.'max@mustermann.de',
  cc: 'erika@mustermann.de',
  bcc: ['john@doe.com', 'jane@doe.com'],
  attachments: [
    'file://img/logo.png',
    'res://icon.png',
    'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
    'file://README.pdf'
  ],
  subject: 'Cordova Icons',
  body: 'How are you? Nice greetings from Leipzig',
  isHtml: true
} */
  }
}
