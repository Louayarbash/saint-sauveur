import { Component, Input, OnInit/*,ChangeDetectorRef*/ } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl,ValidatorFn,ValidationErrors } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Files } from '../../../type'
import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
import firebase from 'firebase/app';
import dayjs from 'dayjs';
import { counterRangeValidatorMinutes } from '../../../components/counter-input-minutes/counter-input.component';
import { ReplaySubject } from 'rxjs';
import { NotificationItemModel } from '../../../services/feature/notification-item.model';   

@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html'
})
export class FirebaseCreateItemModal implements OnInit {
  @Input() segmentValue: string;
  @Input() segmentValueSubject: ReplaySubject<string>;
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  itemDataNotif: NotificationItemModel= new NotificationItemModel();
  files: Files[] = [];
  newName: string = "";
  nameChanging: boolean[] = [];
  today : any;
  minDate : any;
  maxDate : any;
  startDate : any;
  endDate : any;
  minStartDate : any;
  duration : any;
  previousCounterValue : any;//= 0;
  disableSubmit: boolean;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private chooser: Chooser,
    private loginService : LoginService,
    private featureService : FeatureService
  ) { 
  }

  ngOnInit() {
    this.disableSubmit= false;
    this.initValues();
    this.createItemForm = new FormGroup({
      subject: new FormControl('',  [
        Validators.required
        // ,Validators.minLength(4)
      ]),
      details : new FormControl(''),
      date: new FormControl(this.today, Validators.required),
      startDate : new FormControl(this.today, this.startDateValidator),
      duration : new FormControl(0, counterRangeValidatorMinutes(15, 360)),
      endDate : new FormControl(this.today, Validators.required)
    },
    {
      validators: this.changingNameValidator
    }
    );
    this.onValueChanges();
  }

  

  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;

  }

  startDateValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    return (dayjs(control.value).unix() < dayjs(this.today).unix()) ? { 'wrongStartDate': true } : null;
  }

  private onValueChanges(): void {
    this.createItemForm.get('date').valueChanges.subscribe(newDate=>{      
      console.log("onDateChanges",newDate);
      let today = dayjs().format('YYYY-MM-DD');
      let date = dayjs(newDate).format('YYYY-MM-DD');
      if (today == date) {
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
        console.log("minStartDate",this.minStartDate);
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

  }

  initValues(){
  this.today = dayjs().toISOString(); 
  this.minDate = dayjs().format('YYYY-MM-DD');
  this.maxDate = dayjs().add(1,"month").toISOString();
  this.minStartDate = dayjs().format('HH:mm');
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
      this.featureService.presentToast(this.featureService.translations.OnlyPDfAllowed,2000);
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
    // this.featureService.presentToast("File removed",2000);
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
    this.disableSubmit= true;
    this.itemData.date = this.createItemForm.get('date').value;
    this.itemData.dateTS = dayjs(this.createItemForm.get('date').value).unix();
    this.itemData.startDate = this.createItemForm.get('startDate').value;
    this.itemData.startDateTS = dayjs(this.createItemForm.get('startDate').value).unix();
    this.itemData.endDate = this.createItemForm.get('endDate').value;
    this.itemData.endDateTS = dayjs(this.createItemForm.get('endDate').value).unix();
    this.itemData.subject = this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.buildingId = this.loginService.getBuildingId();

    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    const {isShell, ...itemData} = this.itemData;

    this.itemDataNotif.buildingId= this.loginService.getBuildingId();
    this.itemDataNotif.type= "events" 
    this.itemDataNotif.action= "new"
    this.itemDataNotif.status= "active"
    this.itemDataNotif.creatorName= this.loginService.getLoginName();
    this.itemDataNotif.createDate= this.itemData.createDate;
    this.itemDataNotif.createdBy= this.itemData.createdBy;

    this.firebaseService.createItem(itemData,this.files)
    .then(() => {
      this.featureService.createItem("notifications",this.itemDataNotif)
      this.segmentValueSubject.next('upcoming');
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.disableSubmit= false;
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      loading.then(res=>res.dismiss());  
      console.log(err);
     });          
  }

  dismissModal() {
     this.modalController.dismiss();
   }
}