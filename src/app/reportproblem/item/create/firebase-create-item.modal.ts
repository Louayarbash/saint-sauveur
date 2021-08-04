import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { Images } from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import firebase from 'firebase/app';
import { Plugins } from '@capacitor/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html'
})
export class FirebaseCreateItemModal implements OnInit {
  //@Input() segmentValueSubject: ReplaySubject<string>;
  croppedImagepath = "";
  postImages : Images[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel= new FirebaseItemModel();
  selectedPhoto: string;
  uploadedImage: any;
  deviceInfo: string;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService,
    private platform: Platform,
    private router: Router
  ) { }

  ngOnInit() {
    this.createItemForm = new FormGroup({
      //object: new FormControl('', Validators.required),
      description : new FormControl('', Validators.required),
      //phone : new FormControl('android'),
      //model: new FormControl('')
    });
  }

  /*dismissModal() {
   this.modalController.dismiss();
  } */

   async createItem() {
    
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.getBuildingId();
    this.itemData.deviceInfo = this.platform.platforms();  
    let deviceInfo  = await Plugins.Device.getInfo();
    this.itemData.deviceInfo2 = deviceInfo;  
    this.itemData.userId = this.loginService.getLoginID();
    this.itemData.userEmail = this.loginService.getLoginEmail();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    const {isShell, ...itemData} = this.itemData;
    this.featureService.createItemWithImages(itemData, this.postImages, 'problems')
    .then(() => {
      //this.segmentValueSubject.next('myList');
      this.featureService.presentToast(this.featureService.translations.ThankYouForContactingUs, 3000);      
      this.router.navigate(['start-menu']);  // not needed inside catch to stay on same page while errors
      loading.then(res=>{res.dismiss();}) 
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 3000);
      loading.then(res=>{res.dismiss();})
      console.log(err);
     });     
  }
  
  deletePhoto(index : number){
      console.log("deletephoto",this.postImages);
          this.postImages.splice(index,1);
          this.changeRef.detectChanges();
  }

/* makeCover(index: number){
  //this.postImages[index].isCover = true;
  this.postImages.forEach( (item, i) => {
    if(i === index) {
      item.isCover = true;
      this.changeRef.detectChanges();
      this.featureService.presentToast(this.featureService.translations.PhotoAsCover,2000);
    }
    else {
      item.isCover = false;
    }
  });
} */

doReorder(ev: any) {
  const draggedItem = this.postImages.splice(ev.detail.from, 1)[0];  
  this.postImages.splice(ev.detail.to, 0, draggedItem);
  this.createItemForm.markAsDirty();
  ev.detail.complete();

}

 selectImageSource() {
   this.featureService.selectImageSource(3, this.postImages.length, this.postImages, null)
   
}

}
