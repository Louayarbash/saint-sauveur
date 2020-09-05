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
import firebase from 'firebase/app';
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
  @Input() subject: string;
  reviewItemForm: FormGroup;

  canRate : boolean;
  ratingSection : boolean;
  userRating : Observable<Array<any>>;
  // creatorRating : Observable<Array<any>>;
  avgCreatorRating : Observable<any>;
  // responderRating : Observable<Array<any>>;
  avgRespoderRating : Observable<any>;
  loginId : string;
  ratingType : string;
  currentUserId : string = this.loginService.getLoginID();
  currentUserName : string = this.loginService.getLoginName();
  otherUserName : string;
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
      this.canRate = false;
  }

  ngOnInit() {
    console.log("subject",this.subject);
    this.otherUserName = this.item.createdBy == this.currentUserId ? this.item.userInfoResponder.firstname : this.item.userInfoCreator.firstname;
    if((this.item.type == "offer") && (this.subject == "creator")){
      this.ratingType = "dealOfferCreator";  
    }
    else if((this.item.type == "offer") && (this.subject == "responder")){
      this.ratingType = "dealOfferResponder";
    }
    else if((this.item.type == "request") && (this.subject == "creator")){
      this.ratingType = "dealRequestCreator";
    }
    else if((this.item.type == "request") && (this.subject == "responder")){
      this.ratingType = "dealRequestResponder";
    }
    
    this.canRate = this.item.status == "ended" ? true : false;
    //console.log(this.item);
    this.loginId = this.loginService.getLoginID();
    this.reviewItemForm = new FormGroup({
      rate: new FormControl("0", Validators.min(1)),
      review : new FormControl("")
    });

    if(this.loginId == this.item.responseBy){
      console.log("this.ratingSection1", this.ratingSection);
      this.userRating = this.featureService.getUserRating(this.item.createdBy,this.item.type);
      this.avgCreatorRating = this.userRating.pipe(map( arr => { 
        const rating = arr.map(res => {return Number(res.stars)});
        return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'notRatedYet'
      }));

       this.userRating.subscribe((res) => {
        this.ratingSection = res.length ? true : false; 
      })  

    }
    else if(this.loginId == this.item.createdBy && this.item.responseBy){
      console.log("this.ratingSection2", this.ratingSection);
      console.log(this.item.responseBy);
      console.log(this.item.type);
      this.userRating = this.featureService.getUserRating(this.item.responseBy,this.item.type);
      this.avgRespoderRating = this.userRating.pipe(map( arr => { 
        const rating = arr.map(res => {return Number(res.stars)});
        return rating.length ? (rating.reduce((total,val) => total + val ) / arr.length).toFixed(1) : 'notRatedYet'
      }));

      this.userRating.subscribe((res) => {
        console.log("bingo",res);
        this.ratingSection = res.length ? true : false; 
      })  

    }
  }

  dismissModal() {
   this.modalController.dismiss();
  }

  reviewItem() {
    let ratingInfo = new RatingUser();
    ratingInfo.dealType = this.item.type;
    ratingInfo.ratingType = this.ratingType;
    ratingInfo.dealId = this.item.id;
    ratingInfo.userId = this.loginId;
    ratingInfo.review = this.reviewItemForm.value.review;
    ratingInfo.stars = this.reviewItemForm.get('rate').value;
    ratingInfo.createdDate = firebase.firestore.FieldValue.serverTimestamp();

    if(this.loginId == this.item.responseBy){
      ratingInfo.ratedUserId = this.item.createdBy;
      ratingInfo.userFirstname = this.item.userInfoResponder.firstname;
      ratingInfo.userLastname = this.item.userInfoResponder.lastname;
    }
    else if(this.loginId == this.item.createdBy){
      ratingInfo.ratedUserId = this.item.responseBy;
      ratingInfo.userFirstname = this.item.userInfoCreator.firstname;
      ratingInfo.userLastname = this.item.userInfoCreator.lastname;
    }
   
    this.featureService.setUserRating(ratingInfo)
    .then(
      () => {
      this.modalController.dismiss();
      this.featureService.presentToast(this.featureService.translations.RatedSuccessfully,2000);
      }
    ).catch(err => console.log(err));
  }
}