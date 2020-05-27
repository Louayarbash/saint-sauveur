import { Component, OnInit,NgModule, Input, ChangeDetectorRef} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import * as dayjs from 'dayjs';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel} from '../firebase-item.model';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
//import { TranslateService, TranslateModule } from '@ngx-translate/core';
//import { FirebaseListingPageModule } from "../../listing/firebase-listing.module";
import  * as firebase from 'firebase/app';
import { ConditionalExpr } from '@angular/compiler';
//import { stringify } from 'querystring';

interface userParking {
  index : number;
  id : number;
  level : string;
  number : string;
}

@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})



export class FirebaseCreateItemModal implements OnInit {
  @Input() type : string;
  loginID = this.loginService.getLoginID();
  userParking : userParking[];
  createItemForm: FormGroup;
  itemData: ItemModel = new ItemModel();
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

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,    
    private alertController: AlertController,
    private loginService : LoginService,
    private featureService : FeatureService,
    //private changeRef : ChangeDetectorRef
    
  ) {
  
  }

  ngOnInit() {
     this.initValues();
     this.createItemForm = new FormGroup({
      date: new FormControl(this.today, Validators.required),
      startDate : new FormControl(this.today ,Validators.required),
      duration : new FormControl(0, counterRangeValidatorMinutes(15, 1440)),
      endDate : new FormControl({value : this.today, disabled : true}, Validators.required),
      count : new FormControl(1, counterRangeValidator(1, 5)),
      parking : new FormControl(''),
      note : new FormControl('') 
    });
    if(this.type == "offer"){
      this.createItemForm.controls['parking'].setValidators(Validators.required);
    }

    this.onValueChanges();

  }
  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{      
      console.log("onDateChanges",newDate);
      let today = dayjs().add(30,"minute").format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
/*    console.log(new Date().toISOString().slice(0,10));
      console.log(new Date().toISOString());
      console.log(new Date().getHours());
      console.log(new Date().getDay());
      console.log(new Date());
      console.log('date',date);
      console.log('today',today);
      console.log(dayjs().toISOString()) */
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

  }
  initValues(){
  
  this.loginService.getUserInfoObservable().subscribe(user =>{
    
    this.userParking = user.parking;

    if(this.userParking){
      this.getUserParking(this.userParking);
    }
    else{
      this.featureService.presentToast("No parking assigned to your profile, please contact your building administrator",3000);
    }
  })

  this.today = dayjs().add(30,"minute").toISOString(); 
  //console.log("resetDate", dayjs().toISOString());
  this.minDate = dayjs().add(30,"minute").format('YYYY-MM-DD');
  this.maxDate = dayjs().add(1,"month").toISOString();
  this.minStartDate = dayjs().add(30,"minute").format('HH:mm');
  //console.log("minStartDate",this.minStartDate)
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
    //const loading = this.firebaseService.presentLoadingWithOptions();
    this.itemData.type = this.type;
    this.itemData.date = this.createItemForm.get('date').value;//this.createItemForm.value.date;
    this.itemData.dateTS = dayjs(this.createItemForm.get('date').value).unix();
    this.itemData.startDate = this.createItemForm.get('startDate').value;
    this.itemData.endDate = this.createItemForm.get('endDate').value;
    this.itemData.startDateTS = dayjs(this.createItemForm.get('startDate').value).unix();
    this.itemData.endDateTS = dayjs(this.createItemForm.get('endDate').value).unix();
    this.itemData.durationSeconds = this.itemData.endDateTS - this.itemData.startDateTS;
    this.itemData.expiresIn = this.itemData.startDateTS - dayjs().unix();
    this.itemData.note = this.createItemForm.value.note;
    this.itemData.count = this.type == 'request' ? this.createItemForm.value.count : '1';
    //this.itemData.createDate = new Date().toISOString();
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.buildingId;
    
/*  this.itemData.createDate1 = firebase.firestore.Timestamp.now();
    this.itemData.createDate2 = now;
    this.itemData.createDate3 = dayjs().toDate();
    this.itemData.createDate4 = dayjs().toISOString();
    this.itemData.createDate5 = dayjs().unix(); */
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
      message = this.featureService.getTranslationParams(messageTranslate,{date : date, startTime : startTime, endTime : endTime});
    }
    else{
      message = this.featureService.getTranslationParams(messageTranslate2,{date : date, startTime : startTime, endDate: endDate, endTime : endTime})
    }    
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
         {
          text: this.featureService.translations.OK,
          handler: ()=> {
            const loading = this.featureService.presentLoadingWithOptions(5000);
            this.firebaseService.createItem(this.itemData)
            .then(() => {
              this.dismissModal();
              //this.featureService.presentToast(this.featureService.translations.RequestAddedSuccessfully,2000);
              loading.then(res=>res.dismiss());
            }).catch(err => {
              console.log(err)
              //this.featureService.presentToast(this.featureService.translations.ConnectionProblem,2000);
              loading.then(res=>res.dismiss());
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

  getUserParking(userParking : userParking[]){

  let userParkingInfo : string;
  let radioObject: any[];
  let correctedParking : any[];

    this.featureService.getItem('building', this.loginService.getBuildingId()).subscribe(  building => {
    let levels = building.parking;
    
    console.log("levels",levels);
    console.log("parking",userParking);

    if (userParking) {
        radioObject = userParking.map((userParking, index) => {
          let level = levels.find( (level: { id: number; }) => level.id === userParking.id );//.desc;
           if (level){
             let checked = index == 0 ? true : false; 
             level = level.desc
             return {  index : index, id: userParking.id, number : userParking.number, name : level , type : 'radio' , label : this.featureService.translations.Level + ": " + level + ' - ' + userParking.number , value : {index: index, level : level ,number : userParking.number} ,checked: checked}
          } 
        });
  
    
  this.radioObjectFiltered = radioObject.filter(function (radioNotNull) {
    return radioNotNull != null;
  });

  if(this.radioObjectFiltered.length == 1){
    userParkingInfo = this.featureService.translations.Level + ": " + this.radioObjectFiltered[0].name + ' - ' + userParking[0].number;
    this.createItemForm.get('parking').setValue(userParkingInfo);
    this.itemData.parkingInfo = {level: this.radioObjectFiltered[0].name, number: userParking[0].number};
    this.hasMultipleParking = false;
  }
  else if(this.radioObjectFiltered.length > 1){
    this.hasMultipleParking = true;
  }
  else if(this.radioObjectFiltered.length == 0){
    this.featureService.presentToast("No parking found!, Problem with your current parking information",3000);
  }

  if( this.radioObjectFiltered.length != radioObject.length){
    correctedParking = this.radioObjectFiltered.map(parking => {return {id : parking.id, number : parking.number}}); 
    this.createItemForm.get('parking').setValue(null);
    this.featureService.presentToast("Parking info. updated",3000);
    this.loginService.updateUserParking(correctedParking);
  }
}
else{
  this.featureService.presentToast("Problem retrieving your parking info.",3000);
}

    });
}
  
  async chooseParkingToOffer() {

    const alert = await this.alertController.create({
      header: this.featureService.translations.ChooseParkingHeader,
      message: this.featureService.translations.ChooseParkingMessage,
      inputs:  this.radioObjectFiltered ,
      buttons: [
        {
         text:  this.featureService.translations.OK,
         handler: (data : userParking)=> {
          console.log("before",this.radioObjectFiltered);
           console.log(data);
           let selectedParkingInfo = this.featureService.translations.Level + ": " + data.level + ' - ' + data.number;
           this.createItemForm.get('parking').setValue(selectedParkingInfo);
           this.itemData.parkingInfo = {level: data.level, number: data.number};
           this.radioObjectFiltered.map(radio => { 
             radio.checked = data.index == radio.index? true : false 
             return radio;
          });
          console.log("after",this.radioObjectFiltered);
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
