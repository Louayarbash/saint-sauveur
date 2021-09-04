import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel } from './item/firebase-item.model';
import { AngularFireStorage } from "@angular/fire/storage";
import { Files } from '../type'
import { LoginService } from "../services/login/login.service"
import { FeatureService } from '../services/feature/feature.service';
import { DataStore } from '../shell/data-store';

@Injectable()
export class FirebaseService {
  private tableName = "events";
  storagePath = "pdf/events/"
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<FirebaseItemModel>;
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
    console.log("getListingDataSource")
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
  public getCombinedItemDataSource(itemId: string): Observable<FirebaseItemModel> {
    return this.getItem(itemId);
  }
  public getCombinedItemStore(dataSource: Observable<FirebaseItemModel>): DataStore<FirebaseItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseItemModel = new FirebaseItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
    } 

    public createItem(itemData : any,files : Files[])/* : Promise<DocumentReference>*/ : any{    
        return this.afs.collection(this.tableName).add({ ...itemData }).then(async (res)=>{
        console.log("event id :", res.id);
        let filesVar: any[] = [];
        if(files.length > 0){
        for (var i = 0; i < files.length; i++) {
          try {
            let uploaded = await this.featureService.uploadToStorage(files[i].fileData, res.id, 'application/pdf', '.pdf', this.storagePath);
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

  public async updateItem(itemData: any, files : Files[]): Promise<void> {
      let filesVar: any[] = [];
      if( files.length > 0 ){
      for (var i = 0; i < files.length; i++) {
        
          if (files[i].filePath != ""){
          try {
          let uploaded = await this.featureService.uploadToStorage(files[i].fileData, itemData.id, 'application/pdf', '.pdf', this.storagePath + this.loginService.getBuildingId() + '/');
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
  private getItem(itemId: string): Observable<FirebaseItemModel> {
    return this.afs.doc<FirebaseItemModel>( this.tableName + '/' + itemId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const itemData = a.payload.data();
        const id = a.payload.id;
        return { id, ...itemData } as FirebaseItemModel;
      })
    );
  }
}
