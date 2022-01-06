import { Component, OnInit, Input, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ModalController, AlertController , IonContent, ActionSheetController, Platform } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { Observable } from "rxjs";
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import { ParkingInfo } from '../../../type';
import firebase from 'firebase/app';

@Component({
  selector: 'app-firebase-update-user',
  templateUrl: './firebase-update-user.modal.html',
  styleUrls: [
    './styles/firebase-update-user.modal.scss'
  ],
})
export class FirebaseUpdateUserModal implements OnInit {
  @Input() user: UserModel;
  @Input() parkingInfo: ParkingInfo[];
  // myProfileImage = "./assets/images/video-playlist/big_buck_bunny.png";
  // emptyPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';
  emptyPhoto = '../../assets/sample-images/avatar.png';
  myStoredProfileImage: Observable<any>;
  updateUserForm: FormGroup;
  userData: UserModel = new UserModel();
  //buildingParkings = this.loginService.getBuildingParkings();
  selectedParking = [];
  selectedPhoto: string;
  selectOptions: any;
  userIsAdmin= this.loginService.isUserAdmin();
  userIsGlobalAdmin= this.loginService.isUserGlobalAdmin();
  loggedEmail= this.loginService.getLoginEmail();
  customAlertOptions: any = {
    header: this.featureService.translations.SelectParkingLevel,
    //subHeader: this.featureService.translations.OK,
    //message: this.featureService.translations.YES,
    translucent: true,
    cssClass: 'custom-alert'
  };
  @ViewChild(IonContent, {static:true}) content: IonContent;
  

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    public router: Router,
    private alertController: AlertController,
    private camera: Camera,
    private featureService : FeatureService,
    private loginService : LoginService,
    private actionSheetController : ActionSheetController,
    private platform: Platform
  ) {
  }

  ngOnInit() {
    // this.selectedPhoto = this.user.photo;
    //this.selectedPhoto = 'https://s3-us-west-2.amazonaws.com/ionicthemes/otros/avatar-placeholder.png';

    this.selectedPhoto = this.user.photo ? this.user.photo : this.emptyPhoto;
    this.updateUserForm = new FormGroup({
      firstname: new FormControl(this.user.firstname,Validators.required),
      lastname: new FormControl(this.user.lastname,Validators.required),
      phone: new FormControl(this.user.phone),
      birthdate: new FormControl(this.user.birthdate ? dayjs.unix(this.user.birthdate).format('DD/MMMM/YYYY') : null),
      email: new FormControl({value: this.user.email, disabled: true}, Validators.compose([
        /*Validators.required,*/
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      status : new FormControl(this.user.status, Validators.required)
    }/* ,
    {validators: this.parkingValidator} */
    );

     // console.log("userParkingIds",userParkings)

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
                this.router.navigate(['app/start-menu/priests']);
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

  async updateUser() {

    this.userData.id = this.user.id;
    this.userData.photo = this.selectedPhoto;// == this.emptyPhoto ? "" : this.selectedPhoto;
    this.userData.firstname = this.updateUserForm.value.firstname;
    this.userData.lastname = this.updateUserForm.value.lastname;
    this.userData.birthdate = this.updateUserForm.value.birthdate ? dayjs(this.updateUserForm.value.birthdate).unix() : null; // save it in timestamp
    this.userData.phone = this.updateUserForm.value.phone;
    this.userData.email = this.updateUserForm.value.email;
    this.userData.status= this.updateUserForm.value.status;
    this.userData.modificationDate = firebase.firestore.FieldValue.serverTimestamp();
    
    // console.log(this.selectedParking);
    const {isShell, ...userData} = this.userData;
    
    if(this.userData.status !== "active"){
      const alert = await this.alertController.create({
        header:  this.featureService.translations.PleaseConfirm,
        message: this.featureService.translations.InactiveUserConfirmation,
        buttons: [
          {
            text: this.featureService.translations.No,
            role: 'cancel',
            handler: () => {}
          },
          {
            text: this.featureService.translations.Yes,
            handler:() => {
                  this.firebaseService.updateUser(userData)
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
          }
        ]
      });
      await alert.present();
    }
    else{
      this.firebaseService.updateUser(userData)
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

  }
  //LA_2019_11
  async selectImageSource(){
    const cameraOptions : CameraOptions = {
      // allowEdit:true,
        quality:100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        cameraDirection : this.camera.Direction.FRONT,
        //correctOrientation:true,
        sourceType:this.camera.PictureSourceType.CAMERA
      };
  
      const galleryOptions : CameraOptions = {
        quality:100,
        destinationType: this.camera.DestinationType.FILE_URI,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType:this.camera.PictureSourceType.PHOTOLIBRARY
      };
    const actionSheet = await this.actionSheetController.create({
      header: this.featureService.translations.SelectImagesSource,
      buttons: [{
        text: this.featureService.translations.PhotoGallery,
        icon: 'images',
        handler: () => {
              this.camera.getPicture(galleryOptions).then((imageURI)=> {

                if (this.platform.is('ios')) {
                  return imageURI
                } else if (this.platform.is('android')) {
                  // Modify fileUri format, may not always be necessary
                  imageURI = 'file://' + imageURI;
        
                  /* Using cordova-plugin-crop starts here */
                }

                this.featureService.cropImage(imageURI)
                .then(base64 => {
                  if(base64)
                    this.selectedPhoto = base64;
                    this.updateUserForm.markAsDirty();
                  })
                .catch( err=> console.log(err,'Error in croppedImageToBase64'));
                }
               )
               .catch(err=> console.log('problem getting photo', err));
            }
          }, {
        text: this.featureService.translations.Camera,
        icon: 'camera',
        handler: () => {
              this.camera.getPicture(cameraOptions).then((imageURI)=> {
                this.featureService.cropImage(imageURI)
                .then(base64 => {
                  if(base64)
                    this.selectedPhoto = base64;
                    this.updateUserForm.markAsDirty();
                  })
                .catch( err=> console.log(err,'Error in croppedImageToBase64'));
                }
               )
               .catch(err=> console.log('problem getting photo', err));
            }
          }, {
        text: this.featureService.translations.Cancel,
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
      });
      await actionSheet.present();
  }


}
