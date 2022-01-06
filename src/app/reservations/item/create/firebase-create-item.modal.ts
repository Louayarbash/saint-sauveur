import { Component, OnInit,ChangeDetectorRef, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { Images } from '../../../type'
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import { NotificationItemModel } from '../../../services/feature/notification-item.model';
import firebase from 'firebase/app';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html'
})
export class FirebaseCreateItemModal implements OnInit {
  @Input() segmentValueSubject: ReplaySubject<string>;
  croppedImagepath = "";
  postImages : Images[] = [];
  createItemForm: FormGroup;
  itemData: FirebaseItemModel= new FirebaseItemModel();
  itemDataNotif: NotificationItemModel= new NotificationItemModel();
  selectedPhoto: string;
  uploadedImage: any;
  disableSubmit: boolean;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService,
    private featureService : FeatureService,

  ) { }

  ngOnInit() {
    this.disableSubmit= false;
    this.createItemForm = new FormGroup({
      object: new FormControl('', Validators.required),
      description : new FormControl(''),
      price : new FormControl('',[Validators.required, Validators.pattern('^[0-9]*$')]),
      status : new FormControl('active')
    });
  }

  dismissModal() {
   this.modalController.dismiss();
  }

   createItem() {
    this.disableSubmit= true;
    this.itemData.object = this.createItemForm.value.object;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    const {isShell, ...itemData} = this.itemData;
    
    this.itemDataNotif.type= "sale" 
    this.itemDataNotif.action= "new"
    this.itemDataNotif.status=  this.itemData.status
    this.itemDataNotif.creatorName= this.loginService.getLoginName();
    this.itemDataNotif.createDate= this.itemData.createDate;
    this.itemDataNotif.createdBy= this.itemData.createdBy;

    this.featureService.createItemWithImages(itemData, this.postImages, 'sales')
    .then(() => {
      this.segmentValueSubject.next('myList');
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      loading.then(res=>{res.dismiss();})
      this.itemDataNotif.createdBy= this.itemData.createdBy;
      this.featureService.createItem("notifications",this.itemDataNotif)
      this.dismissModal();  // not needed inside catch to stay on same page while errors
    }).catch((err) => { 
      this.disableSubmit= false;
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
  const draggedItem = this.postImages.splice(ev.detail.from, 1)[0];  
  this.postImages.splice(ev.detail.to, 0, draggedItem);
  this.createItemForm.markAsDirty();
  ev.detail.complete();

}

 selectImageSource() {
   this.featureService.selectImageSource(3, this.postImages.length, this.postImages, null)
   
}

}
