import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController,AlertController,ToastController,LoadingController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { SelectItemImageModal } from '../select-image/select-item-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { Date } from 'core-js';
import { Crop } from '@ionic-native/crop/ngx';
import { File } from "@ionic-native/file/ngx";
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { Observable } from "rxjs";
import {PhotosArray} from '../../../type'
//import { OneSignal } from "@ionic-native/onesignal/ngx";



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
  isLoading = false;

  postImages : PhotosArray[] = [];

  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  skills = [];
  selectedPhoto: string;
  //searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();
  uploadedImage: any;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private _camera: Camera,    
    private _alertController: AlertController,
    private _angularFireStore :AngularFirestore,
    private toastCtrl : ToastController,
    //private alertCtrl : AlertController,
    private _loadingController : LoadingController,
    private _crop: Crop,
    private _file: File,
    private ImagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef
    //private _oneSignal : OneSignal
  ) { }

  ngOnInit() {
    // default image
    //this.userData.photo = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    //this.selectedPhoto = "";
    this.createItemForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description : new FormControl(''),
      price : new FormControl(''),
      category : new FormControl(''),
      hidden : new FormControl('')
      

      //skills: new FormArray([], CheckboxCheckedValidator.minSelectedCheckboxes(1)),
      //spanish: new FormControl(),
      //english: new FormControl(),
      //french: new FormControl()
    });
/*     this.firebaseService.getSkills().subscribe(skills => {
      this.skills = skills;
      // create skill checkboxes
      this.skills.map(() => {
        (this.createUserForm.controls.skills as FormArray).push(new FormControl());
      });
    }); */
  }

  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }

  changeLangValue(value): string {
    switch (true) {
      case (value <= 3 ):
        return 'Novice';
      case (value > 3 && value <= 6 ):
        return 'Competent';
      case (value > 6 ):
        return 'Expert';
    }
  }

  async dismissModal() {
   await this.modalController.dismiss();
  }

   createItem() {

    //this.itemData.photo = this.selectedPhoto;
    this.itemData.title = this.createItemForm.value.title;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    this.itemData.category = this.createItemForm.value.category;
    this.itemData.createDate = Date.now().toString();
    this.itemData.createdById = this.firebaseService.auth.getLoginID();
    //this.itemData.photoslider = this.postsImages;
    
    //dayjs(this.createUserForm.value.birthdate).unix(); // save it in timestamp

/*  this.userData.languages.spanish = this.createUserForm.value.spanish;
    this.userData.languages.english = this.createUserForm.value.english;
    this.userData.languages.french = this.createUserForm.value.french; */

    // get the ids of the selected skills
/*    const selectedSkills = [];

    this.createUserForm.value.skills
    .map((value: any, index: number) => {
      if (value) {
        selectedSkills.push(this.skills[index].id);
      }
    });
    this.userData.skills = selectedSkills; */
    const loading = this.firebaseService.presentLoadingWithOptions();
    this.firebaseService.createItem(this.itemData,this.postImages)
    .then(() => {
      this.dismissModal();
      //this._oneSignal.postNotification({})
      this.firebaseService.presentToast("post added successfully");
      loading.then(res=>res.dismiss());
      //console.log("eir");      
    });     
  }
  async showAlert(title,msg,task){
    const alert = await this._alertController.create({
      header:title,
      subHeader:msg,
      buttons:[
        {
          text: `Action: ${task}`,
          handler:()=>{

          }
        }
      ]
    })
    alert.present();
  }

  async changePostImage() {
    const modal = await this.modalController.create({
      component: SelectItemImageModal
    });

    modal.onDidDismiss().then(photo => {
      if (photo.data != null) {
        //this.userData.photo = photo.data.link;
      }
    });
    await modal.present();
  }

  //LA_2019_11
   async selectImageSource(){ 

  }
      deletephoto(doc){
      console.log("postsImages",this.postImages);
      console.log("doc",doc);
       this.postImages.forEach( (item, index) => {
        if(item === doc) {
           this.postImages.splice(index,1);
          console.log("postsImages after delete",this.postImages);
          this.changeRef.detectChanges();
          this.firebaseService.presentToast("Photo removed");
        }
      });
  }


  //END
  
  async deleteFile(file){
    this.firebaseService.deleteItemTest(file).subscribe(async ()=> {
      let toast = await this.toastCtrl.create({
        message : 'File removed',
        duration : 3000
      });
      await toast.present();
      this.changeRef.detectChanges();
      
    }    
  );
}

}
