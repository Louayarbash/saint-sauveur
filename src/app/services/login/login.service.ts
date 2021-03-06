import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserModel } from '../../users/user/user.model';
import { BuildingModel } from '../../churchs/church/building.model';
import { AuthService } from '../../auth/auth.service';
import { FeatureService } from '../../services/feature/feature.service';
import { BehaviorSubject } from 'rxjs';
import { AlertController } from '@ionic/angular';
//import { ParkingInfo } from '../../type';
import { Timestamp } from '@google-cloud/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
private userInfo: UserModel = new UserModel();
private userInfoSource = new BehaviorSubject(this.userInfo);
currentUserInfo = this.userInfoSource.asObservable();

private buildingInfo: BuildingModel = new BuildingModel();
private buildingInfoSource = new BehaviorSubject(this.buildingInfo);
currentBuildingInfo = this.buildingInfoSource.asObservable();

  constructor(
    // private afAuth : AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private featureService: FeatureService,
    private alertController: AlertController
    ) {



   }

  isUserLouay(){
    return this.userInfo.email == "louay.arbash@gmail.com" ? true : false; 
  }

  isUserAdmin(){
    return this.getUserRole() == "admin" || this.getUserRole() == "globalAdmin" ? true : false; 
  }

  isUserGlobalAdmin(){
    return this.getUserRole() == "globalAdmin" ? true : false; 
  }
  
  getLoginName(){
    if(this.userInfo.firstname){
      return this.userInfo.firstname;
    }
    else {
      return 'N/A';
    }
  }

  getUserRole(){
    if(this.userInfo.role){
      return this.userInfo.role;
    }
    else {
      return 'user';
    }
  }

  getUserTokens(){
    if(this.userInfo.tokens){
      return this.userInfo.tokens;
    }
    else {
      return null;
    }
  }



  getLoginID(): string{
    if(this.userInfo.id){
      return this.userInfo.id;
    }
    else {
      return 'N/A'
    }
  }

  getLoginEmail(): string{
    if(this.userInfo.email){
      return this.userInfo.email;
    }
    else {
      return 'N/A'
    }
  }

/*   getAuthID(){
    return this.authService.getUserId()
  }
 */


/*   getProExpirationDate(): Timestamp {
    if(this.buildingInfo.proExpirationDate){
      return this.buildingInfo.proExpirationDate
    }
    else {
      return null
    }
  }  
  
  getProFirstExpirationDate(): Timestamp {
    if(this.buildingInfo.proFirstExpirationDate){
      return this.buildingInfo.proFirstExpirationDate
    }
    else {
      return null
    }
  } */

   getBuildingName(): string{
    if(this.buildingInfo.name){
      return this.buildingInfo.name;
    }
    else {
      return null
    }
  } 

  notificationsAllowed(): boolean{
    if(this.userInfo.enableNotifications){
      return this.userInfo.enableNotifications;
    }
    else {
      return false
    }
  }

/*   getBuildingParkings(){
    if(this.buildingInfo.parkings){
      return this.buildingInfo.parkings;
    }
    else {
      return null;
    }
  } */

  updateUserParking(parkings : any){
    this.afs.collection("users").doc(this.getLoginID()).update({parkings : parkings})
  }

  getUserLanguage(){
    if(this.userInfo.language){
      return this.userInfo.language;
    }
    else {
      return 'en';
    }
  }
  
  getBuildingServices(){
    if(this.buildingInfo.services){
      return this.buildingInfo.services;
    }
    else {
      return null
    }
  }



/*   getParkingInfo(userParkings: any[]){
    if(userParkings){
      let parkingInfo: ParkingInfo[] = userParkings.map((userParking) => {     
        let parkingCheck = this.getBuildingParkings().find((buildingParking) => { return buildingParking.id == userParking.id });
          if(parkingCheck){
            return { id: userParking.id, number: userParking.number, description: parkingCheck.description, active: parkingCheck.active };
          }
        });
        parkingInfo= parkingInfo.filter(function (res) {
          return res != null;
      });
      return parkingInfo;
    }
    else return null
  } */

   async initializeApp(uid: string) : Promise<boolean> 
    {
    console.log("initializeApp", uid);
    try {
      
      const user= await this.afs.firestore.collection("users").doc(uid).get({source: 'server'});
      if(!user.data()){
        return false;
      }
      console.log(user.data());
      let userData= user.data() as UserModel;      
      this.userInfo= userData;
      this.userInfo.id= uid;
      
      if(userData.language !== this.featureService.translate.currentLang){
        this.featureService.changeLanguage(userData.language);
      }
      this.featureService.getItem('users', uid).subscribe(async item => {
        this.userInfo= item;
        this.userInfo.id= uid;
        this.userInfoSource.next( this.userInfo ); 
        //this.userInfoSource.next( item ); 
        if(item.language !== this.featureService.translate.currentLang){
          this.featureService.changeLanguage(item.language);
        }

        if(item.status !== 'active'){
          const alert = await this.alertController.create({
            header: this.featureService.translations.StatusInactiveHeader,
            message: this.featureService.translations.StatusInactiveMessage,
            buttons: [
              {
                text: this.featureService.translations.OK,
                handler: ()=> {
                  this.signOut();
                }
              }
            ]
          });
      
          await alert.present();
        }
    });
    this.userInfoSource.next( userData );

      //console.log(this.userInfo.status == 'active';
      //console.log(this.userInfo.status);
      //console.log(this.buildingInfo.status);
      
      return this.userInfo.status == 'active';
    } 
    catch (err) {
      console.log(err);
      return false;
    }
  }

  signOut(){
    this.authService.signOut();
  }
}
