import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import * as dayjs from 'dayjs';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../firebase-user.model';
//import { SelectUserImageModal } from '../select-image/select-user-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Component({
  selector: 'app-firebase-update-user',
  templateUrl: './firebase-update-user.modal.html',
  styleUrls: [
    './styles/firebase-update-user.modal.scss',
    './styles/firebase-update-user.shell.scss'
  ],
})
export class FirebaseUpdateUserModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() user: FirebaseUserModel;

  updateUserForm: FormGroup;
  selectedPhoto: string;
  myProfileImage = "./assets/images/video-playlist/big_buck_bunny.png";
  myStoredProfileImage : Observable<any>;
  //myStoredProfileImage;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private _alertController: AlertController,
    private _camera: Camera,
    private _angularFireSrore :AngularFirestore
  ) { 
    console.log("userId",this.user);
  }

  ngOnInit() {
    this.myStoredProfileImage = this._angularFireSrore.collection("users").doc(this.user.id).valueChanges();
    // this.selectedPhoto = this.user.photo;
    this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
    this.updateUserForm = new FormGroup({
      name: new FormControl(this.user.name, Validators.required),
      lastname: new FormControl(this.user.lastname, Validators.required),
      email: new FormControl(this.user.email, Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      phone: new FormControl(this.user.phone),
      birthdate: new FormControl(dayjs.unix(this.user.birthdate).format('DD/MMMM/YYYY')),
      app: new FormControl(this.user.app),
      building: new FormControl(this.user.building),
      code: new FormControl(this.user.code),
      parking: new FormControl(this.user.parking)
    });
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteUser() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Do you want to delete ' + this.user.name + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.firebaseService.deleteUser(this.user.id)
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['firebase/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
  }

  updateUser() {

    this.user.photo = this.selectedPhoto;
    this.user.name = this.updateUserForm.value.name;
    this.user.lastname = this.updateUserForm.value.lastname;
    this.user.birthdate = dayjs(this.updateUserForm.value.birthdate).unix(); // save it in timestamp
    this.user.phone = this.updateUserForm.value.phone;
    this.user.email = this.updateUserForm.value.email;
    this.user.building = this.updateUserForm.value.building;
    this.user.code = this.updateUserForm.value.code;
    this.user.parking = this.updateUserForm.value.parking;
    this.user.app = this.updateUserForm.value.app;

    const {/*age,*/ ...userData} = this.user; // we don't want to save the age in the DB because is something that changes over time

    this.firebaseService.updateUser(userData)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
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
              this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
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
              this._angularFireSrore.collection("users").doc(this.user.id).update({photo : image});
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
