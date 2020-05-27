import { Component, OnInit } from '@angular/core';
import { ModalController,AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidationErrors } from '@angular/forms';
import * as dayjs from 'dayjs';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../firebase-user.model';
import { SelectUserImageModal } from '../select-image/select-user-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
//import { AngularFirestore } from '@angular/fire/firestore';
import { LoginCredential } from '../../type';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-firebase-create-user',
  templateUrl: './firebase-create-user.modal.html',
  styleUrls: [
    './styles/firebase-create-user.modal.scss',
    './styles/firebase-create-user.shell.scss'
  ],
})
export class FirebaseCreateUserModal implements OnInit {
  createUserForm: FormGroup;
  userData: FirebaseUserModel = new FirebaseUserModel();
  levels = [];
  selectedParking = [];
  selectedPhoto: string;
  showHideParking2 : boolean;
  showHideParking3 : boolean;
  parking1selected : boolean;
  parking2selected : boolean;
  parking3selected : boolean;
  selectOptions : any;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private camera: Camera,
    private alertController: AlertController,
    private featureService : FeatureService,
    private loginService : LoginService
  ) { 
    this.showHideParking2 = false;
    this.showHideParking3 = false;
    this.parking1selected = false;
    this.parking2selected = false;
    this.parking3selected = false;
  }

  ngOnInit() {
    this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    this.createUserForm = new FormGroup({
      name: new FormControl('',Validators.required),
      lastname: new FormControl('',Validators.required),
      building: new FormControl(this.loginService.getBuildingId(),Validators.required),
      app : new FormControl(),
      parking1Level : new FormControl("1000"),
      parking1Number : new FormControl(),
      parking2Level : new FormControl("1000"),
      parking2Number : new FormControl(),
      parking3Level : new FormControl("1000"),
      parking3Number : new FormControl(),
      code : new FormControl(),
      type : new FormControl('owner',Validators.required),
      role : new FormControl('user',Validators.required),
      phone: new FormControl(),
      birthdate: new FormControl(''),
      language : new FormControl('en',Validators.required),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ]))
    }/* ,
    {validators: this.parkingValidator} */
    );

     this.featureService.getItem('building', this.loginService.buildingId).subscribe(item => {
      //console.log("get parking",item)
      this.levels = item.parking;

  });
}

/*   parkingValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    return !("1000" === "1000")  ? { 'parking1Validator': true } : null;

  } */

  parking1Changed(ev:any) {
    console.log(ev.detail.value);
    if(ev.detail.value != "1000"){
      this.createUserForm.controls['parking1Number'].setValidators(Validators.required);

      this.parking1selected = true;
    }
    else{
      this.parking1selected = false;
      this.createUserForm.controls['parking1Number'].setValidators(null);
    }
    this.createUserForm.controls['parking1Number'].updateValueAndValidity();
  }

  parking2Changed(ev:any) {
    console.log(ev.detail.value);
    if(ev.detail.value != "1000"){
      this.createUserForm.controls['parking2Number'].setValidators(Validators.required);
      this.parking2selected = true;
    }
    else{
      this.parking2selected = false;
      this.createUserForm.controls['parking2Number'].setValidators(null);
    }
    this.createUserForm.controls['parking2Number'].updateValueAndValidity();
  }

  parking3Changed(ev:any) {
    console.log(ev.detail.value);
    if(ev.detail.value != "1000"){
      this.createUserForm.controls['parking3Number'].setValidators(Validators.required);
      this.parking3selected = true;
    }
    else{
      this.parking3selected = false;
      this.createUserForm.controls['parking3Number'].setValidators(null);
    }
    this.createUserForm.controls['parking3Number'].updateValueAndValidity();
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  createUser() {

    this.userData.photo = this.selectedPhoto;
    this.userData.name = this.createUserForm.value.name;
    this.userData.lastname = this.createUserForm.value.lastname;
    this.userData.birthdate = this.createUserForm.value.birthdate ? dayjs(this.createUserForm.value.birthdate).unix() : null; // save it in timestamp
    this.userData.phone = this.createUserForm.value.phone;
    this.userData.email = this.createUserForm.value.email;
    this.userData.building = this.createUserForm.value.building;
    this.userData.code =this.createUserForm.value.code;
    this.userData.type =this.createUserForm.value.type;
    this.userData.role =this.createUserForm.value.role;
    this.userData.app =this.createUserForm.value.app;
    this.userData.language =this.createUserForm.value.language;
    const credentials : LoginCredential = { email : this.userData.email, password : "Welcome123" }

    this.selectedParking = [];
    
    if(this.createUserForm.controls['parking1Level'].value != "1000"){
      this.selectedParking.push({ id: this.createUserForm.controls['parking1Level'].value , number : this.createUserForm.value.parking1Number});
    }
        
    if(this.createUserForm.controls['parking2Level'].value != "1000"){
      this.selectedParking.push({ id: this.createUserForm.controls['parking2Level'].value , number : this.createUserForm.value.parking2Number});
    }
        
    if(this.createUserForm.controls['parking3Level'].value != "1000"){
      this.selectedParking.push({ id: this.createUserForm.controls['parking3Level'].value , number : this.createUserForm.value.parking3Number});
    }

    this.userData.parking = this.selectedParking.length ? this.selectedParking : null;
    
    console.log(this.selectedParking);

 this.firebaseService.createUser(this.userData, credentials)

    .then(() => {
      this.dismissModal();
    }); 
  }

  async changeUserImage() {
    const modal = await this.modalController.create({
      component: SelectUserImageModal
    });

    modal.onDidDismiss().then(photo => {
      if (photo.data != null) {
        this.userData.photo = photo.data.link;
      }
    });
    await modal.present();
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
      sourceType:this.camera.PictureSourceType.SAVEDPHOTOALBUM
    };
    const alert = await this.alertController.create({
      header: "Select Source",
      message: "Pick a source for your image",
      buttons: [
        {
          text: "Camera",
          handler: ()=> {
            this.camera.getPicture(cameraOptions).then((imageData)=> {
              const image = "data:image/jpeg;base64," + imageData;
              this.selectedPhoto = image;
            });
          }
        },
        {
          text: "Gallery",
          handler: ()=> {
            this.camera.getPicture(galleryOptions).then((imageData)=> {
              const image = "data:image/jpeg;base64," + imageData;
              this.selectedPhoto = image;
            });
          }
        }
      ]
    });

    await alert.present();
  }

  showHideParkingValidate2(){
   this.showHideParking2 = this.showHideParking2 ? false : true;
   this.showHideParking3 = false;
   if(this.showHideParking2 == false){
    this.createUserForm.controls['parking2Level'].setValue("1000");  
    this.createUserForm.controls['parking2Number'].setValue("");
    this.createUserForm.controls['parking2Number'].setValidators(null);
    this.createUserForm.controls['parking2Number'].updateValueAndValidity();
    
    this.createUserForm.controls['parking3Level'].setValue("1000");
    this.createUserForm.controls['parking3Number'].setValue("");
    this.createUserForm.controls['parking3Number'].setValidators(null);
    this.createUserForm.controls['parking3Number'].updateValueAndValidity();
  }
  }
  showHideParkingValidate3(){
    this.showHideParking3 = this.showHideParking3 ? false : true;
    if(this.showHideParking3 == false){
      this.createUserForm.controls['parking3Level'].setValue("1000");
      this.createUserForm.controls['parking3Number'].setValue("");
      this.createUserForm.controls['parking3Number'].setValidators(null);
      this.createUserForm.controls['parking3Number'].updateValueAndValidity();
    }
  }
  //END

}
