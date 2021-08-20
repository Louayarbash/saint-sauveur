import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';
import { DataStore } from '../shell/data-store';
import { NotificationListingItemModel } from './listing/firebase-listing.model';
import { LoginService } from "../services/login/login.service"

@Injectable()
export class FirebaseService {
  // Listing Page
  private listingDataStore: DataStore<Array<NotificationListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<NotificationListingItemModel>;
  // private relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<UserImageModel>>;
  private tableName = "notifications";
  private buildingId = this.loginService.getBuildingId();

  constructor(
    private afs: AngularFirestore,
    public loginService : LoginService) {}

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<NotificationListingItemModel>> {
    console.log("this.buildingId",this.buildingId)
    return this.afs.collection<NotificationListingItemModel>(this.tableName, ref => ref.where('buildingId', '==', this.buildingId).orderBy('createDate', 'desc')).valueChanges({ idField: 'id' })
  }

  public getListingStore(dataSource: Observable<Array<NotificationListingItemModel>>): DataStore<Array<NotificationListingItemModel>> {
    // Use cache if available
    if (!this.listingDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<NotificationListingItemModel> = [
        new NotificationListingItemModel(),
        new NotificationListingItemModel(),
        new NotificationListingItemModel()
      ];

      this.listingDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.listingDataStore.load(dataSource);
    }
    return this.listingDataStore;
  }

  public getCombinedItemDataSource(id: string): Observable<any> {
    return this.getItem(id) 
  }
  
  public getCombinedItemStore(dataSource: Observable<NotificationListingItemModel>): DataStore<NotificationListingItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: NotificationListingItemModel = new NotificationListingItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

  private getItem(id: string): Observable<NotificationListingItemModel> {
    return this.afs.doc<NotificationListingItemModel>(this.tableName + '/' + id)
    .snapshotChanges()
    .pipe(
      map(a => {
        const itemData = a.payload.data();
        const id = a.payload.id;
        return { id, ...itemData } as NotificationListingItemModel;
      })
    );
  }
}
