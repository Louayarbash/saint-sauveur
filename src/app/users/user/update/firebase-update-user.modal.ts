import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ModalController, AlertController , IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
//import { SelectUserImageModal } from '../select-image/select-user-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
//import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';

@Component({
  selector: 'app-firebase-update-user',
  templateUrl: './firebase-update-user.modal.html',
  styleUrls: [
    './styles/firebase-update-user.modal.scss'
  ],
})
export class FirebaseUpdateUserModal implements OnInit {
  @Input() user: UserModel;
  // myProfileImage = "./assets/images/video-playlist/big_buck_bunny.png";
  emptyPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
  myStoredProfileImage: Observable<any>;
  updateUserForm: FormGroup;
  userData: UserModel = new UserModel();
  levels = [];
  selectedParking = [];
  selectedPhoto: string;
  showHideParking2: boolean;
  showHideParking3: boolean;
  parking1selected: boolean;
  parking2selected: boolean;
  parking3selected: boolean;
  selectOptions: any;
  userIsAdmin= this.loginService.isUserAdmin();
  @ViewChild(IonContent, {static:true}) content: IonContent;

  constructor(
    private modalController: ModalController,
    //public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private alertController: AlertController,
    private camera: Camera,
    //private _angularFireSrore :AngularFirestore,
    private featureService : FeatureService,
    private loginService : LoginService,
    private changeRef: ChangeDetectorRef
  ) { 
    //console.log("userId",this.user);
    this.showHideParking2 = true;
    this.showHideParking3 = true;
    this.parking1selected = false;
    this.parking2selected = false;
    this.parking3selected = false;
  }

