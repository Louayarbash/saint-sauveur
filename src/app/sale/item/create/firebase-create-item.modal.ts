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
import { LoginService } from '../../../services/login/login.service';
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
    private changeRef: ChangeDetectorRef,
    private loginService : LoginService
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


  async dismissModal() {
   await this.modalController.dismiss();
  }

   createItem() {
    console.log("CreateItem LoginID",this.loginService.getLoginID())
    //this.itemData.photo = this.selectedPhoto;
    this.itemData.title = this.createItemForm.value.title;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.price = this.createItemForm.value.price;
    this.itemData.category = this.createItemForm.value.category;
    this.itemData.createDate = Date.now().toString();
    this.itemData.createdById = this.loginService.getLoginID();
    const loading = this.firebaseService.presentLoadingWithOptions();
    this.firebaseService.createItem(this.itemData,this.postImages)
    .then(() => {
      this.dismissModal();
      this.firebaseService.presentToast("post added successfully");
      loading.then(res=>res.dismiss());  
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
    const cameraOptions : CameraOptions = {
      quality:100,
      destinationType: this._camera.DestinationType.DATA_URL,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this._camera.PictureSourceType.CAMERA
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
      destinationType: this._camera.DestinationType.DATA_URL,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this._camera.PictureSourceType.PHOTOLIBRARY
    };
    /* this.ImagePicker.getPictures(optionsPicker).then(async (results : string[]) => { 
      for (var i = 0; i < results.length; i++) {
         let filename = results[i].substring(results[i].lastIndexOf('/')+1);
         let path = results[i].substring(0,results[i].lastIndexOf('/')+1);
         console.log(filename);
         console.log(path);
         console.log(results[i]);
         await this._file.readAsDataURL(path,filename).then((base64string)=> {
           this.postsImages.push(base64string);
         }
       )
     } 
   } */
    const alert = await this._alertController.create({
      header: "Select Source",
      message: "Pick a source for your image",
      buttons: [
         {
          text: "Camera",
          handler: ()=> {
            this._camera.getPicture(cameraOptions).then((imageData)=> {
              //this.myProfileImage = "data:image/jpeg;base64," + imageData;
              //this._angularFireSrore.collection("users").doc(this._angularFireAuth.auth.currentUser.uid).set({image_src : image});
              //this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
              let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
              
              const image = "data:image/jpeg;base64," + imageData;
              photos.isCover = false;
              photos.photo = image;
              this.postImages[this.postImages.length] = photos;
              //this.selectedPhoto = image;
              this.changeRef.detectChanges();
              //this.createItemForm.controls['hidden'].setValue("fixissue");/*this code to fix the not refreshing*/
            });
          }
        },
/*         {
          text: "Gallery multiPhotos",
          handler: ()=> {
            console.log(optionsPicker.maximumImagesCount);
             this.ImagePicker.getPictures(optionsPicker).then(async (results : string[]) => { 
               for (var i = 0; i < results.length; i++) {
                  let filename = results[i].substring(results[i].lastIndexOf('/')+1);
                  let path = results[i].substring(0,results[i].lastIndexOf('/')+1);
                  console.log(filename);
                  console.log(path);
                  console.log(results[i]);
                  await this._file.readAsDataURL(path,filename).then((base64string)=> {
                    this.postsImages.push(base64string);
                  }
                )
                console.log(this.postsImages);
              } 
            }, (err) => { console.log('Error get pics');}); 
          }
        } */
        {
          text: "Gallery multiPhotos",
           handler: ()=> {
            
            console.log("max", optionsPicker.maximumImagesCount);
            if((3 - this.postImages.length) != 1){
            
            this.ImagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
            console.log("not 1");
             this.ImagePicker.getPictures(optionsPicker).then(/*async*/ (results : string[]) => { 
              const loading = this.firebaseService.presentLoadingWithOptions();
               for (var i = 0; i < results.length; i++) {
                  let filename = results[i].substring(results[i].lastIndexOf('/')+1);
                  let path = results[i].substring(0,results[i].lastIndexOf('/')+1);
                  console.log(filename); 
                  console.log(path);
                  console.log(results[i]);
                  /*await*/ this._file.readAsDataURL(path,filename).then((base64string)=> {
                    let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
                    
                    photos.isCover = false;
                    photos.photo = base64string;
                    this.postImages[this.postImages.length] = photos;
                    //this.selectedPhoto = base64string;
                    
                    //this.createItemForm.controls['hidden'].setValue("fixissue not 1");/*this code to fix the not refreshing*/
                    
                  }
                )
                console.log(this.postImages);
              }
            this.changeRef.detectChanges(); 
            loading.then(res=>res.dismiss());
            }, (err) => { console.log('Error get pics');}); 
            
          }
            else if((3 - this.postImages.length) == 1)
            {
              console.log("It is 1");
              this._camera.getPicture(galleryOptions).then((imageData)=> {
                const image = "data:image/jpeg;base64," + imageData;
                let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};    
                photos.isCover = false;
                photos.photo = image;
                this.postImages[this.postImages.length] = photos;
                //this.selectedPhoto = image;
                this.changeRef.detectChanges();
                //this.createItemForm.controls['hidden'].setValue("fixissue It is 1");/*this code to fix the not refreshing*/
                //aaa.then(bbb=> bbb.dismiss());
              });
            }
            //
            }
          }      
      ]
    });

    await alert.present();
    //this.createItemForm.controls['hidden'].setValue("fixissue");
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
  makeCover(doc){
    console.log("postsImages",this.postImages);
    console.log("doc",doc);
     this.postImages.forEach( (item, index) => {
      if(item.photo === doc) {
        item.isCover = true;
        this.changeRef.detectChanges();
        this.firebaseService.presentToast("Photo successfully used as cover photo");
      }
      else{
        item.isCover = false;
      }
    });
}


  //END
  
/*   async deleteFile(file){
    this.firebaseService.deleteItemTest(file).subscribe(async ()=> {
      let toast = await this.toastCtrl.create({
        message : 'File removed',
        duration : 3000
      });
      await toast.present();
      this.changeRef.detectChanges();
      
    }    
  );
} */

cropImage(fileUrl) {
  this._crop.crop(fileUrl, { quality: 50 })
    .then(
      newPath => {
        this.showCroppedImage(newPath.split('?')[0])
      },
      error => {
        alert('Error cropping image' + error);
      }
    );
}

showCroppedImage(ImagePath) {
  this.isLoading = true;
  var copyPath = ImagePath;
  var splitPath = copyPath.split('/');
  var imageName = splitPath[splitPath.length - 1];
  var filePath = ImagePath.split(imageName)[0];

  this._file.readAsDataURL(filePath, imageName).then(base64 => {
    this.croppedImagepath = base64;
    this.isLoading = false;
  }, error => {
    alert('Error in showing image' + error);
    this.isLoading = false;
  });
}

}
