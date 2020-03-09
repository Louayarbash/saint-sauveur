import { Component, OnInit,NgModule/*, ChangeDetectorRef */} from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';
//import { Date } from 'core-js';
import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
//import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { FirebaseListingPageModule } from "../../listing/firebase-listing.module";

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
  //translateParams;
  //isLoading = false;
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
  //skills = [];
  //searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,    
    private alertController: AlertController,
    private loginService : LoginService,
    private featureService : FeatureService
  ) {
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
      let today = new Date().toISOString().slice(0,10);
      let date = new Date(newDate).toISOString().slice(0,10);
      
      if (today == date){
        
        this.today = new Date().toISOString();
        this.minDate = this.today;
        let maxDate = new Date();// max in 1 month
        this.maxDate = new Date(maxDate.getFullYear(),maxDate.getMonth()+1,maxDate.getDate());
        this.maxDate = dayjs(this.maxDate).format("YYYY-MM-DD");


        this.createItemForm.get('startDate').setValue(this.today);
        this.minStartDate = dayjs(this.today).format("HH:mm");
        this.createItemForm.get('endDate').setValue(this.today);

      } 
      else {
        this.createItemForm.get('startDate').setValue(date);
        let newDateZeroTime = new Date(newDate).setHours(0,0,0);
        let newDateZeroTimeISO = new Date(newDateZeroTime).toISOString();
        this.createItemForm.get('endDate').setValue(newDateZeroTimeISO);
        this.minStartDate = date;//new Date().toISOString().slice(0,10);
      }
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.createItemForm.get('startDate').valueChanges.subscribe(newStartDate=>{      
      console.log("onStartDateChanges",newStartDate);
      this.createItemForm.get('endDate').setValue(newStartDate);
      //this.previousCounterValue = 0;
      this.minStartDate = new Date().toISOString().slice(0,10);
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.createItemForm.get('duration').valueChanges.subscribe(duration=>{      
      let endDate = new Date(this.createItemForm.get('endDate').value);
      let endDateTimstamp = dayjs(endDate).unix();
      let newEndDateTS : any;
      if (this.previousCounterValue < duration){
         newEndDateTS = (endDateTimstamp + (15 * 60 )) * 1000;
      }
      else if(this.previousCounterValue > duration){
        newEndDateTS = (endDateTimstamp - (15 * 60 )) * 1000;
      }
      else {
        newEndDateTS = dayjs(endDate).unix() * 1000;
      }
      let newEndDate  = new Date(newEndDateTS).toISOString();
      this.createItemForm.get('endDate').setValue(newEndDate);
      this.duration = duration;
      this.previousCounterValue = duration;
    });

  }
  initValues(){
  
  console.log("resetDate");
  this.today = new Date().toISOString();
  this.minDate = this.today;
  let maxDate = new Date();
  console.log(maxDate.getFullYear());
  console.log(maxDate.getMonth());
  console.log(maxDate.getDate());
  this.maxDate = new Date(maxDate.getFullYear(),maxDate.getMonth()+1,maxDate.getDate());
  this.maxDate = dayjs(this.maxDate).format("YYYY-MM-DD");
  this.minStartDate = dayjs(this.today).format("HH:mm");
  this.duration = 0;
  this.previousCounterValue = 0;  
  console.log(this.maxDate);
  }

  private calculateEndDate(){
    let endDate = new Date(this.createItemForm.get('endDate').value);
    let endDateTimstamp = dayjs(endDate).unix();
    let newEndDateTS = (endDateTimstamp + ( this.duration * 60 )) * 1000;
    let newEndDate  = new Date(newEndDateTS).toISOString();
    this.createItemForm.get('endDate').setValue(newEndDate);
  }
  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }

  async dismissModal() {
   await this.modalController.dismiss();
  }

    createItem() {
    //const loading = this.firebaseService.presentLoadingWithOptions();

    this.itemData.date = this.createItemForm.get('date').value;//this.createItemForm.value.date;
    this.itemData.startDate = this.createItemForm.get('startDate').value;//this.createItemForm.value.startDate;
    this.itemData.endDate = this.createItemForm.get('endDate').value;//;this.createItemForm.get('endDate').value;//this.createItemForm.value.endDate;
    this.itemData.note = this.createItemForm.value.note;
    this.itemData.count = this.createItemForm.value.count;
    this.itemData.createDate = new Date().toISOString();
    this.itemData.createdBy = this.loginService.getLoginID();
    this.confirm();
    //dayjs(this.createUserForm.value.birthdate).unix(); // save it in timestamp

/*  this.userData.languages.spanish = this.createUserForm.value.spanish;
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
    
/*     this.firebaseService.createItem(this.itemData)
    .then(() => {
      this.dismissModal();
      this.firebaseService.presentToast("Request added successfully",2000);
      loading.then(res=>res.dismiss());
    });   */   
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
/*   async showAlert(title,msg,task){
    const alert = await this._alertController.create({
      header:title,
      subHeader:msg,
      buttons:[
        {
          text: `Action: ${task}`,
          handler:()=>{

          }
        }
      ]
    })
    alert.present();
  } */

  }
  //END
