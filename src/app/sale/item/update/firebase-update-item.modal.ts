import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Observable } from "rxjs";
import { PhotosArray } from '../../../type'
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { File } from "@ionic-native/file/ngx";
import { FeatureService } from '../../../services/feature/feature.service';


@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html',
  styleUrls: [
    './styles/firebase-update-item.modal.scss',
    './styles/firebase-update-item.shell.scss'
  ],
})

export class FirebaseUpdateItemModal implements OnInit {
  @Input() item: FirebaseItemModel;
  @Input() postImages: PhotosArray[];

  updateItemForm: FormGroup;
  //postImages : PhotosArray[] = [];
  myStoredProfileImage : Observable<any>;
  profileUrl: Observable<string | null>;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private camera: Camera,
    private file: File,
    private imagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef,
    private featureService : FeatureService
  ) { 
  }

  ngOnInit() {
    console.log("1 ya rab", this.postImages);
    this.updateItemForm = new FormGroup({
      object: new FormControl(this.item.object, Validators.required),
      description: new FormControl(this.item.description),
      price: new FormControl(this.item.price, Validators.required),
      status: new FormControl(this.item.status, Validators.required)
    }); 
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteItem() {
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.DeletePostConfirmation,
      buttons: [
        {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {}
        },
        {
          text: this.featureService.translations.Yes,
          handler: () => {
            this.firebaseService.deleteItem(this.item)
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['sale/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
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
    const galleryOptions : CameraOptions = {
      quality:100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.PHOTOLIBRARY
    };
    const optionsPicker : ImagePickerOptions = {
      maximumImagesCount: 3 - this.postImages.length,
      //maximumImagesCount: 1,
      outputType:0,
      quality:100,
      width:300,
      disable_popover:false
    }; 
    const alert = await this.alertController.create({
      header: this.featureService.translations.SelectSourceHeader,
      message: this.featureService.translations.SelectSourceMessage,
      buttons: [
         {
          text: this.featureService.translations.Camera,
          handler: ()=> {
            this.camera.getPicture(cameraOptions).then((imageData)=> {
              const loading = this.featureService.presentLoadingWithOptions(5000);
              let photos : PhotosArray = {isCover:false,photo:"",storagePath :""};
              
              const image = "data:image/jpeg;base64," + imageData;
              photos.isCover = false;
              photos.photo = image;
              this.postImages.push(photos);
              this.updateItemForm.markAsDirty();
              this.changeRef.detectChanges();
              loading.then(res=>{res.dismiss();});
            });
          }
        },
        {
          text: this.featureService.translations.PhotoGallery,
           handler: ()=> {
            if((3 - this.postImages.length) != 1){
             this.imagePicker.getPictures(optionsPicker).then( /*async*/ (results : string[]) => { 
              const loading = this.featureService.presentLoadingWithOptions(5000);         
               for (var i = 0; i < results.length; i++) {
                  let filename = results[i].substring(results[i].lastIndexOf('/')+1);
                  let path = results[i].substring(0,results[i].lastIndexOf('/')+1);
                   /*await*/ this.file.readAsDataURL(path,filename).then((base64string)=> {                    
                    let photos : PhotosArray = {isCover:false,photo:"", storagePath :""};
                    photos.isCover = false;
                    photos.photo = base64string;
                    this.postImages.push(photos);
                  }
                ).catch(err=>{console.log("readAsDataURL: ",err)})
              }
            this.updateItemForm.markAsDirty();
            this.changeRef.detectChanges(); 
            loading.then(res=>{res.dismiss();});
            }, (err) => { console.log('Error get pics',err);}); 
            
          }
            else if((3 - this.postImages.length) == 1)
            {
              this.camera.getPicture(galleryOptions).then((imageData)=> {
                const loading = this.featureService.presentLoadingWithOptions(5000);
                const image = "data:image/jpeg;base64," + imageData;
                let photos : PhotosArray = {isCover:false, photo:"", storagePath:""};
                photos.isCover = false;
                photos.photo = image;    
                this.postImages.push(photos);
                this.updateItemForm.markAsDirty();
                loading.then(res=>{res.dismiss();});
                this.changeRef.detectChanges();
              });
            }
            
            }
          }      
      ]
    });
    await alert.present();
  }
  deletePhoto(index : number){
        const loading = this.featureService.presentLoadingWithOptions(5000);
         if(this.postImages[index].storagePath !== "") {      
           this.item.images.splice(index,1);    
         this.firebaseService.updateItemWithoutOptions(this.item).then(()=> {
          this.postImages.splice(index,1); 
          this.featureService.presentToast(this.featureService.translations.PhotoRemoved,2000);
          this.firebaseService.deleteFromStorage(this.postImages[index].storagePath).then().catch( err => console.log("Error in deletePhoto Storage: ",err));
        }).catch( err => console.log("Error in deletePhoto DB: ",err));  
        //}).catch( err => console.log("Error in deletePhoto Storage: ",err));
      }
      else{
        this.postImages.splice(index,1);
      }
      loading.then(res=>{res.dismiss();})
      this.changeRef.detectChanges();
}

makeCover(index : number){
  this.postImages[index].isCover = true;
  //this.changeRef.detectChanges();
  this.postImages.forEach( (item, i) => {
    if(i === index) {
      item.isCover = true;
    }
    else{
      item.isCover = false;
    }
  });
  this.updateItemForm.markAsDirty();
  //this.featureService.presentToast(this.featureService.translations.PhotoAsCover,2000);
}

updateItem() {
  this.item.object = this.updateItemForm.value.object;
  this.item.description = this.updateItemForm.value.description;
  this.item.price = this.updateItemForm.value.price;
  this.item.status =  this.updateItemForm.value.status;
  //const {...itemData} = this.item;

  this.firebaseService.updateItem(this.item,this.postImages)
  .then(() => {
    this.featureService.presentToast(this.featureService.translations.PostUpdatedSuccessfully,2000);
    this.modalController.dismiss();
  }
  ).catch((err)=> {
    this.featureService.presentToast(this.featureService.translations.PostUpdatingErrors,2000);
    this.modalController.dismiss();
    console.log(err)
  });
}

}
