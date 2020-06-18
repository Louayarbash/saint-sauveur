import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidationErrors } from '@angular/forms';
// import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { TicketModel } from '../ticket.model';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
// import { Crop, CropOptions } from '@ionic-native/crop/ngx';
// import { File } from '@ionic-native/file/ngx';
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';

@Component({
  selector: 'app-create-ticket',
  templateUrl: './create-ticket.modal.html',
  styleUrls: [
    './styles/create-ticket.modal.scss',
    './styles/create-ticket.shell.scss'
  ],
})
export class CreateTicketModal implements OnInit {

  croppedImagepath = "";
  createItemForm: FormGroup;
  itemData: TicketModel = new TicketModel();
  ticketTypes = [];
  selectedType: string;
  // selectedPhoto: string;
  // selectOptions: any;
  today : any;
  minDate : any;
  maxDate : any;
  startDate : any;
  endDate : any;
  minStartDate : any;
  duration : any;
  previousCounterValue : any;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  bookingSection: boolean;
  subjectSection: boolean;
  serviceType = 'other';

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    // private camera: Camera,
    //private alertController: AlertController,
    private featureService: FeatureService,
    private loginService: LoginService
    // private crop: Crop,
    // private imagePicker: ImagePicker,
    // private file: File
    
  ) { 
  }

  ngOnInit() {
    this.bookingSection = false;
    this.subjectSection = false;
    this.today = dayjs().add(24,"hour").toISOString(); 
    this.minDate = dayjs().add(24,"hour").format('YYYY-MM-DD');
    this.maxDate = dayjs().add(1,"month").toISOString();
    this.minStartDate = dayjs().add(24,"hour").format('HH:mm');
    this.duration = 0;
    this.previousCounterValue = 0;  
    
    this.createItemForm = new FormGroup({
      subject: new FormControl('',Validators.required),
      details: new FormControl('',Validators.required),
      typeId: new FormControl('1000',Validators.required),
      status : new FormControl('active',Validators.required),
      date: new FormControl(this.today),
      startDate : new FormControl(this.today),
      duration : new FormControl(0, counterRangeValidatorMinutes(15, 1440)),
      endDate : new FormControl(this.today),
    }/* ,
    {validators: this.parkingValidator} */
    );

     this.featureService.getItem('building', this.loginService.buildingId).subscribe(item => {
      console.log("get ticketTypes",item)
      this.ticketTypes = item.ticketTypes;
  });

  this.onValueChanges();
  }

  private calculateEndDate(){
    let endDate = this.createItemForm.get('endDate').value;
    let endDateTS = dayjs(endDate).unix();
    let newEndDateTS = (endDateTS + ( this.duration * 60 )) * 1000;
    let newEndDate  = dayjs(newEndDateTS).toISOString();
    this.createItemForm.get('endDate').setValue(newEndDate);
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  createTicket() {

    if(this.serviceType == 'elevatorBooking'){
      this.itemData.date = dayjs(this.createItemForm.get('date').value).unix();
      this.itemData.startDate = dayjs(this.createItemForm.get('startDate').value).unix();
      this.itemData.endDate = dayjs(this.createItemForm.get('endDate').value).unix();  
    }
    this.itemData.subject = this.createItemForm.value.subject == '' ? this.serviceType : this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.typeId = this.createItemForm.value.typeId;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(5000);
    this.firebaseService.createItem(this.itemData)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.TicketAddedSuccessfully, 2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.TicketAddingErrors, 2000);
      this.dismissModal();
      console.log(err);
     });      
  }

/*   async selectImageSource(){
    const cameraOptions : CameraOptions = {
      quality:25,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      cameraDirection : this.camera.Direction.FRONT,
      // targetHeight:200,
      // targetWidth:200,
      correctOrientation:true,
      sourceType:this.camera.PictureSourceType.CAMERA
    };

    const galleryOptions : CameraOptions = {
      
      quality:100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      //targetHeight:200,
      //targetWidth:200,
      sourceType:this.camera.PictureSourceType.PHOTOLIBRARY
    };
    const alert = await this.alertController.create({
      header: "Select Source",
      message: "Pick a source for your image",
      buttons: [
        {
          text: "Camera",
          handler: ()=> {
            this.camera.getPicture(cameraOptions).then((imageURI)=> {
              this.cropImage(imageURI);
              //const image = "data:image/jpeg;base64," + imageUri;
              //this.selectedPhoto = image;
            });
          }
        },
        {
          text: "Gallery",
          handler: ()=> {
            this.camera.getPicture(galleryOptions).then((imageURI)=> {
              this.cropImage(imageURI);
              //const image = "data:image/jpeg;base64," + imageData;
              //this.selectedPhoto = image;
            });
          }
        }
      ]
    });

    await alert.present();
  } */
/*   cropImage(imgPath) {
    
    const cropOptions: CropOptions = {
      quality: 25

    }

    this.crop.crop(imgPath, cropOptions)
      .then(
        newPath => {
          this.croppedImageToBase64(newPath.split('?')[0])
        },
        error => {
          alert('Error cropping image' + error);
        }
      );
  } */

