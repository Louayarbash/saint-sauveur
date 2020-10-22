import { Component, OnInit,ChangeDetectorRef, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
// import { Crop } from '@ionic-native/crop/ngx';
// import { File } from "@ionic-native/file/ngx";
// import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Images } from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import firebase from 'firebase/app';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-firebase-create-itemRentSale',
  templateUrl: './firebase-create-item.modal.html'
})
export class FirebaseCreateItemModal implements OnInit {
  // @Input() segmentValue: string;
  @Input() segmentValueSubject: ReplaySubject<string>;
  croppedImagepath = "";
  postImages : Images[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  selectedPhoto: string;
  uploadedImage: any;
  typeSelected: string = 'sale';
  objectSelected: string = 'condo';

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    // private camera: Camera,    
    //private alertController: AlertController,
    //private _crop: Crop,
    // private file: File,
    // private imagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService,
    // private actionSheetController : ActionSheetController
  ) { }

  ngOnInit() {
    this.createItemForm = new FormGroup({
      type : new FormControl('sale', Validators.required),
      object : new FormControl('condo', Validators.required),
      bedRooms: new FormControl(0, counterRangeValidator(0, 10)),
      bathRooms: new FormControl(0, counterRangeValidator(0, 8)),
      floor: new FormControl(0, counterRangeValidator(0, 30)),
      balcony: new FormControl(0, counterRangeValidator(0, 5)),
      //balcony: new FormControl(false),
      description : new FormControl(''),
      price : new FormControl('',[Validators.required, Validators.pattern('^[0-9]*$')]),
      status : new FormControl('active')
    });
  }

  dismissModal() {
   this.modalController.dismiss();
  }

   createItem() {
     if(this.objectSelected == 'condo'){
      this.itemData.bedRooms = this.createItemForm.value.bedRooms;
      this.itemData.bathRooms = this.createItemForm.value.bathRooms;
      this.itemData.floor = this.createItemForm.value.floor;
      this.itemData.balcony = this.createItemForm.value.balcony;
     }
    this.itemData.type = this.createItemForm.value.type;
    this.itemData.object = this.createItemForm.value.object;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.getBuildingId();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    const {isShell, ...itemData} = this.itemData;
    this.featureService.createItemWithImages(itemData, this.postImages, 'rent-sale')
    .then(() => {
      this.segmentValueSubject.next('myList');
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      this.dismissModal(); // not needed inside catch to stay on same page while errors
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      loading.then(res=>res.dismiss());  
      console.log(err);
     });     
  }

  typeChanged(ev:any) {
    // console.log(ev.detail.value);
    this.typeSelected = ev.detail.value;
  } 

  objectChanged(ev:any) {
    console.log(ev.detail.value);
    this.objectSelected = ev.detail.value;
    if(this.objectSelected == 'condo'){
      this.createItemForm.controls['bedRooms'].setValidators(counterRangeValidator(0, 10));
      this.createItemForm.controls['bathRooms'].setValidators(counterRangeValidator(0, 8));
      this.createItemForm.controls['floor'].setValidators(counterRangeValidator(0, 30));
    }
    else {
      this.createItemForm.controls['bedRooms'].setValidators(null);
      this.createItemForm.controls['bathRooms'].setValidators(null);
      this.createItemForm.controls['floor'].setValidators(null);
    }
    this.createItemForm.controls['bedRooms'].updateValueAndValidity();
    this.createItemForm.controls['bathRooms'].updateValueAndValidity();
    this.createItemForm.controls['floor'].updateValueAndValidity();
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
