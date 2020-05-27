import { Injectable } from '@angular/core';
import { ToastController,LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore } from '@angular/fire/firestore';
//import { RatingUser } from 'app/deal/item/firebase-item.model';
import { RatingUser } from '../../Deal/item/firebase-item.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  translations;
  userLanguage;
  buildingLevels: any;

  constructor(    
    private toastController : ToastController,
    private loadingController : LoadingController,
    private translate : TranslateService,
    private afs: AngularFirestore
    //private loginService : LoginService
    ) {
    console.log("constructor FeatureService", this.userLanguage);
    }
getTranslationParams(key : string, params : Object)
{
  return this.translate.instant(key,params)
}
async presentLoadingWithOptions(duration) {
  const loading = await this.loadingController.create({
    spinner: "bubbles",
    duration: duration,
    message: this.translations.PleaseWait,
    translucent: true,    
    cssClass: 'custom-class custom-loading'
  });
  await loading.present();
  return loading;
}
async presentToast(message : string, duration : number){
  const toast = await this.toastController.create({
    message : message,
    duration : duration
  });
  await toast.present();  
}
getTranslations() {
  // get translations for this page to use in the Language Chooser Alert
  this.translate.getTranslation(this.translate.currentLang)
  .subscribe((translations) => {
    console.log("inside getTranslationss",translations);
    this.translations = translations;
  });
} 
/* async DownloadAndOpenPDF(item: FirebaseListingItemModel ){
  const options: DocumentViewerOptions = {
    title: 'My PDF'
  }
  let filePath : string;
  await this.firebaseService.afstore.ref(item.fileFullPath[0].filePath).getDownloadURL()
  .toPromise()
  .then((a)=>{  console.log('getDownloadURL',a); filePath = a;}).catch(err=>{console.log('Error:',err); });
  console.log("filePath",filePath);
  //this.document.viewDocument(filePath, 'application/pdf', options);

 //let fakeName = Date.now();
 //this.file.copyFile(filePath,item.fileFullPath[0].fileName+".pdf",this.file.dataDirectory,`${fakeName}.pdf`).then(result => {
 //this.fileOpener.open(result.nativeURL,'application/pdf');
}); 
const fileTransfer = this.transfer.create();
fileTransfer.download(filePath, this.file.dataDirectory + 'file.pdf').then((entry) => {
  console.log('download complete: ' + entry.toURL());
  let url = entry.toURL();
  //this.document.viewDocument(url, 'application/pdf', {});
  this.fileOpener.open(url,'application/pdf');
}, (error) => {
  // handle error
  console.log('error: ' + error);

});

} */
getUserRating(userId : string){
  const ratingRef = this.afs.collection('ratings' , ref => ref.where('ratedUserId', '==', userId).orderBy('createdDate'));
  return ratingRef.valueChanges();
}

setUserRating(ratingInfo : RatingUser)
{
  //const rating = {ratingInfo};
  console.log("rating object",ratingInfo);
  const ratingPath = `ratings/${ratingInfo.dealId}_${ratingInfo.userId}`; //+ Date().toString();
  return this.afs.doc(ratingPath).set({...ratingInfo});
}
/* public getBuildingInfo(buildingId : string): Observable<Array<any>> {
  return this.afs.collection<any>('building' , ref => ref.where('building')).valueChanges({ idField: 'id' });
} */

getItem(tableName : string, itemId: string): Observable<any> {
  //console.log("getItem", itemId);
  return this.afs.doc<any>( tableName + '/' + itemId).valueChanges();
/*  .snapshotChanges()
   .pipe(
    map(a => {
      const postData = a.payload.data();
      const id = a.payload.id;
      return { id, ...postData };
    })
  ); */
}
async getBuildingLevels(){
  if (this.buildingLevels){
    return this.getBuildingLevels
  }
  else{
    //await this.getUserInfo().then(() => {console.log("boo");}).catch((err)=> console.log("connection problem:",err));
  }

}

}