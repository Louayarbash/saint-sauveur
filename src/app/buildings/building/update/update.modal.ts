import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController , IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
// import dayjs from 'dayjs';
// import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { BuildingModel } from '../building.model';
// import { SelectUserImageModal } from '../select-image/select-user-image.modal';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
// import { AngularFirestore } from "@angular/fire/firestore";
// import { Observable } from "rxjs";
// import { FeatureService } from '../../../services/feature/feature.service';
// import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';
import { Parkings, Services} from '../../../type';

@Component({
  selector: 'app-firebase-update',
  templateUrl: './update.modal.html'
})
export class UpdateBuildingModal implements OnInit {
  @Input() item: BuildingModel;
  updateItemForm: FormGroup;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  nameChanging = [{ naming: false }, { naming: false }, { naming: false }];
  parkings: Parkings[]= [];
  services: Services[]= [];
/*   enableSaleU: boolean;
  enableRentSaleU: boolean;
  enableLostFoundU: boolean; */
  enableTicket= false;
  enableDeal= false;
    customAlertOptions: any = {
    header: this.featureService.translations.SelectTicketType,
    //subHeader: this.featureService.translations.OK,
    //message: this.featureService.translations.YES,
    translucent: true,
    cssClass: 'custom-alert'
  };
  countryList: any[];

  constructor(
    private modalController: ModalController,
    //public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private alertController: AlertController,
    // private camera: Camera,
    //private _angularFireSrore :AngularFirestore,
    //private featureService : FeatureService,
    // private loginService : LoginService,
    // private changeRef: ChangeDetectorRef,
    private featureService: FeatureService,
    // private viewContainerRef: ViewContainerRef
  ) { 
    // this.viewContainerRef.clear();
    
  }

  ngOnInit() {
    this.countryList = this.featureService.getCountryList();
    this.parkings= this.item.parkings.map(item => Object.assign({}, item) )
    this.services= this.item.services.map(item => Object.assign({}, item) )

    this.enableTicket = this.item.enableTicket;
    this.enableDeal = this.item.enableDeal;

    this.updateItemForm = new FormGroup({
      name: new FormControl(this.item.name,Validators.required),
      country: new FormControl(this.item.country,Validators.required),
      city: new FormControl(this.item.city,Validators.required),
      address: new FormControl(this.item.address),
      details: new FormControl(this.item.details),
      postalCode: new FormControl(this.item.postalCode),
      enableSale: new FormControl(this.item.enableSale),
      enableRentSale: new FormControl(this.item.enableRentSale),
      enableLostFound: new FormControl(this.item.enableLostFound),
      enableTicket: new FormControl(this.item.enableTicket),
      enablePublication: new FormControl(this.item.enablePublication),
      enableEvent: new FormControl(this.item.enableEvent),
      enableDeal: new FormControl(this.item.enableDeal),
      status: new FormControl(this.item.status, Validators.required)
    } ,
    {validators: this.changingNameValidator} 
    );

  }

  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {

    return (this.nameChanging.find(item => item.naming == true)) ? { 'nameChanging': true } : null;

  }

  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteItem() {
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.DeletePostConfirmation,
      buttons: [
        {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {}
        },
        {
          text: this.featureService.translations.Yes,
          handler: () => {
            this.firebaseService.deleteItem(this.item.id)
            .then(
              () => {
                this.featureService.presentToast(this.featureService.translations.DeletedSuccessfully,2000);
                this.dismissModal();
                this.router.navigate(['buildings/listing']);
              },
              err => { 
                console.log(err);
                this.featureService.presentToast(this.featureService.translations.DeletingErrors,2000);
               }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  updateItem() {

    this.item.name= this.updateItemForm.value.name
    this.item.country= this.updateItemForm.value.country
    this.item.city= this.updateItemForm.value.city
    this.item.address= this.updateItemForm.value.address
    this.item.postalCode= this.updateItemForm.value.postalCode
    this.item.details = this.updateItemForm.value.details;
    this.item.status = this.updateItemForm.value.status;
    this.item.parkings = this.parkings;
    this.item.services = this.services;
    this.item.enableSale = this.updateItemForm.value.enableSale;
    this.item.enableRentSale = this.updateItemForm.value.enableRentSale;
    this.item.enableLostFound = this.updateItemForm.value.enableLostFound;
    this.item.enableTicket = this.updateItemForm.value.enableTicket;
    this.item.enablePublication = this.updateItemForm.value.enablePublication;
    this.item.enableEvent = this.updateItemForm.value.enableEvent;
    this.item.enableDeal = this.updateItemForm.value.enableDeal;
    // this.item.typeId = this.updateItemForm.value.typeId;
    //console.log(this.item);
    const {isShell, ...itemData} = this.item;
    this.firebaseService.updateItem(itemData)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully, 2000);
      this.modalController.dismiss(); // not needed inside catch
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.UpdatingErrors, 2000);
      console.log(err)
    });

  }

  manageServices(ev: any, services: string) {
    // console.log(ev);
    switch (services) {
/*       case 'sale': this.enableSaleU = ev.detail.checked;
      break;
      case 'lost-found': this.enableLostFoundU = ev.detail.checked;
      break;
      case 'publication': this.enablePublicationU = ev.detail.checked;
      break;
      case 'rent-sale': this.enableRentSaleU = ev.detail.checked;
      break; */
      case 'ticket': this.enableTicket = ev.detail.checked;
      break;
      case 'deal': this.enableDeal = ev.detail.checked;
      break;
      default:
        break;
    }

        
/*     console.log("enableTicketU", this.enableTicket);
    console.log("enableDealU", this.enableDeal);
    console.log("enableTicket", this.item.enableTicket);
    console.log("enableDeal", this.item.enableDeal); */

    if(ev.detail.checked && (services == 'deal' ||  services == 'ticket')) {
      setTimeout(() => {
         this.content.scrollToBottom(400);
      },400); 
    }
  }

  parkingsStatusChanged(ev: any, index: number, txtName, btnChange, btnConfirm){
    this.parkings[index].active = ev.detail.checked;
    if(ev.detail.checked == false){
      this.nameChanging[index] = { naming: false };
      txtName.value = 'P'.concat((index+1).toString());
      txtName.disabled = true;
      btnChange.disabled = false;
      btnConfirm.disabled = true;
      this.parkings[index].description = 'P'.concat((index+1).toString());
      // console.log('parkingsFalse', this.parkings);  
    }
    // this.changeDetectorRef.detectChanges();
    // console.log('parkings', this.parkingsU);
    this.updateItemForm.markAsDirty();
    this.updateItemForm.updateValueAndValidity();
    // console.log(this.nameChanging);
    
  }
  
  serviceStatusChanged(ev: any, index: number) {
    this.services[index].active = ev.detail.checked;
    this.updateItemForm.markAsDirty();
  }

  changeBtnStatus(index, txtName, btnChange, btnConfirm){
    txtName.disabled = false;
    btnChange.disabled = true;
    btnConfirm.disabled = false;
    this.nameChanging[index] = { naming: true };
    // console.log(this.nameChanging);
    this.updateItemForm.updateValueAndValidity();
  }

  confirmChanging(index, txtName, btnChange, btnConfirm){
    if(txtName.value){
      this.nameChanging[index] = { naming: false };
      // console.log(this.nameChanging);
      this.updateItemForm.markAsDirty();
      this.updateItemForm.updateValueAndValidity();
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
