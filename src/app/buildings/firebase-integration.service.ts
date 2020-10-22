import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataStore } from '../shell/data-store';

import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { BuildingModel } from '../buildings/building/building.model';
//import { UserImageModel } from './user/select-image/user-image.model';
//import { LoginService } from '../services/login/login.service';
// import { FirebaseUserModel } from '../users/user/firebase-user.model';
import { LoginService } from "../services/login/login.service"

@Injectable()
export class FirebaseService {
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<BuildingModel>;
  // private relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<UserImageModel>>;
  private tableName = "buildings";
  // private buildingId = this.loginService.getBuildingId();

  constructor(
    private afs: AngularFirestore,
    public loginService : LoginService) {}

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.orderBy('createDate', 'desc')).valueChanges({ idField: 'id' })
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

  public getCombinedItemDataSource(itemId: string): Observable<BuildingModel> {
    return this.getItem(itemId);
  }
  
  public getCombinedItemStore(dataSource: Observable<BuildingModel>): DataStore<BuildingModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: BuildingModel = new BuildingModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

 
  public createItem(itemData: any): Promise<DocumentReference>  {
    return this.afs.collection(this.tableName).add({...itemData});
  }

  /*
    Firebase Update User Modal
  */
  public updateItem(itemData: any): Promise<void> {
    return this.afs.collection(this.tableName).doc(itemData.id).update({...itemData});
  }

  public deleteItem(id: string): Promise<void> {
    return this.afs.collection(this.tableName).doc(id).delete();
  }

  private getItem(id: string): Observable<BuildingModel> {
    return this.afs.doc<BuildingModel>(this.tableName + '/' + id)
    .snapshotChanges()
    .pipe(
      map(a => {
        const itemData = a.payload.data();
        const id = a.payload.id;
        return { id, ...itemData } as BuildingModel;
      })
    );
  }

}
