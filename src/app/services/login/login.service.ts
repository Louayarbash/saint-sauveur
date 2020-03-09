import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoginCredential } from "../../type";
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DocumentSnapshot } from '@google-cloud/firestore';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
public _uid : string;
  constructor(
    private _angularFireAuth : AngularFireAuth,
    private afs: AngularFirestore
    ) {
    //this._uid = _angularFireAuth.auth.currentUser.uid;
    console.log(this._uid);
   }
  login(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const authenticated = this._angularFireAuth.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
      this._uid = this._angularFireAuth.auth.currentUser.uid;
      console.log(this._uid);
      return authenticated;
      
  }
  signup(credentials: LoginCredential/*name: string, password: string*/):Promise<any>
  {
      const created = this._angularFireAuth.auth.createUserWithEmailAndPassword(credentials.email, credentials.password);
      this._uid = this._angularFireAuth.auth.currentUser.uid;
      console.log(this._uid);
      return created;
      
  }
  getLoginID() : string{
    //console.log("get login id" , { aaa: this._angularFireAuth.auth.currentUser.uid, bbb  : this._uid});
    return "5MHn6X5lnOUDaYRH5oyvKrAtYbA3";//this._angularFireAuth.auth.currentUser.uid;
  }
  getUserInfo(){
    return this.afs.collection("users").doc(this.getLoginID()).snapshotChanges().toPromise();
  }
  getUserLanguage(){
    //return "fr";
    return this.afs.firestore.collection("users").doc(this.getLoginID()).get();
  }
  setUserLanguage(language){
    return this.afs.collection("users").doc(this.getLoginID()).update({language : language});
  }
}
