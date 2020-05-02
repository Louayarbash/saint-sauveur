import { Component, OnInit,NgModule} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
//import { TranslateService, TranslateModule } from '@ngx-translate/core';
//import { FirebaseListingPageModule } from "../../listing/firebase-listing.module";
import  * as firebase from 'firebase/app';



@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})
export class FirebaseCreateItemModal implements OnInit {
  loginID = this.loginService.getLoginID();
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  today : any;//= new Date().toISOString().slice(0,10);
  minDate : any;// = new Date().toISOString();
  maxDate : any;// = new Date().getFullYear();
  startDate : any;//= new Date().toISOString();
  endDate : any;//= this.startDate;
  minStartDate : any;//= this.startDate;
  duration : any;
  previousCounterValue : any;//= 0;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,    
    private alertController: AlertController,
    private loginService : LoginService,
    private featureService : FeatureService
  ) {
  
    console.log("inside create deal")
    
  }

  ngOnInit() {
     this.initValues();
     // default image     
     this.createItemForm = new FormGroup({
      date: new FormControl(this.today, Validators.required),
      startDate : new FormControl(this.today ,Validators.required),
      duration : new FormControl(0, counterRangeValidatorMinutes(15, 720)),
      endDate : new FormControl({value : this.today, disabled : true}, Validators.required),
      count : new FormControl(1, counterRangeValidator(1, 5)),
      note : new FormControl('') 
    });
    this.onValueChanges();

  }
  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{      
      console.log("onDateChanges",newDate);
      let today = dayjs().format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
/*       console.log(new Date().toISOString().slice(0,10));
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
  this.today = dayjs().toISOString(); 
  //console.log("resetDate", dayjs().toISOString());
  this.minDate = dayjs().format('YYYY-MM-DD');
  this.maxDate = dayjs().add(1,"month").toISOString();
  this.minStartDate = dayjs().format('HH:mm');
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
    this.itemData.date = this.createItemForm.get('date').value;//this.createItemForm.value.date;
    this.itemData.startDate = this.createItemForm.get('startDate').value;
    this.itemData.endDate = this.createItemForm.get('endDate').value;
    this.itemData.startDateTS = dayjs(this.createItemForm.get('startDate').value).unix();
    this.itemData.endDateTS = dayjs(this.createItemForm.get('endDate').value).unix();
    this.itemData.durationSeconds = this.itemData.endDateTS - this.itemData.startDateTS;
    this.itemData.expiresIn = this.itemData.startDateTS - dayjs().unix();
    this.itemData.note = this.createItemForm.value.note;
    this.itemData.count = this.createItemForm.value.count;
    //this.itemData.createDate = new Date().toISOString();
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.buildingId = this.loginService.buildingId;
/*     this.itemData.createDate1 = firebase.firestore.Timestamp.now();
    this.itemData.createDate2 = now;
    this.itemData.createDate3 = dayjs().toDate();
    this.itemData.createDate4 = dayjs().toISOString();
    this.itemData.createDate5 = dayjs().unix(); */

    this.itemData.createdBy = this.loginService.getLoginID();
    this.itemData.buildingId = this.loginService.buildingId;
    
    this.confirm();
  }
  async confirm(){
    let date = dayjs(this.itemData.date).format("dddd, MMM, YYYY");
    let endDate = dayjs(this.itemData.endDate).format("dddd, MMM, YYYY");
    let message = "";
    if(date == endDate){
      message = "New parking request on " + date + " from " + dayjs(this.itemData.startDate).format("HH:mm") + " until " + dayjs(this.itemData.endDate).format("HH:mm");
    }
    else{
      message = "New parking request on " + date+ " from " + dayjs(this.itemData.startDate).format("HH:mm") + " to " + endDate + " at " + dayjs(this.itemData.endDate).format("HH:mm");
    }    
    const alert = await this.alertController.create({
      header: this.featureService.translations.ConfirmRequestDetails,
      message: message,
      buttons: [
         {
          text: "OKAY",
          handler: ()=> {
            const loading = this.featureService.presentLoadingWithOptions(5000);
            this.firebaseService.createItem(this.itemData)
            .then(() => {
              this.dismissModal();
              this.featureService.presentToast(this.featureService.translations.RequestAddedSuccessfully,2000);
              loading.then(res=>res.dismiss());
            }).catch(err => {
              console.log(err)
              this.featureService.presentToast(this.featureService.translations.ConnectionProblem,2000);
              loading.then(res=>res.dismiss());
            });              
          }
        },
        {
          text: "Cancel",
           handler: ()=> {          
            },             
          }
      ]
    });
    await alert.present();

  }
  }
  //END
