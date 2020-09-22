import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginCredential } from "../../type";
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
//import { FirebaseUserModel } from 'src/app/users/user/firebase-user.model';
import { UserModel } from '../../users/user/user.model';
import { BuildingModel } from '../../buildings/building/building.model';
import { AuthService } from '../../auth/auth.service';
//import { Observable } from 'rxjs';
//import { DocumentSnapshot } from '@google-cloud/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
userInfo: UserModel;
buildingInfo: BuildingModel;
// uid : string;
buildingId: string= "LOxCBCFef7nZm8u0Sg9R";
userId: string= "P1JvaXPwCtbcnK8VIaKQ2fGC5DA3";
languge : string;
firstname : string;
parkings: any;
language: string;
apartment: string;
  constructor(
    private afAuth : AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService
    ) {
      
   }
  login(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const authenticated = this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password).then(res=> { 
        console.log("login function inside then",res.user.uid) 
        return res.user.uid; 
        
      });
      //this._uid = this._angularFireAuth.auth.currentUser.uid;
      // this.getUserInfo();
      return authenticated;
      
  }

  signup(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const created = this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      //this.uid = this.afAuth.currentUser.uid;
      return created;
      
  }
  isUserAdmin(){
    return this.getLoginID() == "Ku6jzqUAjK3iLlXWSfPK" ? true : false; 
  }
  getLoginName(){
    if(this.firstname){
      return this.firstname;
    }
    else {
      return null
    }
  }
  getApaNumber(): string{
    if(this.apartment){
      return this.apartment;
    }
    else {
      return null
    }
  }
  getLoginID(): string{
    if(this.userId){
      return this.userId;
    }
    else {
      return null
    }
  }
  getBuildingId(): string{
    if(this.buildingId){
      return this.buildingId;
    }
    else {
      return null
    }
    
  }

   async getUserParking(){
    
  }

  async getUserInfo(userId: string): Promise<UserModel> {
      try {
      const res= await this.afs.firestore.collection("users").doc(userId).get();
      const userData= res.data() as UserModel;
      this.userId= res.id;
      this.buildingId= userData.buildingId;
      this.languge= userData.language;
      this.firstname= userData.firstname;
      this.parkings= userData.parkings;
      this.apartment= userData.apartment;
      return userData;
      } catch (err) {
      console.log(err);
      }
  }

  getUserInfoObservable(uid: string): Observable<UserModel>{
    
    return this.afs.collection("users").doc<UserModel>(uid).valueChanges();
  
}
getBuildingInfoObservable(buildingId: string): Observable<BuildingModel>{
    
  return this.afs.collection("buildings").doc<BuildingModel>(buildingId).valueChanges();

}
updateUserParking(parkings : any){
  this.afs.collection("users").doc(this.getLoginID()).update({parkings : parkings})
}
getUserInfoObservable5() //: Observable<any>
 {
  return this.afs.collection("users").doc<UserModel>(this.getLoginID()).valueChanges().subscribe((user) => {
    this.buildingId = user.buildingId;
    this.language = user.language;
    this.firstname = user.firstname;
    this.parkings = user.parkings;
 });

} 
/*   getUserLanguage(){
  return this.afs.firestore.collection("users").doc(this.getLoginID()).get();
  }
  setUserLanguage(language){
    return this.afs.collection("users").doc(this.getLoginID()).update({language : language});
  } */
  signOut(){
    this.authService.signOut();
  }
}
