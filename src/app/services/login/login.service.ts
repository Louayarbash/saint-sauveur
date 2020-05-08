import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginCredential } from "../../type";
import { AngularFirestore } from '@angular/fire/firestore';
//import { Observable } from 'rxjs';
//import { DocumentSnapshot } from '@google-cloud/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

uid : string;
buildingId : string = "NJ6u68Cq68RgX9jXPuVx";
languge : string;
name : string;
  constructor(
    private afAuth : AngularFireAuth,
    private afs: AngularFirestore
    ) {
   }
  login(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const authenticated = this.afAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password).then(res=> { 
        console.log("login function inside then",res.user.uid) 
        return res.user.uid; 
        
      });
      console.log("login function",this.uid);
      //this._uid = this._angularFireAuth.auth.currentUser.uid;
      
      return authenticated;
      
  }
  signup(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const created = this.afAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      this.uid = this.afAuth.auth.currentUser.uid;
      console.log(this.uid);
      return created;
      
  }
  getLoginID(){
    if(!this.uid){
      this.uid = "QU1WaWtJoTch9NecQspR";//this.afAuth.auth.currentUser.uid;
    }
    return "QU1WaWtJoTch9NecQspR";//this.uid
  }
  async getUserInfo(){
      console.log("inside getLoginInfo 111")
      try {
      const res = await this.afs.firestore.collection("users").doc(this.uid).get();
      this.buildingId = res.data().buildingId;
      this.languge = res.data().language;
      this.name = res.data().name;
      console.log("inside getLoginInfo 222", this.buildingId);
    }
    catch (err) {
      console.log(err);
    }
  }
  
  getUserLanguage(){
    //return "fr";
  return this.afs.firestore.collection("users").doc(this.getLoginID()).get();
  }
  setUserLanguage(language){
    return this.afs.collection("users").doc(this.getLoginID()).update({language : language});
  }
}
