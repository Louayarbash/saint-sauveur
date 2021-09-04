import { Component, OnInit, Input,ChangeDetectorRef} from '@angular/core';
import { ModalController, AlertController, ActionSheetController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Observable } from "rxjs";
import { Images } from '../../../type'
// import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
// import { File } from "@ionic-native/file/ngx";
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html'
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
    private changeRef: ChangeDetectorRef,
    private featureService : FeatureService,
    private loginService : LoginService
  ) { 
  }

  ngOnInit() {
    this.updateItemForm = new FormGroup({
      subject: new FormControl(this.item.subject, Validators.required),
      details: new FormControl(this.item.details),
      status: new FormControl(this.item.status)
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
            this.featureService.deleteItem(this.item.images,this.item.id, 'lost-found')
            .then(
              () => {
                this.featureService.presentToast(this.featureService.translations.DeletedSuccessfully,2000);
                this.dismissModal();
                this.router.navigate(['app/start-menu/lost-found']);
              },
              err => { 
                console.log(err);
                this.featureService.presentToast(this.featureService.translations.DeletingErrors,2000);
               }
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
          this.featureService.updateItemWithoutOptions(this.item, 'lost-found').then(()=> {
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

  this.item.subject = this.updateItemForm.value.subject;
  this.item.details = this.updateItemForm.value.details;
  this.item.status = this.updateItemForm.value.status;

  // const loading = this.featureService.presentLoadingWithOptions(2000);
  const {isShell, ...itemData} = this.item;
  this.featureService.updateItemWithImages(itemData, this.postImages, 'lost-found','images/lost-found/'+ this.loginService.getBuildingId() + '/')
  .then(() => {
    this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully,2000);
    this.modalController.dismiss();
  }
  ).catch((err)=> {
    this.featureService.presentToast(this.featureService.translations.UpdatingErrors,2000);
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

selectImageSource() {
  return this.featureService.selectImageSource(3, this.postImages.length, this.postImages, this.updateItemForm)
}

}