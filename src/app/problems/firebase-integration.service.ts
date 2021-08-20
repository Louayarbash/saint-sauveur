import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, throwError, combineLatest, forkJoin } from 'rxjs';
import { map, concatMap, first } from 'rxjs/operators';
import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel/*, FirebasePhotoModel*/ } from './item/firebase-item.model';
import { AngularFireStorage } from "@angular/fire/storage";
import { Images} from '../type';
import { UserModel } from '../users/user/user.model';
//import { LoginService } from "../services/login/login.service"
import { FeatureService } from '../services/feature/feature.service';

@Injectable()
export class FirebaseService {
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;
  //private buildingId = this.loginService.getBuildingId();
  private tableName = "problems";

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage,
    //private loginService : LoginService,
    private featureService : FeatureService
    )  {
    }
  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    console.log(this.tableName)
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

  public getCombinedItemDataSource(itemId: string): Observable<FirebaseCombinedItemModel> {
    return this.getItem(itemId, this.tableName)
    .pipe(
     
    // Transformation operator: Map each source value (user) to an Observable (combineDataSources | throwError) which
    // is merged in the output Observable
      concatMap(item => {
      if (item.createDate) {
      console.log(item.createdBy)
      const creatorDetails  = this.afs.doc<UserModel>( 'users/' + item.createdBy).valueChanges().pipe(first()).pipe(map(res => {return res})); 
      //console.log("item listing ",item);
           if (item.images.length > 0) {
            //console.log("images > 0",item)

          const itemPhotosPromise : Array<Promise<Images>> = item.images.map( image => {
            return this.featureService.getDownloadURL(image.storagePath).then(photo => { 
              return { photoData: photo, storagePath : image.storagePath, isCover: image.isCover }
         }).catch(err => {
           return this.featureService.getDownloadURL("images/no_image.jpeg").then(photo => { 
            return { photoData : photo, storagePath : image.storagePath, isCover: image.isCover } })
        })
        });
          // Combination operator: Take the most recent value from both input sources (of(user) & forkJoin(userSkillsObservables)),
          // and transform those emitted values into one value ([userDetails, userSkills])
          return combineLatest([
            of(item),
            creatorDetails,
            //of(itemPhotosPromise)
            //forkJoin(itemPhotosObservables),
            forkJoin(itemPhotosPromise),
            
          ]).pipe(
            map(([itemDetails, creatorDetails, itemPhotos]: [FirebaseItemModel, UserModel, Array<Images>] ) => {
              
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...itemDetails,
                photos: itemPhotos,
                creatorDetails : creatorDetails
              } as FirebaseCombinedItemModel;
            })
          );
          } 
          if (item.images.length == 0){
           //console.log("images == 0",item)
           return combineLatest([
            of(item),
            creatorDetails,
          ]).pipe(
            map(([itemDetails, creatorDetails]: [FirebaseItemModel, UserModel]) => {
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...itemDetails,
                creatorDetails : creatorDetails
              } as FirebaseCombinedItemModel;
            })
          );
        } 
        }
        else {
          console.log('Item with no data')
          // Throw error
          return throwError('Item with no data');
        }
      })
    );
  }
  
  public getCombinedItemStore(dataSource: Observable<FirebaseCombinedItemModel>): DataStore<FirebaseCombinedItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseCombinedItemModel = new FirebaseCombinedItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

  private getItem(postId: string, tableName: string): Observable<FirebaseItemModel> {
    return this.afs.doc<FirebaseItemModel>(tableName + '/' + postId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData } as FirebaseItemModel;
      })
    );
}
}