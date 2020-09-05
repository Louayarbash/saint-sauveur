import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
//import { Crop } from '@ionic-native/crop/ngx';
// import { File } from "@ionic-native/file/ngx";
// import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Images } from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import firebase from 'firebase/app';
// import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';

@Component({
  selector: 'app-firebase-create-itemRentSale',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})
export class FirebaseCreateItemModal implements OnInit {
  croppedImagepath = "";
  postImages : Images[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  selectedPhoto: string;
  uploadedImage: any;
  typeSelected: string = 'lost';

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    // private camera: Camera,    
    // private alertController: AlertController,
    // private _crop: Crop,
    // private file: File,
    // private imagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService,
    // private actionSheetController : ActionSheetController
  ) { }

  ngOnInit() {
    this.createItemForm = new FormGroup({
      type : new FormControl('lost', Validators.required),
      subject : new FormControl('', Validators.required),
      details : new FormControl(''),
      status : new FormControl('active')
    });
  }

  dismissModal() {
   this.modalController.dismiss();
  }

   createItem() {
    this.itemData.type = this.createItemForm.value.type;
    this.itemData.subject = this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.getBuildingId();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    
    this.featureService.createItemWithImages(this.itemData, this.postImages, 'lost-found')
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      console.log(err);
     });     
  }

  typeChanged(ev:any) {
    console.log(ev.detail.value);
    this.typeSelected = ev.detail.value;
  }
  
  deletePhoto(index : number){
      console.log("deletephoto",this.postImages);
          this.postImages.splice(index,1);
          this.changeRef.detectChanges();
  }

makeCover(index: number){
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
}

doReorder(ev: any) {
/*   if (ev.cancelable) {
    ev.preventDefault();
 }
 else{ */
  console.log("doReorder",this.postImages);
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  const draggedItem = this.postImages.splice(ev.detail.from, 1)[0];  
  this.postImages.splice(ev.detail.to, 0, draggedItem);
  this.createItemForm.markAsDirty();
  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  ev.detail.complete();
}

selectImageSource() {
  this.featureService.selectImageSource(10, this.postImages.length, this.postImages, null)
}
}
