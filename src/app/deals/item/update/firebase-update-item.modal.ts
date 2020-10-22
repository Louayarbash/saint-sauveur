import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { ItemModel } from '../firebase-item.model';
import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html'
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
    public router: Router,
    private featureService: FeatureService
  ) { 
  }

  ngOnInit() {
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

  updateItem() {

    this.item.note = this.updateItemForm.value.note;
    // const { ...itemData} = this.item;
    
    this.firebaseService.updateItem(this.item.id, this.item.note)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully,2000);
      this.modalController.dismiss();
    },
      err => console.log(err)
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.UpdatingErrors,2000);
      console.log(err)
    });
  }
}
