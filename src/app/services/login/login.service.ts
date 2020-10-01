import { Injectable } from '@angular/core';
// import { AngularFireAuth } from '@angular/fire/auth';
// import { Services } from "../../type";
import { AngularFirestore } from '@angular/fire/firestore';
// import { Observable } from 'rxjs';
//import { FirebaseUserModel } from 'src/app/users/user/firebase-user.model';
import { UserModel } from '../../users/user/user.model';
import { BuildingModel } from '../../buildings/building/building.model';
import { AuthService } from '../../auth/auth.service';
//import { Observable } from 'rxjs';
//import { DocumentSnapshot } from '@google-cloud/firestore';
import { FeatureService } from '../../services/feature/feature.service';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
userInfo: UserModel = new UserModel();
buildingInfo: BuildingModel = new BuildingModel();
// uid : string;
/* buildingId: string; //= "LOxCBCFef7nZm8u0Sg9R";
userId: string; //= "P1JvaXPwCtbcnK8VIaKQ2fGC5DA3";
languge : string;
firstname : string;
parkings: any;
language: string;
apartment: string;
buildingName: string;
services: Services[];
buildingStatus: string;
userStatus: string; */

  constructor(
    // private afAuth : AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private featureService: FeatureService
    ) {
      console.log('login service constructor');
   }

  isUserGlobalAdmin(){
    return this.userInfo.email == "louay.arbash@gmail.com" ? true : false; 
  }

  isUserAdmin(){
    return this.getUserRole() == "admin" ? true : false; 
  }
  
  getLoginName(){
    if(this.userInfo.firstname){
      return this.userInfo.firstname;
    }
    else {
      return 'firstNameNull';
    }
  }

  getUserRole(){
    if(this.userInfo.role){
      return this.userInfo.role;
    }
    else {
      return 'roleNull';
    }
  }

  getApaNumber(): string{
    if(this.userInfo.apartment){
      return this.userInfo.apartment;
    }
    else {
      return 'apartmentNull'
    }
  }
  getLoginID(): string{
    if(this.userInfo.id){
      return this.userInfo.id;
    }
    else {
      return 'userIdNull'
    }
  }
  getBuildingId(): string{
    if(this.userInfo.buildingId){
      return this.userInfo.buildingId;
    }
    else {
      return null
    }
  }

  getBuildingParkings(){
    if(this.buildingInfo.parkings){
      return this.buildingInfo.parkings;
    }
    else {
      return null;
    }
  }

  getUserParking(){
    if(this.userInfo.parkings){
      return this.userInfo.parkings;
    }
    else {
      return null;
    }
  }

  updateUserParking(parkings : any){
    this.afs.collection("users").doc(this.getLoginID()).update({parkings : parkings})
  }
  
  getBuildingServices(){
    if(this.buildingInfo.services){
      return this.buildingInfo.services;
    }
    else {
      return null
    }
  }


/*   async getUserInfo(userId: string): Promise<UserModel> {
      try {
      const res= await this.afs.firestore.collection("users").doc(userId).get();
      const userData= res.data() as UserModel;
      this.userInfo.id= res.id;
      this.userInfo.buildingId= userData.buildingId;
      this.userInfo.language= userData.language;
      this.userInfo.firstname= userData.firstname;
      this.userInfo.parkings= userData.parkings;
      this.userInfo.apartment= userData.apartment;
      return userData;
      } catch (err) {
      console.log(err);
      }
  } */

   async initializeApp(uid: string): Promise<boolean> 
    {
    console.log("initializeApp");
    try {
      const user= await this.afs.firestore.collection("users").doc(uid).get();
      console.log(user.data());
      let userData= user.data() as UserModel;
      this.userInfo.id= uid;
      this.userInfo.buildingId= userData.buildingId;
      this.userInfo.language= userData.language? userData.language : 'en';
      this.featureService.changeLanguage(this.userInfo.language);
      this.userInfo.firstname= userData.firstname;
      this.userInfo.parkings= userData.parkings;
      this.userInfo.apartment= userData.apartment;  
      this.userInfo.status= userData.status;
      this.userInfo.email= userData.email;
      this.userInfo.role= userData.role;

      const building= await this.afs.firestore.collection("buildings").doc(this.userInfo.buildingId).get();
      let buildingData= building.data() as BuildingModel;
      this.buildingInfo.name= buildingData.name;
      this.buildingInfo.services= buildingData.services; 
      this.buildingInfo.status= buildingData.status;
      // this.authService.canAccessApp = (this.userStatus == 'active' && this.buildingStatus =='active');
      return  (this.userInfo.status == 'active' && this.buildingInfo.status =='active')
    } 
    catch (err) {
      console.log(err);
    }
  }

  signOut(){
    this.authService.signOut();
  }
}