/*   croppedImageToBase64(ImagePath) {
    
    let copyPath = ImagePath;
    let splitPath = copyPath.split('/');
    let imageName = splitPath[splitPath.length - 1];
    let filePath = ImagePath.split(imageName)[0];

    this.file.readAsDataURL(filePath, imageName).then(base64 => {
      //this.croppedImagepath = base64;
      //console.log("mmmmmmmmmmmmm",base64)
      this.selectedPhoto = base64;
    
    }).catch( err=> console.log(err,'Error in croppedImageToBase64'));
  } */
  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{      
      console.log("onDateChanges",newDate);
      let today = dayjs().add(30,"minute").format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
      if (today == date){
        this.createItemForm.get('startDate').setValue(this.today);
        this.minStartDate = dayjs(this.today).format("HH:mm");
        this.createItemForm.get('endDate').setValue(this.today);
        console.log("minStartDate",this.minStartDate);
      } 
      else {
        let newDateZeroTimeISO = dayjs(newDate).set("hour", 0).set("minute",0).set("second",0).set("millisecond",0).toISOString();
        this.createItemForm.get('startDate').setValue(newDateZeroTimeISO);
        this.createItemForm.get('endDate').setValue(newDateZeroTimeISO);
        this.minStartDate = "00:00";
      }
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.createItemForm.get('startDate').valueChanges.subscribe(newStartDate=>{      
      //console.log("onStartDateChanges",newStartDate);
      this.createItemForm.get('endDate').setValue(newStartDate);
      //this.previousCounterValue = 0;
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.createItemForm.get('duration').valueChanges.subscribe(duration=>{      
      let endDate = this.createItemForm.get('endDate').value;
      let endDateTS = dayjs(endDate).unix();
      let newEndDateTS : any;
      if (this.previousCounterValue < duration){
         newEndDateTS = (endDateTS + (15 * 60 )) * 1000;
      }
      else if(this.previousCounterValue > duration){
        newEndDateTS = (endDateTS - (15 * 60 )) * 1000;
      }
      else {
        newEndDateTS = dayjs(endDate).unix() * 1000;
      }
      let newEndDate  = dayjs(newEndDateTS).toISOString();
      this.createItemForm.get('endDate').setValue(newEndDate);
      this.duration = duration;
      this.previousCounterValue = duration;
    });

    this.createItemForm.get('typeId').valueChanges.subscribe(newTypeId=>{      
    let typeCheck = this.ticketTypes.find((type: { id: number; }) => type.id === newTypeId );
    if(typeCheck && newTypeId != '1000'){
      this.serviceType = typeCheck.type;
      console.log(typeCheck.type);

      if(typeCheck.type == "elevatorBooking"){
        this.bookingSection = true;
        this.subjectSection = false;

        this.createItemForm.controls['subject'].setValidators(null);
        this.createItemForm.controls['subject'].updateValueAndValidity();

        this.createItemForm.controls['details'].setValidators(null);
        this.createItemForm.controls['details'].updateValueAndValidity();

        this.createItemForm.controls['date'].setValidators(Validators.required);
        this.createItemForm.controls['date'].updateValueAndValidity();

        this.createItemForm.controls['startDate'].setValidators(Validators.required);
        this.createItemForm.controls['startDate'].updateValueAndValidity();

        this.createItemForm.controls['endDate'].setValidators(Validators.required);
        this.createItemForm.controls['endDate'].updateValueAndValidity();

      }
      else{
        this.bookingSection = false;
        this.subjectSection = false;

        this.createItemForm.controls['subject'].setValidators(null);
        this.createItemForm.controls['subject'].updateValueAndValidity();

        this.createItemForm.controls['details'].setValidators(Validators.required);
        this.createItemForm.controls['details'].updateValueAndValidity();
  
        this.createItemForm.controls['date'].setValidators(null);
        this.createItemForm.controls['date'].updateValueAndValidity();
  
        this.createItemForm.controls['startDate'].setValidators(null);
        this.createItemForm.controls['startDate'].updateValueAndValidity();
  
        this.createItemForm.controls['endDate'].setValidators(null);
        this.createItemForm.controls['endDate'].updateValueAndValidity();
      }
    }
    else if(newTypeId == '1000'){
      this.serviceType = 'other';
      this.bookingSection = false;
      this.subjectSection =  true;
      this.createItemForm.controls['subject'].setValidators(Validators.required);
      this.createItemForm.controls['subject'].updateValueAndValidity();

      this.createItemForm.controls['details'].setValidators(Validators.required);
      this.createItemForm.controls['details'].updateValueAndValidity();

      this.createItemForm.controls['date'].setValidators(null);
      this.createItemForm.controls['date'].updateValueAndValidity();

      this.createItemForm.controls['startDate'].setValidators(null);
      this.createItemForm.controls['startDate'].updateValueAndValidity();

      this.createItemForm.controls['endDate'].setValidators(null);
      this.createItemForm.controls['endDate'].updateValueAndValidity();
      
    }
    });
  }
}
