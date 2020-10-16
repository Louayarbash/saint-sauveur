import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel } from './item/firebase-item.model';
import { AngularFireStorage } from "@angular/fire/storage";
import { Files } from '../type'
import { LoginService } from "../services/login/login.service"
import { FeatureService } from '../services/feature/feature.service';

@Injectable()
export class FirebaseService {
  private tableName = "publication";
  storagePath = "pdf/publications/"
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;
  // private buildingId= this.loginService.getBuildingId();
  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<ItemImageModel>>;
  

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage, 
    private loginService : LoginService,
    private featureService : FeatureService
    //public loginService : LoginService, 
    //private alertCtrl : AlertController
    )  {
      
    }

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    //let CoverPic : any;
    return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.where('buildingId', '==', this.loginService.getBuildingId()).orderBy('createDate', 'desc')).valueChanges({ idField: 'id' })
  }

  public getListingStore(dataSource: Observable<Array<FirebaseListingItemModel>>): DataStore<Array<FirebaseListingItemModel>> {
    // Use cache if available
    if (!this.listingDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<FirebaseListingItemModel> = [
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

    public createItem(itemData : any,files : Files[])/* : Promise<DocumentReference>*/ : any{    
        return this.afs.collection(this.tableName).add({ ...itemData }).then(async (res)=>{
        console.log("publication id :", res.id);
        let filesVar: any[] = [];
        if(files.length > 0){
        for (var i = 0; i < files.length; i++) {
          try {
            let uploaded = await this.featureService.uploadToStorage(files[i].fileData, res.id, 'application/pdf', '.pdf', 'pdf/publication/');
            console.log("createItem: state", uploaded.state);
            console.log("createItem: fileName", files[i].fileName);
            console.log("createItem: fullPath", uploaded.metadata.fullPath);
            if( uploaded.state === "success"){
              filesVar.push({ fileName: files[i].fileName, storagePath: uploaded.metadata.fullPath });
          }
        }
        catch (err) {
          console.log("Error uploading pdf: ", err);
        }
      }
      if (filesVar.length !== 0){
        itemData.files = filesVar;  
      }
      return this.afs.collection(this.tableName).doc(res.id).update({ files: filesVar });  
        }
      }
        ).catch(err=> {console.log("Error insert item into DB",err)}); 
    }

  public async updateItem(itemData: FirebaseItemModel, files : Files[]): Promise<void> {
      let filesVar: any[] = [];
      if( files.length > 0 ){
      for (var i = 0; i < files.length; i++) {
        
          if (files[i].filePath != ""){
          try {
          let uploaded = await this.featureService.uploadToStorage(files[i].fileData, itemData.id, 'application/pdf', '.pdf', 'pdf/publication/');
          console.log("updateItem: state", uploaded.state);
          console.log("updateItem: fileName", files[i].fileName);
          console.log("updateItem: fullPath", uploaded.metadata.fullPath);
          if( uploaded.state === "success"){
            filesVar.push({ fileName: files[i].fileName, storagePath: uploaded.metadata.fullPath });
          }
        }
        catch (err) {
          console.log("Error uploading pdf: ", err);
        }
        }
        else{
          itemData.files[i].fileName = files[i].fileName;
        }
      }
      if ((filesVar.length != 0) && (itemData.files)){ // new pdf added
        itemData.files.push(...filesVar);    
      }
      else if((filesVar.length != 0) && !(itemData.files)){
        itemData.files = filesVar;
      }
    }
      return this.afs.collection(this.tableName).doc(itemData.id).update({ ...itemData });
  }
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

/*   public deleteItem111(item: FirebaseItemModel): Promise<void> {
    //this.afstore.ref(item.id).delete();
    return this.afs.collection('publication').doc(item.id).delete();
  }

  public deleteFromStorage111(itemPath : string){        
    return this.afstore.ref(`${itemPath}`).delete().toPromise();
  }

  private uploadToStorage(itemDataPhoto,id) : AngularFireUploadTask {
    console.log("Uploaded",itemDataPhoto);
    let newName = `${new Date().getTime()}.pdf`;     
    //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
    return this.afstore.ref(this.storagePath + `${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'application/pdf' });
}

public updateItemWithoutOptions(itemData: FirebaseItemModel): Promise<void> {
return this.afs.collection('posts').doc(itemData.id).set(itemData);
}

  public deleteItem(item: FirebaseItemModel): Promise<void> {
    if(item.files){
      if(item.files.length >= 0){
      this.deleteItemFromStorage(item.files).then(()=> console.log('success')).catch(err=> console.log(err));
    }
    }
    return this.afs.collection(this.tableName).doc(item.id).delete();
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
}*/
}
