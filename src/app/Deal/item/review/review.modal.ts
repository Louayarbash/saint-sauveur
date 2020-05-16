import { Component, OnInit, Input,ChangeDetectorRef } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { combinedItemModel, RatingUser } from '../firebase-item.model';
//import * as dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import  * as firebase from 'firebase/app';
//import { RatingUser } from "../../../type";

@Component({
  selector: 'app-firebase-review-item',
  templateUrl: './review.modal.html',
  styleUrls: [
    './styles/review.modal.scss',
    './styles/review.shell.scss'
  ],
})
export class ReviewModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: combinedItemModel;
  reviewItemForm: FormGroup;

  ratingSection : boolean;
  creatorRating : Observable<Array<any>>;
  avgCreatorRating : Observable<any>;
  respoderRating : Observable<Array<any>>;
  avgRespoderRating : Observable<any>;
  loginId : string;
  //review : string;

  constructor(
    private modalController: ModalController,
    public alertController: AlertController,
    public firebaseService: FirebaseService,
    public router: Router,
    private featureService : FeatureService,
    private loginService : LoginService  
    ) { 
      this.ratingSection = false;
  }

  ngOnInit() {
    //console.log(this.item);
    this.loginId = this.loginService.getLoginID();
    this.reviewItemForm = new FormGroup({
      rate: new FormControl("0", Validators.min(1)),
      review : new FormControl("")
    });

    if(this.loginId == this.item.responseBy){
      //console.log("this.ratingSection1", this.ratingSection);
      this.creatorRating = this.featureService.getUserRating(this.item.createdBy);
      this.avgCreatorRating = this.creatorRating.pipe(map( arr => { 
        const rating = arr.map(res => {return Number(res.stars)});
        return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'notRatedYet'
      }));

       this.creatorRating.subscribe((res) => {
        this.ratingSection = res.length ? true : false; 
      })  

    }
    else if(this.loginId == this.item.createdBy && this.item.responseBy){
      console.log("this.ratingSection2", this.ratingSection);
      this.respoderRating = this.featureService.getUserRating(this.item.responseBy);
      this.avgRespoderRating = this.respoderRating.pipe(map( arr => { 
        const rating = arr.map(res => {return Number(res.stars)});
        return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'notRatedYet'
      }));

      this.respoderRating.subscribe((res) => {
        this.ratingSection = res.length ? true : false; 
      })  

    }
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  reviewItem() {
    let ratingInfo = new RatingUser();
    console.log("ratingInfo",ratingInfo);
    ratingInfo.dealId = this.item.id;
    ratingInfo.userId = this.loginId;
    ratingInfo.review = this.reviewItemForm.value.review;
    ratingInfo.stars = this.reviewItemForm.get('rate').value;
    ratingInfo.createdDate = firebase.firestore.FieldValue.serverTimestamp();

    if(this.loginId == this.item.responseBy){
      ratingInfo.ratedUserId = this.item.createdBy;
      ratingInfo.userName = this.item.userInfoResp.name;
    }
    else if(this.loginId == this.item.createdBy){
      ratingInfo.ratedUserId = this.item.responseBy;
      ratingInfo.userName = this.item.userInfoRequ.name;
    }
    
    console.log("item", this.item)
    console.log("ratingInfo", ratingInfo)
   
    this.featureService.setUserRating(ratingInfo)
    .then(
      () => {
      this.modalController.dismiss();
      this.featureService.presentToast("Rating successfully..",2000);
      }
    ).catch(err => console.log(err));
  }
}