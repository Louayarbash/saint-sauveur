import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginCredential } from "../../type";
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
//import { FirebaseUserModel } from 'src/app/users/user/firebase-user.model';
import { FirebaseUserModel } from '../../users/user/firebase-user.model';
//import { Observable } from 'rxjs';
//import { DocumentSnapshot } from '@google-cloud/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

uid : string;
buildingId: string = 'NJ6u68Cq68RgX9jXPuVx';
languge : string;
firstname : string;
parking: any;
  language: string;
  constructor(
    private afAuth : AngularFireAuth,
    private afs: AngularFirestore
    ) {
   }
  login(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const authenticated = this.afAuth.signInWithEmailAndPassword(credentials.email, credentials.password).then(res=> { 
        console.log("login function inside then",res.user.uid) 
        return res.user.uid; 
        
      });
      console.log("login function",this.uid);
      //this._uid = this._angularFireAuth.auth.currentUser.uid;
      this.getUserInfo();
      return authenticated;
      
  }
  signup(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const created = this.afAuth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      //this.uid = this.afAuth.currentUser.uid;
      console.log(this.uid);
      return created;
      
  }
  getLoginName(){
    return "Louay";
  }
  getLoginID(){
/*     if(!this.uid){
      this.uid = "Ku6jzqUAjK3iLlXWSfPK"//UtU9xz7umeuro52XTMhz;this.afAuth.auth.currentUser.uid;
    } */
    return "Ku6jzqUAjK3iLlXWSfPK";//this.uid
  }
  getBuildingId(){
    return "NJ6u68Cq68RgX9jXPuVx";
  }

   async getUserParking(){
/*      if(this.parking){
      return this.parking;
    }
    else{  */
      await this.getUserInfo().then(() => {console.log("boo");}).catch((err)=> console.log("connection problem:",err));
//     }
    
  }

  async getUserInfo(){
      console.log("inside getLoginInfo 111")
      try {
      const res = await this.afs.firestore.collection("users").doc(this.getLoginID()).get();
      console.log("hello",res.data());
      this.buildingId = res.data().building;
      this.languge = res.data().language;
      this.firstname = res.data().firstname;
      this.parking = res.data().parking;
      console.log("inside getLoginInfo 222", this.parking);
      } catch (err) {
      console.log(err);
      }
  }

   getUserInfoObservable() : Observable<any> {
    
    return this.afs.collection("users").doc(this.getLoginID()).valueChanges();
  
}
updateUserParking(parking : any){
  this.afs.collection("users").doc(this.getLoginID()).update({parking : parking})
}
getUserInfoObservable5() //: Observable<any>
 {
  return this.afs.collection("users").doc<FirebaseUserModel>(this.getLoginID()).valueChanges().subscribe((user) => {
    console.log("BINGOOO",user);
  this.buildingId = user.building;
  this.language = user.language;
  this.firstname = user.firstname;
  this.parking = user.parking; 
  console.log(this.buildingId);
  console.log(this.language);
  console.log(this.firstname);
  console.log(this.parking);
  //return this.parking;
 });

} 
  getUserLanguage(){
    //return "fr";
  return this.afs.firestore.collection("users").doc(this.getLoginID()).get();
  }
  setUserLanguage(language){
    return this.afs.collection("users").doc(this.getLoginID()).update({language : language});
  }
}
