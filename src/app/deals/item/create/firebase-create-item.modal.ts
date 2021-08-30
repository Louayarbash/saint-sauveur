import { Component, OnInit, Input} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel} from '../firebase-item.model';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import firebase from 'firebase/app';
import { ReplaySubject } from 'rxjs';
import { NotificationItemModel } from '../../../services/feature/notification-item.model';   


@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html'
})

export class FirebaseCreateItemModal implements OnInit {
  @Input() type: string;
  @Input() segmentValueSubject: ReplaySubject<string>;

  loginID = this.loginService.getLoginID();
  parkingInfo  = this.loginService.getUserParkingInfo(); // : userParking[]
  createItemForm: FormGroup;
  itemData: ItemModel = new ItemModel();
  itemDataNotif: NotificationItemModel= new NotificationItemModel();
  today : any;
  minDate : any;
  maxDate : any;
  startDate : any;
  endDate : any;
  minStartDate : any;
  duration : any;
  previousCounterValue : any;//= 0;
  hasMultipleParking : boolean = false;
  radioObjectFiltered: any[];
  selectedParking : string = '';
  disableSubmit: boolean;
  
  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,    
    private alertController: AlertController,
    private loginService : LoginService,
    private featureService : FeatureService
  ) {
  }

  ngOnInit() {
    this.disableSubmit= false;
    this.initValues();

     this.createItemForm = new FormGroup({
      date: new FormControl(this.today, Validators.required),
      startDate : new FormControl(this.today ,this.startDateValidator),
      duration : new FormControl(0, counterRangeValidatorMinutes(15, 1440)),
      endDate : new FormControl(this.today/*{value : this.today, disabled : true}*/, Validators.required),
      count : new FormControl(1, counterRangeValidator(1, 5)),
      parking : new FormControl(''),
      note : new FormControl('') 
    });

    if(this.type == "offer"){
      this.createItemForm.controls['parking'].setValidators(Validators.required);
    }
    
    if (this.parkingInfo && this.type == 'offer'){
      this.getParkingList();
    }

    this.onValueChanges();
  }

  startDateValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {

    return (dayjs(control.value).unix() < dayjs(this.today).unix()) ? { 'wrongStartDate': true } : null;

  }
  
  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{      
      // console.log("onDateChanges",newDate);
      let today = dayjs().add(30,"minute").format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');

      if (today == date){
        this.createItemForm.get('startDate').setValue(this.today);
        this.minStartDate = dayjs(this.today).format("HH:mm");
        this.createItemForm.get('endDate').setValue(this.today);
        // console.log("minStartDate",this.minStartDate);
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

  }
  initValues(){

  this.today = dayjs().add(30,"minute").toISOString(); 
  this.minDate = dayjs().add(30,"minute").format('YYYY-MM-DD');
  this.maxDate = dayjs().add(1,"month").toISOString();
  this.minStartDate = dayjs().add(30,"minute").format('HH:mm');
  this.duration = 0;
  this.previousCounterValue = 0;  

  }

  private calculateEndDate(){
    let endDate = this.createItemForm.get('endDate').value;
    let endDateTS = dayjs(endDate).unix();
    let newEndDateTS = (endDateTS + ( this.duration * 60 )) * 1000;
    let newEndDate  = dayjs(newEndDateTS).toISOString();
    this.createItemForm.get('endDate').setValue(newEndDate);
  }

  async dismissModal() {
   await this.modalController.dismiss();
  }

    createItem() {
    this.disableSubmit= true;
    this.itemData.type = this.type;
    this.itemData.date = this.createItemForm.get('date').value;
    this.itemData.dateTS = dayjs(this.createItemForm.get('date').value).unix();
    this.itemData.startDate = this.createItemForm.get('startDate').value;
    this.itemData.endDate = this.createItemForm.get('endDate').value;
    this.itemData.startDateTS = dayjs(this.createItemForm.get('startDate').value).unix();
    this.itemData.endDateTS = dayjs(this.createItemForm.get('endDate').value).unix();
    this.itemData.durationSeconds = this.itemData.endDateTS - this.itemData.startDateTS;
    this.itemData.expiresIn = this.itemData.startDateTS - dayjs().unix();
    this.itemData.note = this.createItemForm.value.note;
    this.itemData.count = this.type == 'request' ? this.createItemForm.value.count : '1';
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.getBuildingId();

    this.itemDataNotif.buildingId= this.loginService.getBuildingId();
    this.itemDataNotif.type= "deal"
    this.itemDataNotif.subType= this.itemData.type
    this.itemDataNotif.action= "new"
    this.itemDataNotif.status= "active"
    this.itemDataNotif.creatorName= this.loginService.getLoginName();
    this.itemDataNotif.createDate= this.itemData.createDate;
    this.itemDataNotif.createdBy= this.itemData.createdBy;

    this.confirm();
  }
  async confirm(){
    let date = dayjs(this.itemData.date).format("DD, MMM, YYYY");
    let endDate = dayjs(this.itemData.endDate).format("DD, MMM, YYYY");
    let startTime = dayjs(this.itemData.startDate).format("HH:mm");
    let endTime = dayjs(this.itemData.endDate).format("HH:mm");
    let header = "";
    let message = "";
    let messageTranslate = "";
    let messageTranslate2 = "";
    if (this.type == "request"){
      header = this.featureService.translations.ConfirmRequestDetails;
      messageTranslate = "CreateParkingRequestConfirmation";
      messageTranslate2 = "CreateParkingRequestConfirmation2";
    }
    else {
      header = this.featureService.translations.ConfirmOfferDetails;
      messageTranslate = "CreateParkingOfferConfirmation";
      messageTranslate2 = "CreateParkingOfferConfirmation2";
    }
    if(date == endDate){
      message = this.featureService.getTranslationParams(messageTranslate,{numPlaces: this.itemData.count, date : date, startTime : startTime, endTime : endTime});
    }
    else{
      message = this.featureService.getTranslationParams(messageTranslate2,{numPlaces: this.itemData.count, date : date, startTime : startTime, endDate: endDate, endTime : endTime})
    }    
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
         {
          text: this.featureService.translations.OK,
          handler: ()=> {
            const loading = this.featureService.presentLoadingWithOptions(5000);
            const {isShell, ...itemData} = this.itemData;
            this.firebaseService.createItem(itemData)
            .then(() => {
              this.featureService.createItem("notifications",this.itemDataNotif)
              this.segmentValueSubject.next('myRequests');
              this.dismissModal();
              // this.featureService.presentToast(this.featureService.translations.RequestAddedSuccessfully, 2000);
              loading.then(res=>res.dismiss());
            }).catch(err => {
              this.disableSubmit= false;
              // this.dismissModal();
              console.log(err)
              // this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
              loading.then(res=>res.dismiss());
            });              
          }
        },
        {
          text: this.featureService.translations.Cancel,
           handler: ()=> { 
            this.disableSubmit= false;         
            },             
          }
      ]
    });
    await alert.present();
  }

  getParkingList(){

  let userParkingInfo : string;
  let radioObject: any[];
  let correctedParking : any[];
  let parkingInfo = this.loginService.getUserParkingInfo();
  if (parkingInfo) {
        radioObject = parkingInfo.map((parkingInfo, index) => {
             let checked = index == 0 ? true : false; 
             return {  index : index, id: parkingInfo.id, number : parkingInfo.number, description : parkingInfo.description , type : 'radio' , label : this.featureService.translations.Level + ": " + parkingInfo.description + ' / #' + parkingInfo.number , value : {index: index, level : parkingInfo.description ,number : parkingInfo.number} ,checked: checked}
      });
      
  this.radioObjectFiltered = radioObject.filter(function (radioNotNull) {
    return radioNotNull != null;
  });

  if(this.radioObjectFiltered?.length == 1){
    userParkingInfo = this.featureService.translations.Level + ": " + this.radioObjectFiltered[0].description + ' - #' + parkingInfo[0].number;
    this.createItemForm.get('parking').setValue(userParkingInfo);
    this.selectedParking =userParkingInfo;
    this.itemData.parkingInfo = {level: this.radioObjectFiltered[0].description, number: parkingInfo[0].number};
    this.hasMultipleParking = false;
  }
  else if(this.radioObjectFiltered?.length > 1){
    this.hasMultipleParking = true;
  }
  else if(this.radioObjectFiltered?.length == 0){
    this.featureService.presentToast(this.featureService.translations.NoParkingFound, 2000);
  }

  if( this.radioObjectFiltered.length != radioObject.length){
    correctedParking = this.radioObjectFiltered.map(parking => {return {id : parking.id, number : parking.number}}); 
    this.createItemForm.get('parking').setValue(null);
    this.selectedParking = '';
    this.featureService.presentToast(this.featureService.translations.ParkingInfoUpdated,2000);
    this.loginService.updateUserParking(correctedParking);
  }
}
else{
  // this.featureService.presentToast(this.featureService.translations.NoParkingAssigned, 2000);
  this.featureService.presentToast(this.featureService.translations.ProblemRetrievingYourParkingInfo,2000);
}
}
  
  async chooseParkingToOffer() {

    const alert = await this.alertController.create({
      header: this.featureService.translations.ChooseParkingHeader,
      message: this.featureService.translations.ChooseParkingMessage,
      inputs:  this.radioObjectFiltered ,
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: (data : any)=> {
          
           let selectedParkingInfo = this.featureService.translations.Level + ": " + data.level + " - #" + data.number;
           this.createItemForm.get('parking').setValue(selectedParkingInfo);
           this.selectedParking = selectedParkingInfo;
           this.itemData.parkingInfo = {level: data.level, number: data.number};
           this.radioObjectFiltered.map(radio => { 
             radio.checked = data.index == radio.index? true : false 
             return radio;
          });
         }
       },
       {
         text: this.featureService.translations.Cancel,
          handler: ()=> {
           }, 
        }
     ]
    });
    await alert.present();
  
}
  }
  //END
