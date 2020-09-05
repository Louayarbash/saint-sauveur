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

@Component({
  selector: 'app-firebase-create-item',
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
      object: new FormControl('', Validators.required),
      description : new FormControl(''),
      price : new FormControl('',[Validators.required, Validators.pattern('^[0-9]*$')])// ,
      // status : new FormControl('active')
    });
  }

  dismissModal() {
   this.modalController.dismiss();
  }

   createItem() {
    // console.log("postImages",this.postImages);
    this.itemData.object = this.createItemForm.value.object;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    // this.itemData.status = this.createItemForm.value.status;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.getBuildingId();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    this.featureService.createItemWithImages(this.itemData, this.postImages, 'posts')
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      loading.then(res=>{res.dismiss();}) 
      this.dismissModal();  // not needed inside catch to stay on same page while errors
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      loading.then(res=>{res.dismiss();})
      console.log(err);
     });     
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
  // console.log("doReorder",this.postImages);
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
   this.featureService.selectImageSource(3, this.postImages.length, this.postImages, null)
}

/* async selectImageSource(maxLength: number, currentLength: number) {
  const cameraOptions: CameraOptions = {
    allowEdit:true,
    quality: 100,
    destinationType: this.camera.DestinationType.FILE_URI, 
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    sourceType:this.camera.PictureSourceType.CAMERA
  };
  
  const pickerOptions: ImagePickerOptions = {
    maximumImagesCount: maxLength - currentLength,
    outputType: 0,
    quality: 100,
    width:500,
    height:500,
    message:"aywa",
    title:"boooo"
  };

  const actionSheet = await this.actionSheetController.create({
    header: 'Select images source',
    cssClass: 'my-custom-class',
    buttons: [ {
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
                  const photos : Images = {isCover:false, photoData: '', storagePath:''};
                  photos.isCover = false;
                  photos.photoData = image;
                  this.postImages[this.postImages.length] = photos;
                }
              ).catch(err => console.log(err));
            }
          this.changeRef.detectChanges(); 
          // loading.then(res=>res.dismiss());
          }, (err) => { console.log('Error get pics',err);}
        );  
        // }
    }
  }, {
      text: 'Camera',
      icon: 'camera',
      handler: () => {
        // cameraOptions.sourceType = 1;
        this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
          const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
          const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
          await this.file.readAsDataURL(path, filename).then((image)=> {
            const photos : Images = {isCover:false, photoData:'', storagePath:''};
            photos.isCover = false;
            photos.photoData = image;
            this.postImages[this.postImages.length] = photos;
            this.changeRef.detectChanges();
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
 */
}
