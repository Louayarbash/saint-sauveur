import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, forkJoin, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first, filter } from 'rxjs/operators';
import { DataStore, ShellModel } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel,FirebasePhotoModel } from './item/firebase-item.model';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { PhotosArray, Images} from '../type';

@Injectable()
export class FirebaseService {
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage
    )  {
      
    }

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    //let CoverPic : any;
    return this.afs.collection<FirebaseListingItemModel>('posts').valueChanges({  idField: 'id' });
  }

  public getListingStore(dataSource: Observable<Array<FirebaseListingItemModel>>): DataStore<Array<FirebaseListingItemModel>> {
    // Use cache if available
    if (!this.listingDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<FirebaseListingItemModel> = [
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

  public getCombinedItemDataSource(itemId: string): Observable<FirebaseCombinedItemModel> {
    return this.getItem(itemId)
    .pipe(
      // Transformation operator: Map each source value (user) to an Observable (combineDataSources | throwError) which
      // is merged in the output Observable
      concatMap(item => {
        //item.imagesFullPath = [""];
        if (item && (item.images.length != 0)) {
          const itemPhotosObservables: Array<Observable<PhotosArray>> = item.images.map( image => {
             return this.getPic(image.storagePath).pipe(first()).pipe(map(photo => {return { photo : photo, storagePath : image.storagePath, isCover: image.isCover } } ));

          });

          // Combination operator: Take the most recent value from both input sources (of(user) & forkJoin(userSkillsObservables)),
          // and transform those emitted values into one value ([userDetails, userSkills])
          return combineLatest([
            of(item),
            forkJoin(itemPhotosObservables)
          ]).pipe(
            map(([userDetails, userPhotos]: [FirebaseItemModel, Array<PhotosArray>]) => {
              
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...userDetails,
                photos: userPhotos
              } as FirebaseCombinedItemModel;
            })
          );
        }
         else if (item && (item.images.length == 0)){
           return combineLatest([
            of(item)
          ]).pipe(
            map(([userDetails]: [FirebaseItemModel]) => {
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...userDetails
              } as FirebaseCombinedItemModel;
            })
          );
        } 
/*          else if(!item.imagesFullPath) {
          return of(...item);
        }   */
         else {
          // Throw error
          return throwError('User does not have any skills.');
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

//LA_2019_11 I put async here.. without it the modal will not dismiss
  public createItem(itemData : FirebaseItemModel,postImages : PhotosArray[])/* : Promise<DocumentReference> */ : any {    
    return this.afs.collection('posts').add({...itemData}).then(async (res)=>{
      console.log("post id :",res.id);
      let images : Images[] = [];
      if( postImages.length > 0 ){
      for (var i = 0; i < postImages.length; i++) {
        try {
          let uploaded = await this.uploadToStorage(postImages[i].photo,res.id);

          if( uploaded.state === "success"){
            images.push({ isCover : postImages[i].isCover, storagePath : uploaded.metadata.fullPath });
        }
        }
        catch (err) {
          console.log("Error uploading pdf: ", err);
        }
    }
    if (images.length != 0){
      itemData.images = images;  
    }
  }
    return this.afs.collection('posts').doc(res.id).update({...itemData});
  } 
  ).catch(err=> {console.log("Error insert item into DB",err)}); 
} 
   
private uploadToStorage(itemDataPhoto,id) : AngularFireUploadTask {
        console.log("Uploaded",itemDataPhoto);
        let newName = `${new Date().getTime()}.jpeg`;
        console.log("kess eiri 3arssa");        
        //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
        return this.afstore.ref(`images/posts/${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'image/jpeg' });
}


public updateItemWithoutOptions(itemData: FirebaseItemModel): Promise<void> {
    return this.afs.collection('posts').doc(itemData.id).update({...itemData});
}

public async updateItem(itemData: FirebaseItemModel, postImages : PhotosArray[]): Promise<void> {
    
    let images : Images[] = [];
    if( postImages.length > 0 ){
    for (var i = 0; i < postImages.length; i++) {
        if (postImages[i].storagePath == "") {
         //await this.uploadToStorage(postImages[i].photo,itemData.id).then(res => {

          try {
            let uploaded = await this.uploadToStorage(postImages[i].photo,itemData.id);
  
            if( uploaded.state === "success"){
              
                images.push({ isCover : postImages[i].isCover, storagePath : uploaded.metadata.fullPath });
            }
          }
          catch (err) {
            console.log("Error uploading pdf: ", err);
          }
      }
      else{ //old photos
        images.push({ isCover : postImages[i].isCover, storagePath : postImages[i].storagePath });
      }
    }
    if (images.length > 0){
      //itemData.images.push(...images);
      itemData.images = images;
    }
  }
  return this.afs.collection('posts').doc(itemData.id).update({...itemData});
}
  // Get data of a specific User
private getItem(postId: string): Observable<FirebaseCombinedItemModel> {
    return this.afs.doc<FirebaseCombinedItemModel>('posts/' + postId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData } as FirebaseCombinedItemModel;
      })
    );
  }

  private async deleteItemStorage(storagePath : Images[]) {
    var storageRef = this.afstore.storage.ref();
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
      this.deleteItemStorage(item.images);
    }
    }
    return this.afs.collection('posts').doc(item.id).delete();
  }

 getPic(imagesFullPath : string){
   return  this.afstore.ref(imagesFullPath).getDownloadURL();
  
  } 
  
}