  ngOnInit() {
    // this.selectedPhoto = this.user.photo;
    //this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';

    this.selectedPhoto = this.user.photo ? this.user.photo : this.emptyPhoto;
    this.updateUserForm = new FormGroup({
      firstname: new FormControl(this.user.firstname,Validators.required),
      lastname: new FormControl(this.user.lastname,Validators.required),
      // building: new FormControl(this.user.building,Validators.required),
      apartment : new FormControl(this.user.apartment),
      parking1Level : new FormControl("1000"),
      parking1Number : new FormControl(),
      parking2Level : new FormControl("1000"),
      parking2Number : new FormControl(),
      parking3Level : new FormControl("1000"),
      parking3Number : new FormControl(),
      code : new FormControl(this.user.code),
      type : new FormControl(this.user.type ? this.user.type : 'owner', Validators.required),
      role : new FormControl(this.user.role ? this.user.role : 'user', Validators.required),
      phone: new FormControl(this.user.phone),
      birthdate: new FormControl(this.user.birthdate ? dayjs.unix(this.user.birthdate).format('DD/MMMM/YYYY') : null),
      language : new FormControl(this.user.language ? this.user.language : 'en', Validators.required),
      email: new FormControl(this.user.email, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      status : new FormControl(this.user.status, Validators.required)
    }/* ,
    {validators: this.parkingValidator} */
    );

     /* this.featureService.getItem('building', this.loginService.buildingId).subscribe(item => {
      this.levels = item.parking;
      console.log("this.levels", this.levels);
    }); */


/*     if (level){
      //let checked = index == 0 ? true : false; 
       level = level.desc
       return { name : level , type : 'radio' , label : this.featureService.translations.Level + ": " + level + ' #' + 
       userParking.number , value : {level : level ,number : userParking.number} ,checked: false}

this.radioObject = this.radioObject.filter(function (radioNotNull) {
return radioNotNull != null;
 */

     // this.firebaseService.getItem('buildings', this.loginService.getBuildingId()).subscribe(item => {
      
      this.levels = this.loginService.getBuildingParkings();
      // console.log("parking",this.user.parkings);

        let userParkings = [];
        if (this.user.parkings) {
          userParkings = this.user.parkings.map((userParking) => { 
            
            const levelCheck = this.levels.find( (level: { id: number; }) => level.id === userParking.id );
            if(levelCheck){
              return { id : userParking.id ,number : userParking.number , description : levelCheck.description };
            }
          });
        }
        userParkings = userParkings.filter(function (res) {
          return res != null;
        });
      
     // console.log("userParkingIds",userParkings)
     if(userParkings[0]){
      // console.log(1);

      this.parking1selected = true;

      this.updateUserForm.controls['parking1Level'].setValue(userParkings[0].id);
      this.updateUserForm.controls['parking1Number'].setValue(userParkings[0].number);
      this.changeRef.detectChanges();

    }
    
    if(userParkings[1]){
      // console.log(2);

      this.parking2selected = true;

      this.updateUserForm.controls['parking2Level'].setValue(userParkings[1].id);
      this.updateUserForm.controls['parking2Number'].setValue(userParkings[1].number);
      this.changeRef.detectChanges();
    }
    else{
      this.showHideParking2 = false;
    }
    if(userParkings[2]){
      // console.log(3);

      this.parking3selected = true;
      
      this.updateUserForm.controls['parking3Level'].setValue(userParkings[2].id);
      this.updateUserForm.controls['parking3Number'].setValue(userParkings[2].number);
      this.changeRef.detectChanges();
    }
    else{
      this.showHideParking3 = false;
    }
   
    // });


  }

  parking1Changed(ev:any) {
    if(ev.detail.value !== '1000'){
      this.updateUserForm.controls['parking1Number'].setValidators(Validators.required);
      this.parking1selected = true;
    }
    else{
      this.parking1selected = false;
      this.updateUserForm.controls['parking1Number'].setValidators(null);
    }

    this.updateUserForm.controls['parking1Number'].updateValueAndValidity();

  }

  parking2Changed(ev:any) {
    if(ev.detail.value !== '1000'){
      this.updateUserForm.controls['parking2Number'].setValidators(Validators.required);
      this.parking2selected = true;
    }
    else{
      this.parking2selected = false;
      this.updateUserForm.controls['parking2Number'].setValidators(null);
    }
    
    this.updateUserForm.controls['parking2Number'].updateValueAndValidity();
    
  }

  parking3Changed(ev:any) {

    if(ev.detail.value !== '1000'){
      this.updateUserForm.controls['parking3Number'].setValidators(Validators.required);
      this.parking3selected = true;
    }
    else {
      this.parking3selected = false;
      this.updateUserForm.controls['parking3Number'].setValidators(null);
    }
    this.updateUserForm.controls['parking3Number'].updateValueAndValidity();
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteUser() {
    const alert = await this.alertController.create({
      header:  this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.DeletePostConfirmation + this.user.firstname + '?',
      buttons: [
        {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {}
        },
        {
          text: this.featureService.translations.Yes,
          handler: () => {
            this.firebaseService.deleteUser(this.user.id)
            .then(
              () => {
                this.featureService.presentToast(this.featureService.translations.DeletedSuccessfully,2000);
                this.dismissModal();
                this.router.navigate(['users/listing']);
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

  updateUser() {

    this.userData.id = this.user.id;
    this.userData.photo = this.selectedPhoto;// == this.emptyPhoto ? "" : this.selectedPhoto;
    this.userData.firstname = this.updateUserForm.value.firstname;
    this.userData.lastname = this.updateUserForm.value.lastname;
    this.userData.birthdate = this.updateUserForm.value.birthdate ? dayjs(this.updateUserForm.value.birthdate).unix() : null; // save it in timestamp
    this.userData.phone = this.updateUserForm.value.phone;
    this.userData.email = this.updateUserForm.value.email;
    // this.userData.building = this.updateUserForm.value.building;
    this.userData.code= this.updateUserForm.value.code;
    this.userData.type= this.updateUserForm.value.type;
    this.userData.role= this.updateUserForm.value.role;
    this.userData.apartment= this.updateUserForm.value.apartment;
    this.userData.language= this.updateUserForm.value.language;
    this.userData.status= this.updateUserForm.value.status;
    this.selectedParking = [];
    
    if(this.updateUserForm.controls['parking1Level'].value !== '1000'){
      this.selectedParking.push({ 
      id: this.updateUserForm.controls['parking1Level'].value , 
      number : this.updateUserForm.value.parking1Number});
    }
        
    if(this.updateUserForm.controls['parking2Level'].value !== '1000'){
      this.selectedParking.push({ 
        id: this.updateUserForm.controls['parking2Level'].value , 
        number : this.updateUserForm.value.parking2Number});
    }
        
    if(this.updateUserForm.controls['parking3Level'].value !== '1000'){
      this.selectedParking.push({ 
        id: this.updateUserForm.controls['parking3Level'].value , 
        number : this.updateUserForm.value.parking3Number});
    }

    this.userData.parkings = this.selectedParking.length ? this.selectedParking : null;
    
    console.log(this.selectedParking);
    
    this.firebaseService.updateUser(this.userData)
    .then(() => {
      // this.loginService.updateUserInfo(this.userData);
      this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully, 2000);
      this.modalController.dismiss();
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.UpdatingErrors, 2000);
      console.log(err)
    });
  }
  //LA_2019_11
  async selectImageSource(){
    const cameraOptions: CameraOptions = {
      quality:100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
	    cameraDirection : this.camera.Direction.FRONT,											
      // targetHeight:200,		 
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.CAMERA
    };

    const galleryOptions: CameraOptions = {
	  
      quality:100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      // targetHeight:200,
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.PHOTOLIBRARY
    };
    const alert = await this.alertController.create({
      header: this.featureService.translations.SelectSourceHeader,
      message: this.featureService.translations.SelectSourceMessage,
      buttons: [
        {
          text: this.featureService.translations.Camera,
          handler: ()=> {
            this.camera.getPicture(cameraOptions).then((imageURI)=> {
              this.featureService.cropImage(imageURI)
              .then(base64 => {
                if(base64)
                  this.selectedPhoto = base64;
                })
              .catch( err=> console.log(err,'Error in croppedImageToBase64'));
              }
             )
             .catch(err=> console.log('problem getting photo', err));
          }
        },
        {
          text: this.featureService.translations.PhotoGallery,
          handler: ()=> {
            this.camera.getPicture(galleryOptions).then((imageURI)=> {
              this.featureService.cropImage(imageURI)
              .then(base64 => {
                if(base64)
                  this.selectedPhoto = base64;
                })
              .catch( err=> console.log(err,'Error in croppedImageToBase64'));
              }
             )
             .catch(err=> console.log('problem getting photo', err));
          }
        }
      ]
    });

    await alert.present();
  }
  showHideParkingValidate2(){
    this.showHideParking2 = this.showHideParking2 ? false : true;
    this.showHideParking3 = false;
    this.updateUserForm.markAsDirty();
    if(this.showHideParking2 === false){
     this.updateUserForm.controls['parking2Level'].setValue("1000");  
     this.updateUserForm.controls['parking2Number'].setValue("");
     this.updateUserForm.controls['parking2Number'].setValidators(null);
     this.updateUserForm.controls['parking2Number'].updateValueAndValidity();
     
     this.updateUserForm.controls['parking3Level'].setValue("1000");
     this.updateUserForm.controls['parking3Number'].setValue("");
     this.updateUserForm.controls['parking3Number'].setValidators(null);
     this.updateUserForm.controls['parking3Number'].updateValueAndValidity();
   } else {
    setTimeout(() => {
      this.content.scrollToBottom(400);
    },400); 
  }
   
   }
   showHideParkingValidate3(){
     this.showHideParking3 = this.showHideParking3 ? false : true;
     this.updateUserForm.markAsDirty();
    if(this.showHideParking3 === false){
       this.updateUserForm.controls['parking3Level'].setValue('1000');
       this.updateUserForm.controls['parking3Number'].setValue('');
       this.updateUserForm.controls['parking3Number'].setValidators(null);
       this.updateUserForm.controls['parking3Number'].updateValueAndValidity();
     }
    else {
      setTimeout(() => {
        this.content.scrollToBottom(400);
      }, 400); 
    }
   }

}
