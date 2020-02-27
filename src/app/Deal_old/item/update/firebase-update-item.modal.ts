import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

//import * as dayjs from 'dayjs';

//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
//import { Observable } from "rxjs";
//import {PhotosArray} from '../../../type'
import * as dayjs from 'dayjs';
import { DateService } from '../../../../app/services/date/date.service';
import { counterRangeValidator } from '../../../components/counter-input/counter-input.component';

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
  satrtTime :string;
  endTime :string;
  minDate = new Date().toISOString().slice(0,10);
  maxYear = new Date().getFullYear();
  updateItemForm: FormGroup;
  startTimeString : string;
  endTimeString : string;
  dateTimeString : string;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private dateService : DateService
    //private _alertController: AlertController,
  ) { 
    
  }

  ngOnInit() {

    console.log(this.item.date);
    console.log(this.item.startDate);
    console.log(this.item.endDate);

    this.dateTimeString = this.item.date;//this.dateService.timestampToISOString(this.item.date);

    this.startTimeString = this.item.startDate;//this.dateService.timestampToISOString(this.item.startTime);

    this.endTimeString = this.item.endDate;//this.dateService.timestampToISOString(this.item.endTime);

/*     console.log(this.dateTimeString);
    console.log(this.startTimeString);
    console.log(this.endTimeString); */

    this.updateItemForm = new FormGroup({
      date: new FormControl(this.item.date, Validators.required),
      startTime: new FormControl(this.item.startDate, Validators.required ),
      endTime: new FormControl(this.item.endDate, Validators.required),
      count : new FormControl(this.item.count,counterRangeValidator(1, 5)),
      note: new FormControl(this.item.note)
    });

    //this.item.startTime = this.item.startTime * 1000;
    //var timestamp = +this.item.startTime;
/* this.satrtTime = new Date(timestamp * 1000).getDate().toString();
let startTime = new Date(timestamp * 1000);
let currentDate2 = startTime.getDate();
let currentMonth2 = startTime.getMonth()+1
let currentYear2 = startTime.getFullYear()
let currentHour2 = startTime.getHours();
let currentMinute2 = startTime.getMinutes();
let dateFormat2 = currentDate2 + " " + currentMonth2 + " " + currentYear2+ " " + currentHour2+ " " +  currentMinute2;
this.satrtTime = dateFormat2; */
/*
       skills: new FormArray([], CheckboxCheckedValidator.minSelectedCheckboxes(1)),
      spanish: new FormControl(this.user.languages.spanish),
      english: new FormControl(this.user.languages.english),
      french: new FormControl(this.user.languages.french)   
   this.firebaseService.getSkills().subscribe(skills => {
      this.skills = skills;
      // create skill checkboxes
      this.skills.map((skill) => {
        let userSkillsIds = [];
        if (this.user.skills) {
          userSkillsIds = this.user.skills.map(function(skillId) {
            return skillId['id'];
          });
        }
        // set the control value to 'true' if the user already has this skill
        const control = new FormControl(userSkillsIds.includes(skill.id));
        (this.updateUserForm.controls.skills as FormArray).push(control);
      });
    }); */
  }

  /*get skillsFormArray() { return <FormArray>this.updateUserForm.get('skills'); }

  changeLangValue(value): string {
    switch (true) {
      case (value <= 3 ):
        return 'Novice';
      case (value > 3 && value <= 6 ):
        return 'Competent';
      case (value > 6 ):
        return 'Expert';
    }
  }*/
  dismissModal() {
   this.modalController.dismiss();
  }

  async deleteItem() {
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
  }

  updateItem() {

/*     let getDate = new Date(this.updateItemForm.value.date);
    let getMonth = getDate.getMonth();
    let getDay = getDate.getDate();
    let getYear = getDate.getFullYear();

    let getStartTime = new Date(this.updateItemForm.value.startTime);
    getStartTime.setFullYear(getYear);
    getStartTime.setDate(getDay);
    getStartTime.setMonth(getMonth);

    let getEndTime = new Date(this.updateItemForm.value.endTime);
    getEndTime.setFullYear(getYear);
    getEndTime.setDate(getDay);
    getEndTime.setMonth(getMonth);
     */
    //this.item.coverPhoto = this.selectedPhoto;
    this.item.date = this.updateItemForm.value.date;//dayjs(getDate).unix();
    this.item.startDate =this.updateItemForm.value.startTime;// dayjs(getStartTime).unix();
    this.item.endDate = this.updateItemForm.value.endTime;//dayjs(getEndTime).unix();
    this.item.count = this.updateItemForm.value.count;
    this.item.note = this.updateItemForm.value.note;
    
    //dayjs(this.updateUserForm.value.birthdate).unix(); // save it in timestamp

/*     this.user.languages.spanish = this.updateUserForm.value.spanish;
    this.user.languages.english = this.updateUserForm.value.english;
    this.user.languages.french = this.updateUserForm.value.french; */

    // get the ids of the selected skills
    //const selectedSkills = [];

    /* this.updateUserForm.value.skills
    .map((value: any, index: number) => {
      if (value) {
        selectedSkills.push(this.skills[index].id);
      }
    }); */
    //this.user.skills = selectedSkills;

    const {/*age,*/ ...itemData} = this.item; // we don't want to save the age in the DB because is something that changes over time

    this.firebaseService.updateItem(itemData)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }

/*   async changeUserImage() {
    const modal = await this.modalController.create({
      component: SelectItemImageModal
    });

    modal.onDidDismiss().then(avatar => {
      if (avatar.data != null) {
        this.selectedPhoto = avatar.data.link;
      }
    });
    await modal.present();
  } */
  //LA_2019_11

/*   getPic(picId): Observable<string>{
    const ref = this.firebaseService.afstore.ref(picId);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    return this.profileUrl = ref.getDownloadURL();
  } */
/*   getPics(imagesFullPath){
    this.postImages = [{isCover:false,photo:"",photoStoragePath:""}];
    for (let index = 0; index < imagesFullPath.length; index++) {
     this.firebaseService.afstore.ref(imagesFullPath[index]).getDownloadURL().toPromise().then(DownloadURL => { 
       let photos : PhotosArray = {isCover:false,photo:"",photoStoragePath:""};
       photos.isCover = false;
       photos.photo = DownloadURL;
       photos.photoStoragePath = imagesFullPath[index];
       this.postImages[index] = photos;
       if(imagesFullPath[index] === this.item.coverPhoto){
       this.postImages[index].isCover = true;
       }
      } );
    }
    console.log('photoSlider',this.postImages);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  } */
  //END
}
