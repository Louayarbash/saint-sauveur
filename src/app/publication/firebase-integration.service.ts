import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import { DataStore, ShellModel } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel } from './item/firebase-item.model';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
//import { LoginService } from "../services/login/login.service"
//import { LoginCredential } from '../type';
import { AlertController } from '@ionic/angular';
//import { storage } from "firebase/app";
//import * as firebase from 'firebase';
//import { async } from '@angular/core/testing';
//import { debug } from 'console';
//import { CompileShallowModuleMetadata } from '@angular/compiler';
//import { PhotosArray } from '../type';
import { FileUpload } from '../type'
//import 'firebase/<PACKAGE>';

@Injectable()
export class FirebaseService {
  private tableName = "publication";
  storagePath = "pdf/publications/"
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;
  private relatedItemsDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<ItemImageModel>>;
  

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage, 
    //public loginService : LoginService, 
    private alertCtrl : AlertController
    )  {
      
    }

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    //let CoverPic : any;
    return this.afs.collection<FirebaseListingItemModel>(this.tableName).valueChanges({  idField: 'id' });
/*        .pipe(
       map(actions => actions.map(post => {
          //const age = this.calcUserAge(post.createDate);
           const CoverPic = this.getProfilePic(post.photo);
          //return { age, ...post } as FirebaseListingItemModel;
          return { post } as FirebaseListingItemModel;
        })
      )
    );  */
  }

  public getListingStore(dataSource: Observable<Array<FirebaseListingItemModel>>): DataStore<Array<FirebaseListingItemModel>> {
    // Use cache if available
    if (!this.listingDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<FirebaseListingItemModel> = [
        new FirebaseListingItemModel(),
        new FirebaseListingItemModel(),
        new FirebaseListingItemModel(),
        new FirebaseListingItemModel(),
        new FirebaseListingItemModel(),
        new FirebaseListingItemModel()
      ];

      this.listingDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.listingDataStore.load(dataSource);
    }
    return this.listingDataStore;
  }
  /*
    Firebase User Details Page
  */
  // Concat the userData with the details of the userSkills (from the skills collection)
  public getCombinedItemDataSource(itemId: string): Observable<FirebaseCombinedItemModel> {
    return this.getItem(itemId);
  }
  public getCombinedItemStore(dataSource: Observable<FirebaseCombinedItemModel>): DataStore<FirebaseCombinedItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseCombinedItemModel = new FirebaseCombinedItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

