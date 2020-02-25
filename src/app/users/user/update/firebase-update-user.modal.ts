import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

import * as dayjs from 'dayjs';

import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserModel } from '../firebase-user.model';
import { SelectUserImageModal } from '../select-image/select-user-image.modal';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFireAuth } from "@angular/fire/auth";
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
  //skills = [];
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
    private _angularFireAuth : AngularFireAuth,
    private _angularFireSrore :AngularFirestore
  ) { 
    
    //this.myStoredProfileImage = _angularFireSrore.collection("users").doc(_angularFireAuth.auth.currentUser.uid).valueChanges();
    //this.myStoredProfileImage = _angularFireSrore.collection("users").doc(this.user.id).valueChanges();
    //console.log("aaaa",this.myStoredProfileImage);
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
/*       skills: new FormArray([], CheckboxCheckedValidator.minSelectedCheckboxes(1)),
      spanish: new FormControl(this.user.languages.spanish),
      english: new FormControl(this.user.languages.english),
      french: new FormControl(this.user.languages.french) */
    });

/*     this.firebaseService.getSkills().subscribe(skills => {
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

    const {/*age,*/ ...userData} = this.user; // we don't want to save the age in the DB because is something that changes over time

    this.firebaseService.updateUser(userData)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }

/*   async changeUserImage() {
    const modal = await this.modalController.create({
      component: SelectUserImageModal
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
