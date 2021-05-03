import { Injectable } from '@angular/core';
import { ToastController,LoadingController, ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { RatingUser } from '../../deals/item/firebase-item.model';
import { VotingPublication } from '../../publications/item/firebase-item.model';
import { Observable } from 'rxjs';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Images} from '../../type';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { ImagePickerOptions, ImagePicker } from '@ionic-native/image-picker/ngx';
import { File } from "@ionic-native/file/ngx";
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LanguageService } from '../../language/language.service';
import { first } from 'rxjs/operators';
import { Crop, CropOptions } from '@ionic-native/crop/ngx';
import { Plugins } from '@capacitor/core';

const { Filesystem } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  translations: any;
  userLanguage: any;
  buildingLevels: any;
  availableLanguages = [];
  // parking: Parkings[] =[{id: '1', description: 'P1', note: '', active: true}, {id: '2', description: 'P2', note: '', active: true}, {id: '3', description: 'P3', note: '', active: true}];
  // services: Services[]= [{id: '1', description: 'ElevatorBooking', active: true}, {id: '2', description: 'NewKeyRequest', active: true}];


  constructor(    
    private toastController : ToastController,
    private loadingController : LoadingController,
    public translate : TranslateService,
    private afs: AngularFirestore,
    public afstore : AngularFireStorage,
    public emailComposer: EmailComposer,
    private camera: Camera,  
    private actionSheetController : ActionSheetController,
    private imagePicker : ImagePicker,
    private file: File,
    private http: HttpClient,
    private alertController: AlertController,
    public languageService : LanguageService,
    private crop: Crop
    // private Transporter: Transporter
    //private loginService : LoginService
    ) {
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

getTranslations(lang: any) {
  // get translations for this page to use in the Language Chooser Alert
/*   this.translate.getTranslation(lang)
  .subscribe((translations) => { */
    // console.log("inside getTranslationss",translations);
    this.translations = lang.translations;
  // });
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

/* async getBuildingLevels(){
  if (this.buildingLevels){
    return this.getBuildingLevels;
  }
  else{
    // await this.getUserInfo().then(() => {console.log("boo");}).catch((err)=> console.log("connection problem:",err));
  }

} */
sendEmail(email : any){
  return this.emailComposer.open(email);
}

// images operations

async selectImageSource(maxLength: number, currentLength: number, postImages: Images[], form: FormGroup) {
  const cameraOptions: CameraOptions = {
    //allowEdit:true,
    quality: 100,
    cameraDirection: this.camera.Direction.BACK,
    // targetWidth: 500,
    // targetHeight: 600,
    // destinationType: this.camera.DestinationType.DATA_URL,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    sourceType: this.camera.PictureSourceType.CAMERA
  };
  
  const pickerOptions: ImagePickerOptions = {
    
    maximumImagesCount: maxLength - currentLength,
    outputType: 0,
    quality: 100,
    // disable_popover: false,
    width:500,
    height:500// ,
    // message:"aywa",
    // title:"boooo"
  };

  const actionSheet = await this.actionSheetController.create({
    header: this.translations.SelectImagesSource,
    // cssClass: 'my-custom-class',
    buttons: [{
      text: this.translations.PhotoGallery,
      icon: 'images',
      handler: () => {
        //console.log("louay debug camera11", postImages);
        // if((3 - this.postImages.length) !== 1 ){            
          //this.imagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
           this.imagePicker.getPictures(pickerOptions).then( async (imageData : string[]) => {
             //console.log(imageData) 
            //const loading = this.featureService.presentLoadingWithOptions(5000);
             for (let i = 0; i < imageData.length; i++) {
                //const filename = imageData[i].substring(imageData[i].lastIndexOf('/') + 1);
                //const path = imageData[i].substring(0,imageData[i].lastIndexOf('/') + 1);
                //console.log("filename",filename)
                //console.log("path",path)
                  let contents = await Filesystem.readFile({
                    path: imageData[i]
                  });
                  const photos : Images = {isCover:false, photoData: '', storagePath:''};
                  photos.isCover = false;
                  photos.photoData = "data:image/jpeg;base64," + contents.data;
                  postImages[postImages.length] = photos;
                  console.log("Louay ", photos.photoData)
                  if(form){
                    form.markAsDirty();
                  }
                }
          }
        ).catch((err) => { console.log('Error get pics',err)});  
    }
  }, {
      text: this.translations.Camera,
      icon: 'camera',
      handler: () => {
        
        this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
          //const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
          //const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
          //let image = await this.file.readAsDataURL(path, filename);//.then((image)=> {
          //let image = await this.file.readAsDataURL(path, filename);
            let contents = await Filesystem.readFile({
              path: imageData
            });
            const photos : Images = {isCover:false, photoData:'', storagePath:''};
            photos.isCover = false;
            photos.photoData = "data:image/jpeg;base64," + contents.data;
            postImages[postImages.length] = photos;
            console.log("louay postImages", postImages);
            if(form){
              form.markAsDirty();
            }
            // this.changeRef.detectChanges(); // Louay
        }).catch(err => console.log(err));
      
    }
    }, {
      text: this.translations.Cancel,
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]
  });
  // console.log("SelectPhotos",postImages);
  await actionSheet.present();
  // return postImages;
}

public createItemWithImages(itemData: any,itemImages: Images[], tableName: string)/* : Promise<DocumentReference> */ : any {    
  return this.afs.collection(tableName).add({...itemData}).then(async (res)=>{
    console.log("post id :",res.id);
    let images : any[] = [];
    if( itemImages.length > 0 ){
    for (var i = 0; i < itemImages.length; i++) {
      try {
        let uploaded = await this.uploadToStorage(itemImages[i].photoData,res.id, 'image/jpeg', '.jpeg', 'images/' + tableName + '/');

        if( uploaded.state === "success"){
          images.push({ isCover: itemImages[i].isCover, storagePath: uploaded.metadata.fullPath });
      }
      }
      catch (err) {
        console.log("Error uploading pdf: ", err);
      }
  }
  if (images.length !== 0){
    itemData.images = images;  
  }
  //return this.afs.collection(this.tableName).doc(res.id).update({...itemData});
  return this.afs.collection(tableName).doc(res.id).update({images: images});
}
} 
).catch(err=> {console.log("Error insert item into DB",err)}); 
}


public async updateItemWithImages(itemData: any, itemImages : Images[], tableName: string): Promise<void> {
    
  let images : any[] = [];
  if( itemImages.length > 0 ){
  for (var i = 0; i < itemImages.length; i++) {
      if (itemImages[i].storagePath == '') {

        try {
          const uploaded = await this.uploadToStorage(itemImages[i].photoData, itemData.id, 'image/jpeg', '.jpeg', 'images/posts/');

          if( uploaded.state === 'success'){
            
              images.push({ isCover : itemImages[i].isCover, storagePath : uploaded.metadata.fullPath });
          }
        }
        catch (err) {
          console.log('Error uploading pdf: ', err);
        }
    }
    else{ //old photos
      images.push({ isCover : itemImages[i].isCover, storagePath : itemImages[i].storagePath });
    }
  }
  if (images.length > 0){
    //itemData.images.push(...images);
    itemData.images = images;
  }
}
return this.afs.collection(tableName).doc(itemData.id).update({...itemData});
}

public updateItemWithoutOptions(itemData: any, tableName: string): Promise<void> {
  return this.afs.collection(tableName).doc(itemData.id).update({...itemData});
}

public deleteItem(itemFiles: Array<any>, itemId: string, tableName: string): Promise<void> {
  if(itemFiles){
    if(itemFiles.length >= 0){
    this.deleteItemFromStorage(itemFiles).then(()=> console.log('success')).catch(err=> console.log(err));
  }
  }
  return this.afs.collection(tableName).doc(itemId).delete();
}

private async deleteItemFromStorage(files : any[]) {
  const storageRef = this.afstore.storage.ref();
  files.forEach(item => {
    storageRef.child(item.storagePath).delete().then(function() {
  }).catch(function(error) {
    console.log(error,"problem deleting storage" + item);
  });
});
}

public deleteFromStorage(itemPath : string){        
  //return this.afstore.ref(`${itemPath}`).delete().toPromise();
  return this.afstore.storage.ref().child(itemPath).delete();
}

public getDownloadURL(storagePath : string) : Promise<any> {
  return this.afstore.storage.ref(storagePath).getDownloadURL();   
}

public uploadToStorage(itemDataPhoto: string, id: string, contentType: string, extention: string, storagePath: string): AngularFireUploadTask {
  console.log("Uploaded",itemDataPhoto);
  let name = `${new Date().getTime()}`+ extention;        
  //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
  return this.afstore.ref(storagePath + `${id}/${name}`).putString(itemDataPhoto, 'data_url', { contentType: contentType });
}

vote(votingInfo: VotingPublication){
  const votingPath = `votings/${votingInfo.publicationId}_${votingInfo.userId}`;
  return this.afs.doc(votingPath).set({...votingInfo}); 
}

getPublicationVoting(publicationId: string){
  const votingRef = this.afs.collection('votings' , ref => ref.where('publicationId', '==', publicationId));
  return votingRef.valueChanges() as Observable<VotingPublication[]>;
}

getUserRating(userId: string, type: string){
  const ratingRef = this.afs.collection('ratings' , ref => ref.where('ratedUserId', '==', userId).where('dealType', '==', type).orderBy('createdDate'));
  return ratingRef.valueChanges();
}

setUserRating(ratingInfo: RatingUser){
  const ratingPath = `ratings/${ratingInfo.dealId}_${ratingInfo.userId}`;
  return this.afs.doc(ratingPath).set({...ratingInfo});
}

public createItem(tableName: string, itemData: any, id?: string): Promise<DocumentReference | void>  {
  if (id){
    return this.afs.collection(tableName).doc(id).set({...itemData});
  }
  else {
    return this.afs.collection(tableName).add({...itemData});
  }
}

public updateItem(tableName: string, id: string, itemData: any): Promise<void> {
  return this.afs.collection(tableName).doc(id).update({...itemData});
}

 sendNotificationEmail(mailOptions: any){
  const headerDict = {
    'Content-Type': 'application/json'
  }
  
  const requestOptions = {                                                                                                                                                                                
    headers: new HttpHeaders(headerDict)
  };
   return this.http.post('https://us-central1-parkondo.cloudfunctions.net/sendInvitationEmails', mailOptions/*, requestOptions*/);
}

async openLanguageChooser() {
  this.availableLanguages = this.languageService.getLanguages()
  .map(item =>
    ({
      name: item.name,
      type: 'radio',
      label: item.name,
      value: item.code,
      checked: item.code === this.translate.currentLang
    })
  );

  const alert = await this.alertController.create({
    header: this.translations.SelectLanguage,
    inputs: this.availableLanguages,
    cssClass: 'language-alert',
    buttons: [
      {
        text: this.translations.Cancel,
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {}
      }, {
        text: this.translations.OK,
        handler: (data) => {
          if (data) {
            this.translate.use(data)
            // this.loginService.setUserLanguage(data).then(() => { this.translatee.use(data) });
          }
        }
      }
    ]
  });
  await alert.present();
}

changeLanguage(lang: string){
  this.translate.use(lang);
}

checkEmail(email: string): Observable<any> {
  //console.log("getItem", itemId);
  return this.afs.collection('invitations', ref => ref.where('emails', 'array-contains', email).orderBy('createDate', 'desc')).valueChanges({ idField: 'id' }).pipe(first());
  
/*  .snapshotChanges()
   .pipe(
    map(a => {
      const postData = a.payload.data();
      const id = a.payload.id;
      return { id, ...postData };
    })
  ); */
}
cropImage(imgPath) {
    
  const cropOptions: CropOptions = {
    
    quality: 25
//      targetHeight: 100,
//      targetWidth : 150
  }

  return this.crop.crop(imgPath, cropOptions)
    .then(
      newPath => {
       return this.croppedImageToBase64(newPath.split('?')[0])
      }  ,
      error => {
        console.log('Error cropping image' + error);
      }  
    ).catch(err => console.log("error catch", err));
    
}

async croppedImageToBase64(ImagePath) {

  // old code
  /*let copyPath = ImagePath;
  const splitPath = copyPath.split('/');
  const imageName = splitPath[splitPath.length - 1];
  const filePath = ImagePath.split(imageName)[0];

  return this.file.readAsDataURL(filePath, imageName)*/
  // end old code

      let contents = await Filesystem.readFile({
        path: ImagePath
      });
      
      return "data:image/jpeg;base64," + contents.data;

}
}