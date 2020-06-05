import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel } from '../firebase-item.model';
//import { Observable } from "rxjs";
//import {PhotosArray} from '../../../type'
import * as dayjs from 'dayjs';
//import { DateService } from '../../../../app/services/date/date.service';
//import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';

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
  @Input() item: ItemModel;
  updateItemForm: FormGroup;

  dateString : string;
  startTimeString : string;
  endTimeString : string;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router
    //private dateService : DateService
    //private _alertController: AlertController,
  ) { 
    
  }

  ngOnInit() {
  /*console.log(this.item.date);
    console.log(this.item.startDate);
    console.log(this.item.endDate); */

    this.dateString = dayjs(this.item.date).format("DD, MMM, YYYY");//this.dateService.timestampToISOString(this.item.date);
    this.startTimeString = dayjs(this.item.startDate).format("HH:mm");
    this.endTimeString = dayjs(this.item.endDate).format("HH:mm");

    this.updateItemForm = new FormGroup({
      date: new FormControl({value: this.dateString, disabled: true}),
      startDate : new FormControl({value: this.startTimeString, disabled: true}),
      endDate : new FormControl({value: this.endTimeString, disabled: true}),
      //NoPlaces : new FormControl({value: "1", disabled: true}),
      note : new FormControl(this.item.note)
    });
  }
  dismissModal() {
   this.modalController.dismiss();
  }

/*   async deleteItem() {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this request?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.firebaseService.deleteItem(this.item)
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['deal/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
  } */

  updateItem() {

    this.item.note = this.updateItemForm.value.note;
    // const { ...itemData} = this.item;
    
    this.firebaseService.updateItem(this.item.id, this.item.note)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }
}