//LA_2019_11 I put async here.. without it the modal will not dismiss
    public async createItem(itemData : FirebaseItemModel,files : FileUpload[])/* : Promise<DocumentReference>*/{    
      try {
        const res = await this.afs.collection(this.tableName).add({ ...itemData });
        console.log("pub id :", res.id);
        let fileFullPath: any[] = [];
        for (var i = 0; i < files.length; i++) {
          try {
            let uploaded = await this.uploadToStorage(files[i].fileData, res.id);
            console.log("createItem: state", uploaded.state);
            console.log("createItem: fileName", files[i].fileName);
            console.log("createItem: fullPath", uploaded.metadata.fullPath);
            if( uploaded.state === "success"){
              fileFullPath.push({ fileName: files[i].fileName, storagePath: uploaded.metadata.fullPath });
          }
          }
          catch (err) {
            console.log("Error uploading pdf: ", err);
          }
        }
        //itemData.fileFullPath = imagesFullPath;
        return this.afs.collection(this.tableName).doc(res.id).update({ fileFullPath : fileFullPath });
      } catch (err) {
        console.log("Error creating itemData: ", err);
      }

  } 
   private uploadToStorage(itemDataPhoto,id) : AngularFireUploadTask {
        console.log("Uploaded",itemDataPhoto);
        let newName = `${new Date().getTime()}.pdf`;     
        //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
        return this.afstore.ref(this.storagePath+ `${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'application/pdf' });
   }
   public deleteFromStorage(itemPath : string){        
    return this.afstore.ref(`${itemPath}`).delete().toPromise();
  }

/*      private storeInfoToDatabase(itemData:FirebaseItemModel): Promise<DocumentReference>{
        console.log("storeInfotoDB",itemData);
           let photoStore = {
            //createdById : this.auth.getLoginID(),
            //createdDate : metadata.timeCreated,
            //url : metadata.downloadURLs[0],
            fullPath : metadata.fullPath,
            contentType : metadata.contentType
            //downloadURLs : metadata.downloadURLs[0]
          } 
           
          return this.afs.collection('posts').add(itemData);
          //return this.afs.collection('images').add(toSave);
        } */
  /* async addFile(){
    const alert = await this.alertCtrl.create({
      header: 'Confirm',
      message: 'Do you want to add ',
      inputs : [
          {
            name:'info',
            placeholder: 'inter file name'
          }
        ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Store',
          handler: (data) => {
            console.log(data);
            this.uploadInformation(data.info);
          }
        }
      ]
    });
    await alert.present();
    } 
     uploadInformation(text:string){
      let upload = this.uploadToStorage(text);
      upload.then().then(res => {
        console.log("louay:",res.metadata);
        this.storeInfoToDatabase(res.metadata).then(async () => {
          let toast =  await this.toastCtrl.create({
            
            message : 'File uploaded',
            duration : 3000
          });
           await toast.present();
          }
          );  
        }
  
        );
      }*/

  /*
    Firebase Update User Modal
  */
  public updateItemWithoutOptions(itemData: FirebaseItemModel): Promise<void> {
    return this.afs.collection('posts').doc(itemData.id).set(itemData);
  }

  public async updateItem(itemData: FirebaseItemModel, files : FileUpload[]): Promise<void> {
      let fileFullPath: any[] = [];
      for (var i = 0; i < files.length; i++) {
        
          if (files[i].filePath != ""){
          try {
          let uploaded = await this.uploadToStorage(files[i].fileData, itemData.id);
          console.log("updateItem: state", uploaded.state);
          console.log("updateItem: fileName", files[i].fileName);
          console.log("updateItem: fullPath", uploaded.metadata.fullPath);
          if( uploaded.state === "success"){
            fileFullPath.push({ fileName: files[i].fileName, storagePath: uploaded.metadata.fullPath });
          }
        }
        catch (err) {
          console.log("Error uploading pdf: ", err);
        }
        }
        else{
          itemData.fileFullPath[i].fileName = files[i].fileName;
        }
      }
      if ((fileFullPath.length != 0) && (itemData.fileFullPath)){ // new pdf added
        itemData.fileFullPath.push(...fileFullPath);    
      }
      else if((fileFullPath.length != 0) && !(itemData.fileFullPath)){
        itemData.fileFullPath = fileFullPath;
      }
      return this.afs.collection(this.tableName).doc(itemData.id).set({ ...itemData });
  }

  public deleteItem(item: FirebaseItemModel): Promise<void> {
    //this.afstore.ref(item.id).delete();
    return this.afs.collection('publication').doc(item.id).delete();
  }

  /*
    Firebase Select User Image Modal
  */
/*   public getAvatarsDataSource(): Observable<Array<ItemImageModel>> {
    return this.afs.collection<ItemImageModel>('avatars').valueChanges();
  } */

/*   public getAvatarsStore(dataSource: Observable<Array<ItemImageModel>>): DataStore<Array<ItemImageModel>> {
    // Use cache if available
    if (!this.avatarsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<ItemImageModel> = [
        new ItemImageModel(),
        new ItemImageModel(),
        new ItemImageModel(),
        new ItemImageModel(),
        new ItemImageModel()
      ];

      this.avatarsDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.avatarsDataStore.load(dataSource);
    }
    return this.avatarsDataStore;
  } */
  // Get data of a specific Item
  private getItem(itemId: string): Observable<FirebaseCombinedItemModel> {
    return this.afs.doc<FirebaseCombinedItemModel>('publication/' + itemId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const itemData = a.payload.data();
        const id = a.payload.id;
        return { id, ...itemData } as FirebaseCombinedItemModel;
      })
    );
  }

/*   deleteItemTest(file){
    console.log("deleted");
    let key = file;
    let storagePath = file.fullPath;
    this.afs.collection('images').doc(key).delete();
    return this.afstore.ref(storagePath).delete();
  } */
}
