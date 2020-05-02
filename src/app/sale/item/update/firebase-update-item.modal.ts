import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import * as dayjs from 'dayjs';

import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
import { SelectItemImageModal } from '../select-image/select-item-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import {PhotosArray} from '../../../type'
import { ImagePicker,ImagePickerOptions } from '@ionic-native/image-picker/ngx';
import { File } from "@ionic-native/file/ngx";

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html',
  styleUrls: [
    './styles/firebase-update-item.modal.scss',
    './styles/firebase-update-item.shell.scss'
  ],
})
export class FirebaseUpdateItemModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: FirebaseItemModel;

  updateItemForm: FormGroup;
  //selectedPhoto: string;
  //skills = [];
  postImages : PhotosArray[] = [];
  //newPostImages : PhotosArray[] = [];
  //photoSlider = [""];
  //myProfileImage = "./assets/images/video-playlist/big_buck_bunny.png";
  myStoredProfileImage : Observable<any>;
  profileUrl: Observable<string | null>;
  //myStoredProfileImage;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private _alertController: AlertController,
    private _camera: Camera,
    private _angularFireStore :AngularFirestore,
    private _file: File,
    private ImagePicker : ImagePicker,
    private changeRef: ChangeDetectorRef
  ) { 
    
    //this.myStoredProfileImage = _angularFireSrore.collection("users").doc(_angularFireAuth.auth.currentUser.uid).valueChanges();
    //this.myStoredProfileImage = _angularFireSrore.collection("users").doc(this.user.id).valueChanges();
    //console.log("aaaa",this.myStoredProfileImage);
  }

  ngOnInit() {
    this.updateItemForm = new FormGroup({
      title: new FormControl(this.item.title, Validators.required),
      description: new FormControl(this.item.description),
      category: new FormControl(this.item.category),
      price: new FormControl(this.item.price, Validators.required)
    });
    if(this.item.imagesFullPath.length !==0){
      
      //this.getPics(this.item.imagesFullPath);
      const loading = this.firebaseService.presentLoadingWithOptions().then( res => {return res;} ); 
      this.postImages = [{isCover:false,photo:"",photoStoragePath:""}];
      this.item.imagesFullPath.map((res,index)=>{
        this.firebaseService.afstore.ref(res).getDownloadURL().toPromise().then(DownloadURL => { 
          let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
          photos.isCover = false;
          photos.photo = DownloadURL;
          photos.photoStoragePath = res;
          this.postImages[index] = photos;
          if(res === this.item.coverPhoto){
          this.postImages[index].isCover = true;
          }
         } );
      });
      loading.then(res=>{res.dismiss();});
    } 
    console.log("louay update postImages", this.postImages);
/*
       skills: new FormArray([], CheckboxCheckedValidator.minSelectedCheckboxes(1)),
      spanish: new FormControl(this.user.languages.spanish),
      english: new FormControl(this.user.languages.english),
      french: new FormControl(this.user.languages.french)   
   this.firebaseService.getSkills().subscribe(skills => {
      this.skills = skills;
      // create skill checkboxes
      this.skills.map((skill) => {
        let userSkillsIds = [];
        if (this.user.skills) {
          userSkillsIds = this.user.skills.map(function(skillId) {
            return skillId['id'];
          });
        }
        // set the control value to 'true' if the user already has this skill
        const control = new FormControl(userSkillsIds.includes(skill.id));
        (this.updateUserForm.controls.skills as FormArray).push(control);
      });
    }); */
  }

  /*get skillsFormArray() { return <FormArray>this.updateUserForm.get('skills'); }

  changeLangValue(value): string {
    switch (true) {
      case (value <= 3 ):
        return 'Novice';
      case (value > 3 && value <= 6 ):
        return 'Competent';
      case (value > 6 ):
        return 'Expert';
    }
  }*/

  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteItem() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Do you want to delete ' + this.item.title + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.firebaseService.deleteItem(this.item)
            .then(
              () => {
                console.log("deleteItem is done");
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

  updateItem() {

    //this.item.coverPhoto = this.selectedPhoto;
    this.item.title = this.updateItemForm.value.title;
    this.item.description = this.updateItemForm.value.description;
    this.item.price = this.updateItemForm.value.price;
    
    //dayjs(this.updateUserForm.value.birthdate).unix(); // save it in timestamp

/*     this.user.languages.spanish = this.updateUserForm.value.spanish;
    this.user.languages.english = this.updateUserForm.value.english;
    this.user.languages.french = this.updateUserForm.value.french; */

    // get the ids of the selected skills
    //const selectedSkills = [];

    /* this.updateUserForm.value.skills
    .map((value: any, index: number) => {
      if (value) {
        selectedSkills.push(this.skills[index].id);
      }
    }); */
    //this.user.skills = selectedSkills;

    const {/*age,*/ ...itemData} = this.item; // we don't want to save the age in the DB because is something that changes over time

    this.firebaseService.updateItem(itemData,this.postImages)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }

/*   async changeUserImage() {
    const modal = await this.modalController.create({
      component: SelectItemImageModal
    });

    modal.onDidDismiss().then(avatar => {
      if (avatar.data != null) {
        this.selectedPhoto = avatar.data.link;
      }
    });
    await modal.present();
  } */
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
    const alert = await this._alertController.create({
      header: "Select Source",
      message: "Pick a source for your image",
      buttons: [
         {
          text: "Camera",
          handler: ()=> {
            this._camera.getPicture(cameraOptions).then((imageData)=> {
              const loading = this.firebaseService.presentLoadingWithOptions().then( res => {return res;} );
              //this.myProfileImage = "data:image/jpeg;base64," + imageData;
              //this._angularFireSrore.collection("users").doc(this._angularFireAuth.auth.currentUser.uid).set({image_src : image});
              //this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
              let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
              
              const image = "data:image/jpeg;base64," + imageData;
              photos.isCover = false;
              photos.photo = image;
              this.postImages.push(photos);
              //this.newPostImages.push(photos);
              //this.selectedPhoto = image;
              this.changeRef.detectChanges();
              loading.then(res=>{res.dismiss();});
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
            //this.ImagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
            console.log("not 1");
             this.ImagePicker.getPictures(optionsPicker).then( /*async*/ (results : string[]) => { 
              const loading = this.firebaseService.presentLoadingWithOptions().then( res => {return res;} );         
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
                    this.postImages.push(photos);
                  }
                ).catch(err=>{console.log("readAsDataURL: ",err)})
                console.log("Louay Arbash",this.postImages);
              }
            this.changeRef.detectChanges(); 
            loading.then(res=>{res.dismiss();});
            }, (err) => { console.log('Error get pics');}); 
            
          }
            else if((3 - this.postImages.length) == 1)
            {
              console.log("It is 1");
              this._camera.getPicture(galleryOptions).then((imageData)=> {
                const loading = this.firebaseService.presentLoadingWithOptions().then( res => {return res;} );
                const image = "data:image/jpeg;base64," + imageData;
                let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
                photos.isCover = false;
                photos.photo = image;    
                this.postImages.push(photos);
                loading.then(res=>{res.dismiss();});
                this.changeRef.detectChanges();
              });
              console.log("Louay Arbash",this.postImages);
            }
            //
            }
          }      
      ]
      
      
      /* 
      header: "Select Source",
      message: "Pick a source for your image",
      buttons: [
        {
          text: "Camera",
          handler: ()=> {
            this._camera.getPicture(cameraOptions).then((imageData)=> {
              //this.myProfileImage = "data:image/jpeg;base64," + imageData;
              const image = "data:image/jpeg;base64," + imageData;
              //this._angularFireSrore.collection("users").doc(this._angularFireAuth.auth.currentUser.uid).set({image_src : image});
              this._angularFireStore.collection("posts").doc(this.item.id).update({photo : image});
              //this.selectedPhoto = image;
            });
          }
        },
        {
          text: "Gallery",
          handler: ()=> {
            this._camera.getPicture(galleryOptions).then((imageData)=> {
              //this.myProfileImage = "data:image/jpeg;base64," + imageData;
              const image = "data:image/jpeg;base64," + imageData;
              //this._angularFireSrore.collection("users").doc(this._angularFireAuth.auth.currentUser.uid).set({image_src : image});
              this._angularFireStore.collection("posts").doc(this.item.id).update({photo : image});
            });
          }
        }
      ] */

    });

    await alert.present();
  }
