import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
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
    this.ticketTypes= this.loginService.getBuildingServices();
    this.bookingSection = false;
    this.subjectSection = true;
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
      // status : new FormControl('active',Validators.required),
      date: new FormControl(this.today),
      startDate : new FormControl(this.today),
      duration : new FormControl(0),
      endDate : new FormControl(this.today),
    }/* ,
    {validators: this.parkingValidator} */
    );
    
/*      this.featureService.getItem('building', this.loginService.buildingId).subscribe(item => {
      console.log("get ticketTypes",item)
      this.ticketTypes = item.ticketTypes;
  }); */

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

  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{
      let today = dayjs().add(30,"minute").format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
      if (today == date){
        this.createItemForm.get('startDate').setValue(this.today);
        this.minStartDate = dayjs(this.today).format("HH:mm");
        this.createItemForm.get('endDate').setValue(this.today);
      }
      else {
        let newDateZeroTimeISO = dayjs(newDate).set("hour", 0).set('minute',0).set('second',0).set('millisecond',0).toISOString();
        this.createItemForm.get('startDate').setValue(newDateZeroTimeISO);
        this.createItemForm.get('endDate').setValue(newDateZeroTimeISO);
        this.minStartDate = '00:00';
      }
      if(this.duration > 0) {
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
      console.log(this.createItemForm.errors);
    let typeCheck = this.ticketTypes.find((type: { id: number; }) => type.id === newTypeId );
    if(typeCheck && newTypeId != '1000'){
      this.serviceType = typeCheck.description;
      console.log(typeCheck.type);

      if(typeCheck.description === 'ElevatorBooking'){
        
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

        this.createItemForm.controls['duration'].setValidators(counterRangeValidatorMinutes(15, 1440));
        this.createItemForm.controls['duration'].updateValueAndValidity();


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

        this.createItemForm.controls['duration'].setValidators(null);
        this.createItemForm.controls['duration'].updateValueAndValidity();
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

      this.createItemForm.controls['duration'].setValidators(null);
      this.createItemForm.controls['duration'].updateValueAndValidity();
      
    }
    });
  }
  createTicket() {

    if(this.serviceType == 'ElevatorBooking'){
      this.itemData.date = dayjs(this.createItemForm.get('date').value).unix();
      this.itemData.startDate = dayjs(this.createItemForm.get('startDate').value).unix();
      this.itemData.endDate = dayjs(this.createItemForm.get('endDate').value).unix();  
    }
    this.itemData.reference = this.loginService.getApaNumber() + "-" + Math.round(Math.random() * 1000).toString();
    this.itemData.buildingId = this.loginService.getBuildingId();
    this.itemData.subject = this.createItemForm.value.subject == '' ? this.serviceType : this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.status = 'active';
    this.itemData.typeId = this.createItemForm.value.typeId;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    // const loading = this.featureService.presentLoadingWithOptions(5000);
    this.firebaseService.createItem(this.itemData)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      this.dismissModal();
      // loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      console.log(err);
     });      
  }
}
