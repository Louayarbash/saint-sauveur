import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, forkJoin, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first } from 'rxjs/operators';
import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseCombinedItemModel/*, FirebasePhotoModel*/ } from './item/firebase-item.model';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { PhotosData, Images} from '../type';
import { FirebaseUserModel } from '../users/user/firebase-user.model';

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
        //let creatorDetails : FirebaseUserModel;
        const creatorDetails  = this.afs.doc<FirebaseUserModel>( 'users/' + item.createdBy).valueChanges().pipe(first()).pipe(map(res => {return res}))//.toPromise()//.then(res => creatorDetails = res) 

        if (item && (item.images.length != 0)) {
/*           const itemPhotosObservables: Array<Observable<PhotosData>> = item.images.map( image => {
             return this.getPicObservable(image.storagePath).pipe(first()).pipe(map(photo => { return { photo : photo, storagePath : image.storagePath, isCover: image.isCover } 
            }));
          }); */

          const itemPhotosPromise : Array<Promise<PhotosData>> = item.images.map( image => {
            return this.getPicPromise(image.storagePath).then(photo => { 
              return { photo : photo, storagePath : image.storagePath, isCover: image.isCover }
         }).catch(err => {
           return this.getPicPromise("images/no_image.jpeg").then(photo => { 
            return { photo : photo, storagePath : image.storagePath, isCover: image.isCover } })
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
            map(([itemDetails, creatorDetails, itemPhotos]: [FirebaseItemModel, FirebaseUserModel, Array<PhotosData>] ) => {
              
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...itemDetails,
                photos: itemPhotos,
                creatorDetails : creatorDetails
              } as FirebaseCombinedItemModel;
            })
          );
        }
         else if (item && (item.images.length == 0)){
           return combineLatest([
            of(item),
            creatorDetails,
          ]).pipe(
            map(([userDetails, creatorDetails]: [FirebaseItemModel, FirebaseUserModel]) => {
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...userDetails,
                creatorDetails : creatorDetails
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
  public createItem(itemData : FirebaseItemModel,postImages : PhotosData[])/* : Promise<DocumentReference> */ : any {    
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
    if (images.length !== 0){
      itemData.images = images;  
    }
  }
    return this.afs.collection('posts').doc(res.id).update({...itemData});
  } 
  ).catch(err=> {console.log("Error insert item into DB",err)}); 
} 
   
private uploadToStorage(itemDataPhoto,id): AngularFireUploadTask {
        console.log("Uploaded",itemDataPhoto);
        let newName = `${new Date().getTime()}.jpeg`;
        console.log("kess eiri 3arssa");        
        //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
        return this.afstore.ref(`images/posts/${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'image/jpeg' });
}


public updateItemWithoutOptions(itemData: FirebaseItemModel): Promise<void> {
    return this.afs.collection('posts').doc(itemData.id).update({...itemData});
}

public async updateItem(itemData: FirebaseItemModel, postImages : PhotosData[]): Promise<void> {
    
    let images : Images[] = [];
    if( postImages.length > 0 ){
    for (var i = 0; i < postImages.length; i++) {
        if (postImages[i].storagePath == '') {

          try {
            const uploaded = await this.uploadToStorage(postImages[i].photo, itemData.id);
  
            if( uploaded.state === 'success'){
              
                images.push({ isCover : postImages[i].isCover, storagePath : uploaded.metadata.fullPath });
            }
          }
          catch (err) {
            console.log('Error uploading pdf: ', err);
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
private getItem(postId: string): Observable<FirebaseItemModel> {
    return this.afs.doc<FirebaseItemModel>('posts/' + postId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData } as FirebaseItemModel;
      })
    );
  }

  private async deleteItemStorage(storagePath : Images[]) {
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
      this.deleteItemStorage(item.images);
    }
    }
    return this.afs.collection('posts').doc(item.id).delete();
  }

/*   getPicObservable(imagesFullPath : string){
let aaa : Observable<any>;
    try {
      
      aaa = this.afstore.ref(imagesFullPath).getDownloadURL(); 
      console.log(aaa,"try")
    } catch (error) {
      console.log("catch",error)
      aaa = this.afstore.ref("images/no_image.jpeg").getDownloadURL();
      
    }
    return aaa;
     
    }  */
  getPicPromise(imagesFullPath : string) : Promise<any> {
        return this.afstore.storage.ref(imagesFullPath).getDownloadURL();   
  } 
}
