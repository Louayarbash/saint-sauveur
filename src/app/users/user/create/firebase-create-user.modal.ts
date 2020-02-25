import { Component, OnInit } from '@angular/core';
import { ModalController,AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../firebase-user.model';
import { SelectUserImageModal } from '../select-image/select-user-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoginCredential } from '../../type';

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
  skills = [];
  selectedPhoto: string;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private _camera: Camera,
    //public alertController: AlertController,
    private _alertController: AlertController,
    private _angularFireSrore :AngularFirestore
  ) { }

  ngOnInit() {
    this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    this.createUserForm = new FormGroup({
      name: new FormControl('', Validators.required),
      lastname: new FormControl('', Validators.required),
      building: new FormControl(''),
      app : new FormControl(''),
      parking : new FormControl(''),
      code : new FormControl(''),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      phone: new FormControl(''),
      birthdate: new FormControl('')
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

  dismissModal() {
   this.modalController.dismiss();
  }

  createUser() {
    this.userData.photo = this.selectedPhoto;
    this.userData.name = this.createUserForm.value.name;
    this.userData.lastname = this.createUserForm.value.lastname;
    this.userData.birthdate = dayjs(this.createUserForm.value.birthdate).unix(); // save it in timestamp
    this.userData.phone = this.createUserForm.value.phone;
    this.userData.email = this.createUserForm.value.email;
    this.userData.building = this.createUserForm.value.building;
    this.userData.code =this.createUserForm.value.code;
    this.userData.parking =this.createUserForm.value.parking;
    this.userData.app =this.createUserForm.value.app;
/*     this.userData.languages.spanish = this.createUserForm.value.spanish;
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
    const credentials : LoginCredential = { email : this.userData.email, password : "Welcome123"}
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
      destinationType: this._camera.DestinationType.DATA_URL,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this._camera.PictureSourceType.CAMERA
    };
    const galleryOptions : CameraOptions = {
      
      quality:100,
      destinationType: this._camera.DestinationType.DATA_URL,
      encodingType: this._camera.EncodingType.JPEG,
      mediaType: this._camera.MediaType.PICTURE,
      targetHeight:200,
      correctOrientation:true,
      sourceType:this._camera.PictureSourceType.SAVEDPHOTOALBUM
    };
    const alert = await this._alertController.create({
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
              //this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
              this.selectedPhoto = image;
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
              //this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
              this.selectedPhoto = image;
            });
          }
        }
      ]
    });

    await alert.present();
  }
  //END

}
