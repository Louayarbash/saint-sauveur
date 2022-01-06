import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent, ActionSheetController, Platform } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-firebase-create-user',
  templateUrl: './firebase-create-user.modal.html',
  styleUrls: [
    './styles/firebase-create-user.modal.scss'
  ],
})
export class FirebaseCreateUserModal implements OnInit {

  // croppedImagepath = "";
  // isLoading = false;
  disableSubmit: boolean;
  createUserForm: FormGroup;
  userData: UserModel = new UserModel();
  selectedPhoto: string;
  selectOptions: any;
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
    private camera: Camera,
    private actionSheetController : ActionSheetController,
    private featureService: FeatureService,
    private loginService: LoginService,
    private platform: Platform
  ) { 

  }

  ngOnInit() {
    this.disableSubmit= false;
    this.selectedPhoto = '../../assets/sample-images/avatar.png';
    this.createUserForm = new FormGroup({
      firstname: new FormControl('',Validators.required),
      lastname: new FormControl('',Validators.required),
      phone: new FormControl(),
      birthdate: new FormControl(''),
      language : new FormControl('en',Validators.required),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      enableNotifications: new FormControl(true),
      status: new FormControl('active',Validators.required)
    }/* ,
    {validators: this.parkingValidator} */
    );

}
 
  dismissModal() {
   this.modalController.dismiss();
  }

  createUser() {
    this.disableSubmit= true;
    this.userData.photo = this.selectedPhoto;
    this.userData.firstname = this.createUserForm.value.firstname;
    this.userData.lastname = this.createUserForm.value.lastname;
    this.userData.birthdate = this.createUserForm.value.birthdate ? dayjs(this.createUserForm.value.birthdate).unix() : null; // save it in timestamp
    this.userData.phone = this.createUserForm.value.phone;
    this.userData.email = this.createUserForm.value.email;
    this.userData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.userData.createdBy = this.loginService.getLoginID();
    this.userData.status = this.createUserForm.value.status;
    // const credentials : LoginCredential = { email : this.userData.email, password : "Welcome123" }
    const loading = this.featureService.presentLoadingWithOptions(2000);

    // console.log(this.selectedParking);
    const {isShell, ...userData} = this.userData;

 this.firebaseService.createUser(userData)
 .then(() => {
  this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
  this.dismissModal();
  loading.then(res=>res.dismiss());  
}).catch((err) => {
  this.disableSubmit= false; 
  this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
  console.log(err);
 });     

  }
/* 
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
  } */
  // LA_2019_11
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
