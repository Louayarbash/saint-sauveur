import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel, FirebaseCombinedItemModel } from '../firebase-item.model';
import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';

import { DataStore, ShellModel } from '../../../shell/data-store';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})


export class FirebaseItemDetailsPage implements OnInit {
  noImage = "images/no_image.jpeg";
  item: FirebaseCombinedItemModel;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
  profileUrl: Observable<string | null>;
  sliderUrl: Observable<string | null>;
  photoSlider : any[] = [""];  
  photoSliderEmpty : any[];
  slidesOptions: any = {
    zoom: {
      toggle: false // Disable zooming to prevent weird double tap zomming on slide images
    }
  };

  @HostBinding('class.is-shell') get isShell() {
    return ((this.item && this.item.isShell) || (this.relatedUsers && this.relatedUsers.isShell)) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute
  ) { 
    }

  ngOnInit() {
    
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseCombinedItemModel> = resolvedDataStores.item;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
         async (state) => {
          this.item = state;
            console.log("imagesFullPath.length",this.item.fileFullPath.length);
          if((this.item.fileFullPath.length !== 0) && !(this.item.isShell)){
            console.log("length !== 0");
            this.photoSlider = this.item.photos;            
          }
          else if((this.item.fileFullPath.length == 0) && !(this.item.isShell)){
            this.getPic(this.noImage).subscribe(a=>{this.photoSlider[0] = a});
            console.log("length === 0", this.photoSlider[0]);
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
    //let itemToUpdate : FirebaseItemModel;
    delete this.item.photos;
    delete this.item.isShell;
    //let itemToEdit = <FirebaseItemModel>this.item;
    //console.log("before modal, ",itemToEdit);
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as FirebaseItemModel
      }
    });
    await modal.present();
  }
  getPic(picPath : string): Observable<any>{
    const ref = this.firebaseService.afstore.ref(picPath);
    return ref.getDownloadURL();
  }
/*  getPics(imagesFullPath : string[]){
    this.photoSlider = [""];
    for (let index = 0; index < imagesFullPath.length; index++) {
     this.firebaseService.afstore.ref(imagesFullPath[index]).getDownloadURL().toPromise().then(DownloadURL => { this.photoSlider[index] = DownloadURL } );
    }
    console.log('photoSlider',this.photoSlider);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  } */
}
