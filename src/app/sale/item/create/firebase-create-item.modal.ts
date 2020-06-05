import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController,AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from "@ionic-native/file/ngx";
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import {PhotosArray} from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import  * as firebase from 'firebase/app';

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
  postImages : PhotosArray[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  selectedPhoto: string;
  uploadedImage: any;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private camera: Camera,    
    private alertController: AlertController,
    //private _crop: Crop,
    private file: File,
    private imagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService
  ) { }

  ngOnInit() {

    this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    this.createItemForm = new FormGroup({
      object: new FormControl('', Validators.required),
      description : new FormControl(''),
      price : new FormControl('',[Validators.required, Validators.pattern("^[0-9]*$")]),
      status : new FormControl('active')
    });
  }

  /*async*/ dismissModal() {
   /*await*/ this.modalController.dismiss();
  }

   createItem() {
    this.itemData.object = this.createItemForm.value.object;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(5000);
    this.firebaseService.createItem(this.itemData,this.postImages)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.PostAddedSuccessfully,2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.PostAddingErrors,2000);
      this.dismissModal();
      console.log(err);
     });     
  }

  //LA_2019_11
   async selectImageSource(){ 
    const cameraOptions : CameraOptions = {
      quality:100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.CAMERA
    };
    const optionsPicker : ImagePickerOptions = {
      maximumImagesCount: 3 - this.postImages.length,
      //maximumImagesCount: 1,
      outputType:0,
      quality:100,
      width:300,
      disable_popover:false
    }; 
    const galleryOptions : CameraOptions = {
      quality:100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.PHOTOLIBRARY
    };
    const alert = await this.alertController.create({
      header: "Select Source",
      message: this.featureService.translations.PickSourceForYourImage,
      buttons: [
         {
          text: "Camera",
          handler: ()=> {
            this.camera.getPicture(cameraOptions).then((imageData)=> {
              //this.myProfileImage = "data:image/jpeg;base64," + imageData;
              let photos : PhotosArray = {isCover:false, photo:"", storagePath:""};
              const image = "data:image/jpeg;base64," + imageData;
              photos.isCover = false;
              photos.photo = image;
              this.postImages[this.postImages.length] = photos;
              this.changeRef.detectChanges();
            });
          }
        },
        {
          text: "Gallery multiPhotos",
           handler: ()=> {
            if((3 - this.postImages.length) != 1){
            
            this.imagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
             this.imagePicker.getPictures(optionsPicker).then(/*async*/ (results : string[]) => { 
              const loading = this.featureService.presentLoadingWithOptions(5000);
               for (var i = 0; i < results.length; i++) {
                  let filename = results[i].substring(results[i].lastIndexOf('/')+1);
                  let path = results[i].substring(0,results[i].lastIndexOf('/')+1);
                  /*await*/ this.file.readAsDataURL(path,filename).then((image)=> {
                    let photos : PhotosArray = {isCover:false, photo:"", storagePath:""};
                    photos.isCover = false;
                    photos.photo = image;
                    this.postImages[this.postImages.length] = photos;
                  }
                )
                console.log(this.postImages);
              }
            this.changeRef.detectChanges(); 
            loading.then(res=>res.dismiss());
            }, (err) => { console.log('Error get pics',err);}); 
            
          }
            else if((3 - this.postImages.length) == 1)
            {

              this.camera.getPicture(galleryOptions).then((imageData)=> {
                const image = "data:image/jpeg;base64," + imageData;
                let photos : PhotosArray = {isCover:false, photo:"", storagePath:""};    
                photos.isCover = false;
                photos.photo = image;
                this.postImages[this.postImages.length] = photos;
                this.changeRef.detectChanges();
              });
            }
            //
            }
          }      
      ]
    });

    await alert.present();
  }
    deletephoto(doc){
       this.postImages.forEach( (item, index) => {
        if(item === doc) {
          this.postImages.splice(index,1);
          this.changeRef.detectChanges();
          this.featureService.presentToast(this.featureService.translations.PhotoRemoved,2000);
        }
      });
  }

  makeCover(doc){
     this.postImages.forEach( (item, index) => {
      if(item.photo === doc) {
        item.isCover = true;
        this.changeRef.detectChanges();
        this.featureService.presentToast(this.featureService.translations.PhotoAsCover,2000);
      }
      else{
        item.isCover = false;
      }
    });
}

//END
/* cropImage(fileUrl) {
  this._crop.crop(fileUrl, { quality: 50 })
    .then(
      newPath => {
        this.showCroppedImage(newPath.split('?')[0])
      },
      error => {
        alert('Error cropping image' + error);
      }
    );
} */

/* showCroppedImage(ImagePath) {
  var copyPath = ImagePath;
  var splitPath = copyPath.split('/');
  var imageName = splitPath[splitPath.length - 1];
  var filePath = ImagePath.split(imageName)[0];

  this.file.readAsDataURL(filePath, imageName).then(base64 => {
    this.croppedImagepath = base64;
  }, error => {
    alert('Error in showing image' + error);
  });
} */
}