/*   getPic(picId): Observable<string>{
    const ref = this.firebaseService.afstore.ref(picId);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    return this.profileUrl = ref.getDownloadURL();
  } */
/*   getPics(imagesFullPath){
    this.postImages = [{isCover:false,photo:"",photoStoragePath:""}];
    for (let index = 0; index < imagesFullPath.length; index++) {
     this.firebaseService.afstore.ref(imagesFullPath[index]).getDownloadURL().toPromise().then(DownloadURL => { 
       let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
       photos.isCover = false;
       photos.photo = DownloadURL;
       photos.photoStoragePath = imagesFullPath[index];
       this.postImages[index] = photos;
       if(imagesFullPath[index] === this.item.coverPhoto){
       this.postImages[index].isCover = true;
       }
      } );
    }
    console.log('photoSlider',this.postImages);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  } */
  deletePhoto(index : number){
    console.log("postImages",this.postImages);
    console.log("index:",index);
        const loading = this.firebaseService.presentLoadingWithOptions().then( res => {return res;} );
         if(this.postImages[index].photoStoragePath !== "") {         
         this.firebaseService.deleteFromStorage(this.postImages[index].photoStoragePath).then(res=> {
         const deletedItem = this.item.imagesFullPath.splice(index,1);
         if(this.item.coverPhoto === deletedItem.pop()){
          if(this.item.imagesFullPath.length != 0){
            this.item.coverPhoto = this.item.imagesFullPath[0];
          }
          else{
            this.item.coverPhoto = "";
          }
         }
         this.firebaseService.updateItemWithoutOptions(this.item).then(()=> {
          this.postImages.splice(index,1); 
          this.firebaseService.presentToast("Photo removed from storage and DB");}
          ).catch(err=>{console.log("Error in deletePhoto Storage:",err)});  
          }
          ).catch(err => console.log("Error in deletePhoto DB: ",err));
        console.log("postImages after delete",this.postImages);
      }
      else{
        this.postImages.splice(index,1);
      }
      loading.then(res=>{res.dismiss();})
      this.changeRef.detectChanges();
}
makeCover(index : number){
  console.log("postImages 1:",this.postImages);
  console.log("index:",index);
  //this.firebaseService.updateItemWithoutOptions(this.item).then(()=> {this.presentToast("Photo successfully used as cover photo");}
  //).catch(err=>{console.log("Error in deletePhoto Storage:",err)});  
  this.postImages[index].isCover = true;
  console.log("postImages 2:",this.postImages);
  this.changeRef.detectChanges();
  
  this.postImages.forEach( (item, i) => {
    if(i === index) {
      item.isCover = true;
    }
    else{
      item.isCover = false;
    }
  });
  this.changeRef.detectChanges();
  this.firebaseService.presentToast("Photo successfully used as cover photo");
  
}
  //END
}
