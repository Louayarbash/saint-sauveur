import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
// import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { BuildingModel } from '../building.model';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { Parkings, Services} from '../../../type';
// import { Crop, CropOptions } from '@ionic-native/crop/ngx';
// import { File } from '@ionic-native/file/ngx';
import firebase from 'firebase/app';

@Component({
  selector: 'app-create-building',
  templateUrl: './create.modal.html'
})
export class CreateBuildingModal implements OnInit {

  createItemForm: FormGroup;
  itemData: BuildingModel = new BuildingModel();
  parkings: Parkings[];
  services: Services[];
  enableTicket= true;
  enableDeal= true;
  nameChanging = [{ naming: false }, { naming: false }, { naming: false }];
  @ViewChild(IonContent, {static:true}) content: IonContent;
  customAlertOptions: any = {
    header: this.featureService.translations.SelectTicketType,
    //subHeader: this.featureService.translations.OK,
    //message: this.featureService.translations.YES,
    translucent: true,
    cssClass: 'custom-alert'
  };
  countryList: any[];
  disableSubmit: boolean;
  
  constructor(
    // private changeDetectorRef: ChangeDetectorRef,
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private featureService: FeatureService,
    private loginService: LoginService
  
  ) { 
  }

  ngOnInit() {
    this.disableSubmit= false;
    this.countryList = this.featureService.getCountryList();
    this.parkings= [{id: '1', description: 'P1', note: '', active: true}, {id: '2', description: 'P2', note: '', active: true}, {id: '3', description: 'P3', note: '', active: true}];
    this.services= [{id: '1', description: 'ElevatorBooking', active: true}, {id: '2', description: 'NewKeyRequest', active: true}];
    
    this.createItemForm = new FormGroup({
      name: new FormControl('',Validators.required),
      country: new FormControl('',Validators.required),
      city: new FormControl('',Validators.required),
      address: new FormControl(''),
      details: new FormControl(''),
      postalCode: new FormControl(''),
      parkings: new FormControl(''),
      services: new FormControl(''),
      enableSale: new FormControl(true),
      enableRentSale: new FormControl(true),
      enableLostFound: new FormControl(true),
      enableTicket: new FormControl(true),
      enablePublication: new FormControl(true),
      enableEvent: new FormControl(true),
      enableDeal: new FormControl(true),
      status: new FormControl('active',Validators.required)
    } ,
    {validators: this.changingNameValidator} 
    );
  }

  
  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    // console.log("dddd", this.nameChanging.find(item => item.naming == true));
    // console.log("aaaa", this.nameChanging);
    return (this.nameChanging.find(item => item.naming == true)) ? { 'nameChanging': true } : null;

  }

  dismissModal() {
   this.modalController.dismiss();
  }

  createBuilding() {
    this.disableSubmit= true;
    this.itemData.name= this.createItemForm.value.name
    this.itemData.country= this.createItemForm.value.country
    this.itemData.city= this.createItemForm.value.city
    this.itemData.address= this.createItemForm.value.address
    this.itemData.postalCode= this.createItemForm.value.postalCode
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.status = this.createItemForm.value.status;
    this.itemData.parkings = this.parkings;
    this.itemData.services = this.services;
    this.itemData.enableSale = this.createItemForm.value.enableSale;
    this.itemData.enableRentSale = this.createItemForm.value.enableRentSale;
    this.itemData.enableLostFound = this.createItemForm.value.enableLostFound;
    this.itemData.enableTicket = this.createItemForm.value.enableTicket;
    this.itemData.enablePublication = this.createItemForm.value.enablePublication;
    this.itemData.enablePublication = this.createItemForm.value.enableEvent;
    this.itemData.enableDeal = this.createItemForm.value.enableDeal;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdBy = this.loginService.getLoginID();
    const {isShell, ...itemData} = this.itemData;
    const loading = this.featureService.presentLoadingWithOptions(5000);
    this.firebaseService.createItem(itemData)
    .then(() => {
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

  manageServices(ev:any, services: string) {
    // console.log(ev);
    switch (services) {
/*       case 'sale': this.enableSale = ev.detail.checked;
      break;
      case 'lost-found': this.enableLostFound = ev.detail.checked;
      break;
      case 'publication': this.enablePublication = ev.detail.checked;
      break;
      case 'rent-sale': this.enableRentSale = ev.detail.checked;
      break; */
      case 'ticket': this.enableTicket = ev.detail.checked;
      break;
      case 'deal': this.enableDeal = ev.detail.checked;
      break;
      default:
        break;
    }
    if(ev.detail.checked && (services == 'deal' ||  services == 'ticket')) {
    setTimeout(() => {
      this.content.scrollToBottom(400);
    },400); 
  }
  }

  parkingsStatusChanged(ev:any, index: number, txtName, btnChange, btnConfirm) {
    this.parkings[index].active = ev.detail.checked;
    if(ev.detail.checked == false){
      this.nameChanging[index] = { naming: false };
      // txtName.value = 'P'.concat((index+1).toString());
      txtName.disabled = true;
      btnChange.disabled = false;
      btnConfirm.disabled = true;
      this.parkings[index].description = 'P'.concat((index+1).toString());
      // console.log('parkingsFalse', this.parkings);  
    }
    // this.changeDetectorRef.detectChanges();
    console.log('parkings', this.parkings);
    this.createItemForm.updateValueAndValidity();
    console.log(this.nameChanging);
    
  }
  
  serviceStatusChanged(ev:any, index: number) {
    this.services[index].active = ev.detail.checked;
  }

  changeBtnStatus(index, txtName, btnChange, btnConfirm){
    txtName.disabled = false;
    btnChange.disabled = true;
    btnConfirm.disabled = false;
    this.nameChanging[index] = { naming: true };
    console.log(this.nameChanging);
    this.createItemForm.updateValueAndValidity();
  }

  confirmChanging(index, txtName, btnChange, btnConfirm){
    if(txtName.value){
    this.nameChanging[index] = { naming: false };
    console.log(this.nameChanging);
    this.createItemForm.updateValueAndValidity();
    // console.log(txtName);
    txtName.disabled = true;
    btnChange.disabled = false;
    btnConfirm.disabled = true;
    this.parkings[index].description = txtName.value;
  }
  else {
    this.featureService.presentToast(this.featureService.translations.EnterValidParkingLabel, 2000);
  }
  }

}
