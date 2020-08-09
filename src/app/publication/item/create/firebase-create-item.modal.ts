import { Component, OnInit/*,ChangeDetectorRef*/ } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl,ValidatorFn,ValidationErrors } from '@angular/forms';
// import * as dayjs from 'dayjs';
// import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
//import { AngularFirestore } from '@angular/fire/firestore';
// import { Date } from 'core-js';

//import { File } from "@ionic-native/file/ngx";
import { Chooser } from '@ionic-native/chooser/ngx';
import { Files } from '../../../type'
import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
//import { FileOpener } from '@ionic-native/file-opener/ngx';
//import { FilePath } from '@ionic-native/file-path/ngx';
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';


@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})
export class FirebaseCreateItemModal implements OnInit {

  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  files: Files[] = [];
  newName: string = "";
  nameChanging: boolean[] = [];
  voting: boolean;
  categorySelected: string = 'announcement';
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
    //private changeRef: ChangeDetectorRef,
    private chooser: Chooser,
    private loginService : LoginService,
    private featureService : FeatureService
    //private fileOpener : FileOpener,
    //private filePath : FilePath,
    //private file : File
  ) { 
    
  }

  ngOnInit() {
    this.initValues();
    this.createItemForm = new FormGroup({
      subject: new FormControl('',  [
        Validators.required
        // ,Validators.minLength(4)
      ]),
      details : new FormControl(''),
      category: new FormControl('announcement'),
      voting: new FormControl(false),
      votingResult: new FormControl(false),
      votingMessage: new FormControl(''),
      date: new FormControl(this.today),
      startDate : new FormControl(this.today),
      duration : new FormControl(0),
      endDate : new FormControl(this.today),
    },
    {validators: this.changingNameValidator}
    );
    this.onValueChanges();
  }

  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;

  }
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

  }
  initValues(){

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
  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }
  votingChanged(ev:any) {
    // console.log(ev);
    this.voting = ev.detail.checked;
  }

  categoryChanged(ev:any) {
    console.log('categoryChanged', ev.detail.value);
    this.categorySelected = ev.detail.value;
    if(this.categorySelected == 'event'){
      this.createItemForm.controls['date'].setValidators(Validators.required);
      this.createItemForm.controls['startDate'].setValidators(Validators.required);
      this.createItemForm.controls['duration'].setValidators(counterRangeValidatorMinutes(15, 360));
      this.createItemForm.controls['endDate'].setValidators(Validators.required);
    }
    else {
      this.createItemForm.controls['date'].setValidators(null);
      this.createItemForm.controls['startDate'].setValidators(null);
      this.createItemForm.controls['duration'].setValidators(null);
      this.createItemForm.controls['endDate'].setValidators(null);
    }
    this.createItemForm.controls['date'].updateValueAndValidity();
    this.createItemForm.controls['startDate'].updateValueAndValidity();
    this.createItemForm.controls['duration'].updateValueAndValidity();
    this.createItemForm.controls['endDate'].updateValueAndValidity();
  }

  selectFile(){
   this.chooser.getFile("application/pdf")
  .then(file => {
    let fileUpload : Files = {fileData:"",fileName:"",filePath:"",storagePath:""};
    let extention = file.name.slice(file.name.length-4);
    console.log("extention", extention);
    console.log(file ? file.name.slice(0,file.name.length-4) : 'canceled');
    if(extention == ".pdf"){ 
    fileUpload.fileData = file.dataURI;
    fileUpload.fileName = file.name.slice(0,file.name.length-4);
    fileUpload.filePath = file.uri;
    //this.createItemForm.get('name').setValue(file.name.slice(0,file.name.length-4));
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
    this.createItemForm.updateValueAndValidity();
    console.log(txtName);
    txtName.disabled = true;
    btnChange.disabled = false;
    btnConfirm.disabled = true;
    this.files[index].fileName = txtName.value;
    // this.featureService.presentToast("File name changed",2000);
    console.log("files after delete",this.files);    
/*      this.files.forEach( (item, index) => {
      if(item === file) {
        item.fileName = txtName.value
        console.log("files after delete",this.files);
        this.changeRef.detectChanges();
        this.firebaseService.presentToast("File name changed");
      }
    }); */
  }
  changeBtnStatus(txtName,btnChange,btnConfirm){
    txtName.disabled = false;
    btnChange.disabled = true;
    btnConfirm.disabled = false;
    this.nameChanging.push(true);
    console.log(this.nameChanging.length);
    this.createItemForm.updateValueAndValidity();
  }

  deleteFile(index){
    console.log("files",this.files);
    console.log("doc",index);
    this.files.splice(index,1);
    this.featureService.presentToast("File removed",2000);
     /* this.files.forEach( (item, index) => {
      if(item === file) {
         this.files.splice(index,1);
        console.log("files after delete",this.files);
        this.changeRef.detectChanges();
        this.firebaseService.presentToast("File removed");
      }
    }); */
}

   createItem() {
     if(this.categorySelected == 'event'){
      this.itemData.date = this.createItemForm.get('date').value;
      this.itemData.dateTS = dayjs(this.createItemForm.get('date').value).unix();
      this.itemData.startDate = this.createItemForm.get('startDate').value;
      this.itemData.startDateTS = dayjs(this.createItemForm.get('startDate').value).unix();
      this.itemData.endDate = this.createItemForm.get('endDate').value;
      this.itemData.endDateTS = dayjs(this.createItemForm.get('endDate').value).unix();
     }
     if(this.categorySelected == 'announcement'){
      this.itemData.voting = this.createItemForm.value.voting;
      this.itemData.votingMessage = this.createItemForm.value.votingMessage;
      this.itemData.votingResult = this.createItemForm.value.votingResult;
     }
    this.itemData.subject = this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.buildingId = this.loginService.getBuildingId();
    this.itemData.category = this.createItemForm.value.category;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdById = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    this.firebaseService.createItem(this.itemData,this.files)
    .then(res => {
      console.log("createItem then: ",res)
      this.dismissModal();
      this.featureService.presentToast("post added successfully",2000);
      loading.then(res=>res.dismiss());  
    });     
  }

  async dismissModal() {
    await this.modalController.dismiss();
   }
  /*
  // cant open cloud decide not to use it
  async openFile(i : number){
     let uri;
     console.log("PDFs: ",this.files);
     try {
      uri = await this.filePath.resolveNativePath(this.files[i].filePath); // only android
      console.log("uri",uri);
     } catch (err) {
      console.log("error",err)
      this.featureService.presentToast("Error opening file: " + err,2000);
     }
    this.fileOpener.open(uri,'application/pdf')
    .then(() => console.log('File is opened'))
    .catch(e => {this.featureService.presentToast("Error opening file",2000); console.log('Error opening file', e)});
   }
   */
  //END
}