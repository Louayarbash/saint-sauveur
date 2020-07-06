import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
//import { Crop } from '@ionic-native/crop/ngx';
import { File } from "@ionic-native/file/ngx";
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { PhotosData } from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import firebase from 'firebase/app';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';

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
  postImages : PhotosData[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  selectedPhoto: string;
  uploadedImage: any;
  typeSelected: string = 'sale';
  objectSelected: string = 'condo';

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private camera: Camera,    
    //private alertController: AlertController,
    //private _crop: Crop,
    private file: File,
    private imagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService,
    private actionSheetController : ActionSheetController
  ) { }

  ngOnInit() {
    this.createItemForm = new FormGroup({
      type : new FormControl('sale', Validators.required),
      object : new FormControl('condo', Validators.required),
      bedRooms: new FormControl(0, counterRangeValidator(0, 10)),
      bathRooms: new FormControl(0, counterRangeValidator(0, 8)),
      floor: new FormControl(0, counterRangeValidator(0, 30)),
      balcony: new FormControl(false),
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
    
    this.firebaseService.createItem(this.itemData, this.postImages)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.PostAddedSuccessfully, 2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.PostAddingErrors, 2000);
      this.dismissModal();
      console.log(err);
     });     
  }

  typeChanged(ev:any) {
    console.log(ev.detail.value);
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

async selectImageSource() {
  const cameraOptions: CameraOptions = {
    allowEdit:true,
    quality: 100,
    //targetWidth: 500,
    //targetHeight: 600,
    // destinationType: this.camera.DestinationType.DATA_URL,
    destinationType: this.camera.DestinationType.FILE_URI, 
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    sourceType:this.camera.PictureSourceType.CAMERA
  };
  
  const pickerOptions: ImagePickerOptions = {
    maximumImagesCount: 3 - this.postImages.length,
    outputType: 0,
    quality: 100,
    // disable_popover: false,
    width:500,
    height:500,
    message:"aywa",
    title:"boo"
  };

  const actionSheet = await this.actionSheetController.create({
    header: 'Select images source',
    cssClass: 'my-custom-class',
    buttons: [/* {
      text: 'Delete',
      role: 'destructive',
      icon: 'trash',
      handler: () => {
        console.log('Delete clicked');
      }
    }, */ {
      text: this.featureService.translations.PhotoGallery,
      icon: 'images',
      handler: () => {
        // if((3 - this.postImages.length) !== 1 ){            
          //this.imagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
           this.imagePicker.getPictures(pickerOptions).then( async (imageData : string[]) => {
             console.log(imageData) 
            //const loading = this.featureService.presentLoadingWithOptions(5000);
             for (let i = 0; i < imageData.length; i++) {
                const filename = imageData[i].substring(imageData[i].lastIndexOf('/') + 1);
                const path = imageData[i].substring(0,imageData[i].lastIndexOf('/') + 1);
                console.log("filename",filename)
                console.log("path",path)
                  await this.file.readAsDataURL(path, filename).then((image)=> {
                  const photos : PhotosData = {isCover:false, photo:'', storagePath:''};
                  photos.isCover = false;
                  photos.photo = image;
                  this.postImages[this.postImages.length] = photos;
                }
              ).catch(err => console.log(err));
            }
          this.changeRef.detectChanges(); 
          // loading.then(res=>res.dismiss());
          }, (err) => { console.log('Error get pics',err);}
        );  
        // }
/*           else if((3 - this.postImages.length) == 1)
          {
            cameraOptions.sourceType = 0;
            this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
              console.log(imageData);
              // URI
              const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
              const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
              console.log("filename",filename)
              console.log("path",path)
              await this.file.readAsDataURL(path, filename).then((image)=> {
                const photos : PhotosData = {isCover:false, photo:'', storagePath:''};
                photos.isCover = false;
                photos.photo = image;
                this.postImages[this.postImages.length] = photos;
                this.changeRef.detectChanges();
            // URL
             const image = "data:image/jpeg;base64," + imageData;
              let photos : PhotosData = {isCover:false, photo:"", storagePath:""};    
              photos.isCover = false;
              photos.photo = image;
              this.postImages[this.postImages.length] = photos;
              this.changeRef.detectChanges(); 
            }).catch(err => console.log(err));
          });
      } */
    }
  }/* , {
      text: 'Play (open modal)',
      icon: 'caret-forward-circle',
      handler: () => {
        console.log('Play clicked');
      }
    } */, {
      text: 'Camera',
      icon: 'camera',
      handler: () => {
        // cameraOptions.sourceType = 1;
        this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
          const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
          const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
          await this.file.readAsDataURL(path, filename).then((image)=> {
            const photos : PhotosData = {isCover:false, photo:'', storagePath:''};
            photos.isCover = false;
            photos.photo = image;
            this.postImages[this.postImages.length] = photos;
            this.changeRef.detectChanges();

          /*const photos : PhotosData = {isCover:false, photo:'', storagePath:''};
          const image = "data:image/jpeg;base64," + imageData;
          photos.isCover = false;
          photos.photo = image;
          this.postImages[this.postImages.length] = photos;
          this.changeRef.detectChanges();*/
        }).catch(err => console.log(err));
      })
    }
    }, {
      text: 'Cancel',
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]
  });
  console.log("SelectPhotos",this.postImages);
  await actionSheet.present();
}

}
