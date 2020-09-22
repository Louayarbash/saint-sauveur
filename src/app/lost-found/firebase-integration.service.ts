import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, forkJoin, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first } from 'rxjs/operators';
import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel/*, FirebasePhotoModel*/ } from './item/firebase-item.model';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { Images} from '../type';
import { UserModel } from '../users/user/user.model';
import { LoginService } from "../services/login/login.service";
import { FeatureService } from '../services/feature/feature.service';

@Injectable()
export class FirebaseService {
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;
  private buildingId = this.loginService.getBuildingId();
  private tableName = "lost-found";

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage,
    private loginService : LoginService,
    private featureService : FeatureService
    ) {
    }
  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.where('buildingId', '==', this.buildingId).orderBy('createDate', 'desc')).valueChanges({ idField: 'id' })
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
    return this.getItem(itemId)
    .pipe(
     
    // Transformation operator: Map each source value (user) to an Observable (combineDataSources | throwError) which
    // is merged in the output Observable
      concatMap(item => {
        console.log("item details ...",item)
      if (item.createDate) {
      const creatorDetails  = this.afs.doc<UserModel>( 'users/' + item.createdBy).valueChanges().pipe(first()).pipe(map(res => {return res})); 
      console.log("item listing ",item);
          if (item.images.length > 0) {
            console.log("images > 0",item)

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
          else if (item.images.length == 0){
           console.log("images == 0",item)
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

  private getItem(postId: string): Observable<FirebaseItemModel> {
    return this.afs.doc<FirebaseItemModel>(this.tableName + '/' + postId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData } as FirebaseItemModel;
      })
    );
  }

//LA_2019_11 I put async here.. without it the modal will not dismiss
/*   public createItem(itemData : FirebaseItemModel,postImages : Images[]) : Promise<DocumentReference> : any {    
    return this.afs.collection(this.tableName).add({...itemData}).then(async (res)=>{
      console.log("post id :",res.id);
      let images : Images[] = [];
      if( postImages.length > 0 ){
      for (var i = 0; i < postImages.length; i++) {
        try {
          let uploaded = await this.featureService.uploadToStorage(postImages[i].photoData, res.id, 'image/jpeg', '.jpeg', 'images/rentorsale/');

          if( uploaded.state === "success"){
            images.push({ isCover : postImages[i].isCover, storagePath : uploaded.metadata.fullPath, photoData: '' });
        }
        }
        catch (err) {
          console.log("Error uploading pdf: ", err);
        }
    }
    if (images.length !== 0){
      itemData.images = images;  
    }
    return this.afs.collection(this.tableName).doc(res.id).update({...itemData});
  }
  } 
  ).catch(err=> {console.log("Error insert item into DB",err)}); 
}  */

/* public async updateItem(itemData: FirebaseItemModel, postImages : Images[]): Promise<void> {
    
    let images : Images[] = [];
    if( postImages.length > 0 ){
    for (var i = 0; i < postImages.length; i++) {
        if (postImages[i].storagePath == '') {

          try {
            const uploaded = await this.featureService.uploadToStorage(postImages[i].photoData, itemData.id, 'image/jpeg', '.jpeg', 'images/posts/');
  
            if( uploaded.state === 'success'){
              
                images.push({ isCover : postImages[i].isCover, storagePath : uploaded.metadata.fullPath, photoData: '' });
            }
          }
          catch (err) {
            console.log('Error uploading pdf: ', err);
          }
      }
      else{ //old photos
        images.push({ isCover : postImages[i].isCover, storagePath : postImages[i].storagePath, photoData: '' });
      }
    }
    if (images.length > 0){
      //itemData.images.push(...images);
      itemData.images = images;
    }
  }
  return this.afs.collection(this.tableName).doc(itemData.id).update({...itemData});
} */
  // Get data of a specific User

/* 
  private uploadToStorage(itemDataPhoto,id): AngularFireUploadTask {
    console.log("Uploaded",itemDataPhoto);
    let newName = `${new Date().getTime()}.jpeg`;        
    //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
    return this.afstore.ref(`images/rentorsale/${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'image/jpeg' });
}

public updateItemWithoutOptions(itemData: FirebaseItemModel): Promise<void> {
return this.afs.collection(this.tableName).doc(itemData.id).update({...itemData});
}

  private async deleteItemFromStorage(storagePath : Images[]) {
    const storageRef = this.afstore.storage.ref();
    storagePath.forEach(item => {
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
  public deleteItem(item: FirebaseItemModel): Promise<void> {
    if(item.images){
      if(item.images.length >= 0){
      this.deleteItemFromStorage(item.images).then(()=> console.log('success')).catch(err=> console.log(err));
    }
    }
    return this.afs.collection(this.tableName).doc(item.id).delete();
  }

  getDownloadURL(imagesFullPath : string) : Promise<any> {
        return this.afstore.storage.ref(imagesFullPath).getDownloadURL();   
  }  */
}
