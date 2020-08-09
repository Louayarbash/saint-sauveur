import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

//import * as dayjs from 'dayjs';

//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
//import { AngularFireAuth } from "@angular/fire/auth";
//import { Observable } from "rxjs";
//import { PhotosData } from '../../../type'
import { File } from "@ionic-native/file/ngx";
// import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
import { Files } from '../../../type'
import { Chooser } from '@ionic-native/chooser/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import dayjs from 'dayjs';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html',
  styleUrls: [
    './styles/firebase-update-item.modal.scss',
    './styles/firebase-update-item.shell.scss'
  ],
})
export class FirebaseUpdateItemModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: FirebaseItemModel;

  updateItemForm: FormGroup;
  files : Files[] = [];
  newName : string = "";
  nameChanging : boolean[] = [];
  voting: boolean;
  today : any;
  minDate : any;
  maxDate : any;
  startDate : any;
  endDate : any;
  minStartDate : any;
  duration : any;
  previousCounterValue : any;//= 0;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    public router: Router,
    // private loginService : LoginService,
    private featureService : FeatureService,
    private alertController : AlertController,
    private chooser : Chooser,
    private file:File,
    private fileOpener:FileOpener,
    private transfer : FileTransfer
  ) { 

  }

  ngOnInit() {
    this.initValues();
    
    this.updateItemForm = new FormGroup({
      subject: new FormControl(this.item.subject, Validators.required),
      details: new FormControl(this.item.details),
      voting: new FormControl(this.item.voting),
      votingResult: new FormControl(this.item.votingResult),
      votingMessage: new FormControl(this.item.votingMessage),
      date: new FormControl(this.item.date),
      startDate : new FormControl(this.item.startDate),
      duration : new FormControl(this.duration),
      endDate : new FormControl(this.item.endDate),
    },
    {validators: this.changingNameValidator}
    );
    if(this.item.category == 'event'){
      this.updateItemForm.controls['date'].setValidators(Validators.required);
      this.updateItemForm.controls['startDate'].setValidators(Validators.required);
      this.updateItemForm.controls['duration'].setValidators(counterRangeValidatorMinutes(15, 360));
      this.updateItemForm.controls['endDate'].setValidators(Validators.required);
    }
    this.onValueChanges();

    if(this.item.files){
      if(this.item.files.length > 0){
      //this.getPics(this.item.imagesFullPath);
      //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} ); 
      
      this.files = [{fileName:"" , filePath:"", fileData:"", storagePath : ""}];
      this.item.files.map((res,index)=>{
          let file : Files = {fileName:"",filePath:"", fileData:"", storagePath:""};
          file.fileName = res.fileName;
          file.storagePath = res.storagePath;
          this.files[index] = file;       
      });
      //loading.then(res=>{res.dismiss();});
    }
  } 
  }
  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;

  };

  private onValueChanges(): void {
    this.updateItemForm.get('date').valueChanges.subscribe(newDate=>{      
      console.log("onDateChanges",newDate);
      let today = dayjs().add(30,"minute").format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
      if (today == date){
        this.updateItemForm.get('startDate').setValue(this.today);
        this.minStartDate = dayjs(this.today).format("HH:mm");
        this.updateItemForm.get('endDate').setValue(this.today);
        console.log("minStartDate",this.minStartDate);
      } 
      else {
        let newDateZeroTimeISO = dayjs(newDate).set("hour", 0).set("minute",0).set("second",0).set("millisecond",0).toISOString();
        this.updateItemForm.get('startDate').setValue(newDateZeroTimeISO);
        this.updateItemForm.get('endDate').setValue(newDateZeroTimeISO);
        this.minStartDate = "00:00";
      }
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.updateItemForm.get('startDate').valueChanges.subscribe(newStartDate=>{      
      //console.log("onStartDateChanges",newStartDate);
      this.updateItemForm.get('endDate').setValue(newStartDate);
      //this.previousCounterValue = 0;
      if(this.duration > 0){
        this.calculateEndDate();
      }
    });

    this.updateItemForm.get('duration').valueChanges.subscribe(duration=>{      
      let endDate = this.updateItemForm.get('endDate').value;
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
      this.updateItemForm.get('endDate').setValue(newEndDate);
      this.duration = duration;
      this.previousCounterValue = duration;
    });
  }

  initValues(){
  this.voting = this.item.voting;
  this.today = dayjs().add(30,"minute").toISOString(); 
  //console.log("resetDate", dayjs().toISOString());
  this.minDate = dayjs().add(30,"minute").format('YYYY-MM-DD');
  this.maxDate = dayjs().add(1,"month").toISOString();
  let todayDay = dayjs().add(30,"minute").format('YYYY-MM-DD');
  let dateDay = dayjs(this.item.startDate).format('YYYY-MM-DD');
      if (todayDay == dateDay){
        this.minStartDate = dayjs(this.today).format("HH:mm"); // dayjs(this.item.startDate).add(30,"minute").format('HH:mm');
      } 
      else {
        this.minStartDate = "00:00";
      }
  //console.log("minStartDate",this.minStartDate)
  // this.duration = this.duration;
  this.duration = (this.item.endDateTS - this.item.startDateTS) / 60;
  this.previousCounterValue = this.duration; 
  }

  private calculateEndDate(){
    let endDate = this.updateItemForm.get('endDate').value;
    let endDateTS = dayjs(endDate).unix();
    let newEndDateTS = (endDateTS + ( this.duration * 60 )) * 1000;
    let newEndDate  = dayjs(newEndDateTS).toISOString();
    this.updateItemForm.get('endDate').setValue(newEndDate);
  }
  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }
  votingChanged(ev:any) {
    // console.log(ev);
    this.voting = ev.detail.checked;
  }
  
  dismissModal() {
   this.modalController.dismiss();
  }

  selectFile(){
    this.chooser.getFile("application/pdf")
   .then(file => {
     let fileUpload : Files = {fileData:"",fileName:"",filePath:"", storagePath:""};
     let extention = file.name.slice(file.name.length-4);
     console.log("extention", extention);
     console.log(file ? file.name.slice(0,file.name.length-4) : 'canceled');
     if(extention == ".pdf"){    
     fileUpload.fileData = file.dataURI;
     fileUpload.fileName = file.name.slice(0,file.name.length-4);
     fileUpload.filePath = file.uri;
     console.log("file.uri",file); 
     this.files.push(fileUpload);        
     }
     else{
       this.featureService.presentToast("Only pdf is allowed",2000);
     }
     console.log(this.files);
     console.log("this.files.length",this.files.length);
     }).catch((error: any) => console.error(error));
   }
   
   confirmChanging(index,txtName,btnChange,btnConfirm){
     this.nameChanging.shift();
     console.log(this.nameChanging.length)
     this.updateItemForm.updateValueAndValidity();
     console.log(txtName);
     txtName.disabled = true;
     btnChange.disabled = false;
     btnConfirm.disabled = true;
     this.files[index].fileName = txtName.value;
     //this.item.fileFullPath[index].fileName = txtName.value;
     this.featureService.presentToast("File name changed",2000);
     console.log("files after changing name",this.files);
   }
   changeBtnStatus(txtName,btnChange,btnConfirm){
     txtName.disabled = false;
     btnChange.disabled = true;
     btnConfirm.disabled = false;
     this.nameChanging.push(true);
     console.log(this.nameChanging.length);
     this.updateItemForm.updateValueAndValidity();
   }
  async deleteItem() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Do you want to delete ' + this.item.subject + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.featureService.deleteItem(this.item.files, this.item.id, 'publication')
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['publication/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
  }

  updateItem() {
    if(this.item.category == 'event'){
      this.item.date = this.updateItemForm.get('date').value;
      this.item.dateTS = dayjs(this.updateItemForm.get('date').value).unix();
      this.item.startDate = this.updateItemForm.get('startDate').value;
      this.item.startDateTS = dayjs(this.updateItemForm.get('startDate').value).unix();
      this.item.endDate = this.updateItemForm.get('endDate').value;
      this.item.endDateTS = dayjs(this.updateItemForm.get('endDate').value).unix();
     }
     if(this.item.category == 'announcement'){
      this.item.voting = this.updateItemForm.value.voting;
      this.item.votingMessage = this.updateItemForm.value.votingMessage;
      this.item.votingResult = this.updateItemForm.value.votingResult;
     }
    this.item.subject = this.updateItemForm.value.subject;
    this.item.details = this.updateItemForm.value.details;
    this.item.voting = this.updateItemForm.value.voting;
    this.item.votingResult = this.updateItemForm.value.votingResult;
    const {...itemData} = this.item;

    this.firebaseService.updateItem(itemData,this.files)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }
  deleteFile(index : number){ 
        //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} );
         if(this.files[index].storagePath !== "") {         
         this.featureService.deleteFromStorage(this.files[index].storagePath).then(res=> {
         console.log("before",this.item);
         this.item.files.splice(index,1);
         console.log("after",this.item);
         this.featureService.updateItemWithoutOptions(this.item, 'publication').then(()=> {
          this.files.splice(index,1); 
          this.featureService.presentToast("file removed from storage and DB",2000);}
          ).catch(err=>{console.log("Error in deletePhoto Storage:",err)});  
          }
          ).catch(err => console.log("Error in deletePhoto DB: ",err));
        console.log("files after delete",this.files);
      }
      else{
        this.files.splice(index,1);
      }
      //loading.then(res=>{res.dismiss();})
}
  //END
}
