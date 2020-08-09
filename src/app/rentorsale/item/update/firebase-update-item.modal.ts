import { Component, OnInit, Input,ChangeDetectorRef} from '@angular/core';
import { ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Observable } from "rxjs";
import { Images } from '../../../type'
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { File } from "@ionic-native/file/ngx";
import { FeatureService } from '../../../services/feature/feature.service';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';

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
  @Input() postImages: Images[];

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
    private featureService : FeatureService,
    private actionSheetController: ActionSheetController
  ) { 
  }

  ngOnInit() {
    this.updateItemForm = new FormGroup({

      type : new FormControl(this.item.type, Validators.required),
      object : new FormControl(this.item.object, Validators.required),
      bedRooms: new FormControl(this.item.bedRooms, counterRangeValidator(0, 10)),
      bathRooms: new FormControl(this.item.bathRooms, counterRangeValidator(0, 8)),
      floor: new FormControl(this.item.floor, counterRangeValidator(0, 30)),
      balcony: new FormControl(this.item.balcony, counterRangeValidator(0, 5)),
      //balcony: new FormControl(this.item.balcony),
      description : new FormControl(this.item.description),
      price : new FormControl(this.item.price,[Validators.required, Validators.pattern('^[0-9]*$')]),
      status : new FormControl(this.item.status)
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
            this.featureService.deleteItem(this.item.images,this.item.id, 'rentorsale')
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['rentorsale/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
  }

  deletePhoto(index : number){
        const loading = this.featureService.presentLoadingWithOptions(5000);
         if(this.postImages[index].storagePath !== '') {      
          this.item.images.splice(index,1);    
          this.featureService.updateItemWithoutOptions(this.item, 'rentorsale').then(()=> {
          const deletedimage = this.postImages.splice(index,1); 
          this.featureService.presentToast(this.featureService.translations.PhotoRemoved,2000);
          this.featureService.deleteFromStorage(deletedimage[0].storagePath).then().catch( err => console.log("Error in deletePhoto Storage: ",err));
        }).catch( err => console.log("Error in deletePhoto DB: ",err));  
      }
      else{
        this.postImages.splice(index,1);
      }
      loading.then(res=>{res.dismiss();})
      this.changeRef.detectChanges();
}

makeCover(index: number){
  this.postImages[index].isCover = true;
  this.postImages.forEach( (item, i) => {
    if(i === index) {
      item.isCover = true;
    }
    else {
      item.isCover = false;
    }
  });
  this.updateItemForm.markAsDirty();
}

updateItem() {
  if(this.item.object == 'condo'){
    this.item.bedRooms = this.updateItemForm.value.bedRooms;
    this.item.bathRooms = this.updateItemForm.value.bathRooms;
    this.item.floor = this.updateItemForm.value.floor;
    this.item.balcony = this.updateItemForm.value.balcony;
  }
  this.item.description = this.updateItemForm.value.description;
  this.item.price = this.updateItemForm.value.price;
  this.item.status = this.updateItemForm.value.status;
  const loading = this.featureService.presentLoadingWithOptions(2000);

  //const {...itemData} = this.item;

  this.featureService.updateItemWithImages(this.item, this.postImages, 'rentorsale')
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

doReorder(ev: any) {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  //console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

  const draggedItem = this.postImages.splice(ev.detail.from, 1)[0];  
  this.postImages.splice(ev.detail.to, 0, draggedItem);  
  this.updateItemForm.markAsDirty();
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
    message:"message",
    title:"title"
  };


  const actionSheet = await this.actionSheetController.create({
    header: this.featureService.translations.SelectImagesSource,
    // cssClass: 'my-custom-class',
    buttons: [
    {
      text: this.featureService.translations.PhotoGallery,
      icon: 'images',
      handler: ()=> {
       // if((3 - this.postImages.length) !== 1) {
        this.imagePicker.getPictures(pickerOptions).then( async (imageData : string[]) => { 
         const loading = this.featureService.presentLoadingWithOptions(5000);         
          for (var i = 0; i < imageData.length; i++) {
             let filename = imageData[i].substring(imageData[i].lastIndexOf('/')+1);
             const path = imageData[i].substring(0,imageData[i].lastIndexOf('/')+1);
               await this.file.readAsDataURL(path,filename).then((base64string)=> {                    
               const photos : Images = {isCover:false, photoData:'', storagePath: ''};
               photos.isCover = false;
               photos.photoData = base64string;
               this.postImages.push(photos);
             }
           ).catch(err=>{console.log(err)})
         }
       this.updateItemForm.markAsDirty();
       this.changeRef.detectChanges(); 
       loading.then(res=> {res.dismiss();});
       }, (err) => { console.log(err);}
       ); 
       }
       /*else if((3 - this.postImages.length) === 1)
       {
         this.camera.getPicture(galleryOptions).then((imageData)=> {
           const loading = this.featureService.presentLoadingWithOptions(5000);
           const image = 'data:image/jpeg;base64,' + imageData;
           let photos : PhotosData = {isCover:false, photo:'', storagePath:''};
           photos.isCover = false;
           photos.photo = image;    
           this.postImages.push(photos);
           this.updateItemForm.markAsDirty();
           loading.then(res=>{res.dismiss();});
           this.changeRef.detectChanges();
         });
       } 
      }*/
    }, 
    {
      text: this.featureService.translations.Camera,
      icon: 'camera',
      handler: () => {
        this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
          /*const image = "data:image/jpeg;base64," + imageData;
          photos.isCover = false;
          photos.photo = image;
          this.postImages.push(photos);
          this.updateItemForm.markAsDirty();
          this.changeRef.detectChanges();*/
          //const loading = this.featureService.presentLoadingWithOptions(5000);
          //let photos : PhotosData = {isCover:false,photo:'',storagePath :''};
          const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
          const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
          await this.file.readAsDataURL(path, filename).then((image)=> {
            const photos : Images = {isCover:false, photoData:'', storagePath:''};
            photos.isCover = false;
            photos.photoData = image;
            this.postImages[this.postImages.length] = photos;
            this.updateItemForm.markAsDirty();
            this.changeRef.detectChanges();
          //loading.then(res=>{res.dismiss();});
      }).catch(err => console.log(err));
    })
  }

    }, {
      text: this.featureService.translations.Cancel,
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]
  });
  await actionSheet.present();
}

}
