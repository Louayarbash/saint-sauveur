import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, AlertController , IonContent } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
// import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';
import { FirebaseService } from '../../firebase-integration.service';
import { TicketModel } from '../ticket.model';
// import { SelectUserImageModal } from '../select-image/select-user-image.modal';
// import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
// import { AngularFirestore } from "@angular/fire/firestore";
// import { Observable } from "rxjs";
// import { FeatureService } from '../../../services/feature/feature.service';
// import { LoginService } from '../../../services/login/login.service';
import { FeatureService } from '../../../services/feature/feature.service';

@Component({
  selector: 'app-firebase-update-ticket',
  templateUrl: './update-ticket.modal.html'
})
export class UpdateTicketModal implements OnInit {
  @Input() item: TicketModel;
  updateItemForm: FormGroup;
  ticketTypes = [];
  typeId: number;
  @ViewChild(IonContent, {static:true}) content: IonContent;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  bookingSection = false;


  constructor(
    private modalController: ModalController,
    //public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private alertController: AlertController,
    // private camera: Camera,
    // private _angularFireSrore :AngularFirestore,
    // private featureService : FeatureService,
    // private loginService : LoginService,
    // private changeRef: ChangeDetectorRef,
    private featureService: FeatureService
  ) { 

  }

  ngOnInit() {
    
    this.date = dayjs(this.item.date * 1000).format("DD, MMM, YYYY");
    this.endDate = dayjs(this.item.endDate * 1000).format("DD, MMM, YYYY");
    this.startTime = dayjs(this.item.startDate * 1000).format("HH:mm");
    this.endTime = dayjs(this.item.endDate * 1000).format('HH:mm');
    this.bookingSection = this.item.subject == 'ElevatorBooking' ? true : false;
    this.updateItemForm = new FormGroup({
      details: new FormControl(this.item.details),
      status: new FormControl(this.item.status,Validators.required)
    }/* ,
    {validators: this.parkingValidator} */
    );

    if (this.item.subject == 'ElevatorBooking') {
      this.updateItemForm.controls['details'].setValidators(null);
      this.updateItemForm.controls['details'].updateValueAndValidity();
    }   
    else {
      this.updateItemForm.controls['details'].setValidators(Validators.required);
      this.updateItemForm.controls['details'].updateValueAndValidity();
    }
    
/* 
    this.featureService.getItem('building', this.loginService.getBuildingId()).subscribe(item => {
      this.ticketTypes = item.ticketTypes;
      const types = item.ticketTypes;
      console.log(types);
        if (this.item.typeId) {
            let typeCheck = types.find( (type: { id: number; }) => type.id === this.item.typeId );
            if(typeCheck){
              this.typeId = typeCheck.id;
              this.updateItemForm.controls['typeId'].setValue(this.typeId);
            }
            else {
              this.typeId = 1000;
            }
        }   

   
    }); */


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
                this.router.navigate(['tickets/listing']);
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

    // this.item.subject = this.updateItemForm.value.subject;
    this.item.details = this.updateItemForm.value.details;
    this.item.status = this.updateItemForm.value.status;
    // this.item.typeId = this.updateItemForm.value.typeId;
    //console.log(this.item);
    this.firebaseService.updateItem(this.item)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully, 2000);
      this.modalController.dismiss(); // not needed inside catch
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.UpdatingErrors, 2000);
      console.log(err)
    });

  }
 
}
