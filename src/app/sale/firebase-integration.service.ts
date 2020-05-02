import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, forkJoin, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first, filter } from 'rxjs/operators';
import * as dayjs from 'dayjs';
import { DataStore, ShellModel } from '../shell/data-store';

import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { FirebaseItemModel, FirebaseSkillModel, FirebaseCombinedItemModel,FirebasePhotoModel } from './item/firebase-item.model';
import { ItemImageModel } from './item/select-image/item-image.model';

import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
//import { LoginService } from "../services/login/login.service"
//import { LoginCredential } from '../type';
import { AlertController,ToastController,LoadingController } from '@ionic/angular';
import { storage } from "firebase/app";
import * as firebase from 'firebase';
import { }from 'firebase';
import { async } from '@angular/core/testing';
import { debug } from 'console';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { PhotosArray } from '../type';
//import 'firebase/<PACKAGE>';

@Injectable()
export class FirebaseService {
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<FirebaseCombinedItemModel>;
  private relatedItemsDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // Select User Image Modal
  private avatarsDataStore: DataStore<Array<ItemImageModel>>;
  

  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage, 
    //public auth : LoginService, 
    private alertCtrl : AlertController, 
    private toastController : ToastController,
    private loadingController : LoadingController
    )  {
      
    }

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    //let CoverPic : any;
    return this.afs.collection<FirebaseListingItemModel>('posts').valueChanges({  idField: 'id' });
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

  // Filter users by age
  public searchUsersByAge(lower: number, upper: number): Observable<Array<FirebaseListingItemModel>> {
    // we save the dateOfBirth in our DB so we need to calc the min and max dates valid for this query
    const minDate = (dayjs(Date.now()).subtract(upper, 'year')).unix();
    const maxDate =  (dayjs(Date.now()).subtract(lower, 'year')).unix();

    const listingCollection = this.afs.collection<FirebaseListingItemModel>('posts', ref =>
      ref.orderBy('createDate'));
      //.startAt(minDate).endAt(maxDate));

    return listingCollection.valueChanges({ idField: 'id' });
/*     .pipe(
      map(actions => actions.map(post => {
         const age = this.calcUserAge(post.createdDate);
         return { age, ...user } as FirebaseListingItemModel;
       })
     )); */
  }

  /*
    Firebase User Details Page
  */
  // Concat the userData with the details of the userSkills (from the skills collection)
  public getCombinedItemDataSource(itemId: string): Observable<FirebaseCombinedItemModel> {
    return this.getItem(itemId)
    .pipe(
      // Transformation operator: Map each source value (user) to an Observable (combineDataSources | throwError) which
      // is merged in the output Observable
      concatMap(item => {
        console.log("getItem",item);
        //item.imagesFullPath = [""];
        if (item && !(item.imagesFullPath.length == 0)) {
          console.log("getItem",item);
          // Map each skill id and get the skill data as an Observable
          const itemPhotosObservables: Array<Observable<FirebasePhotoModel>> = item.imagesFullPath.map(photoPath => {
            return this.getPic(photoPath).pipe(first());
          });

          // Combination operator: Take the most recent value from both input sources (of(user) & forkJoin(userSkillsObservables)),
          // and transform those emitted values into one value ([userDetails, userSkills])
          return combineLatest([
            of(item),
            forkJoin(itemPhotosObservables)
          ]).pipe(
            map(([userDetails, userPhotos]: [FirebaseItemModel, Array<FirebasePhotoModel>]) => {
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...userDetails,
                photos: userPhotos
              } as FirebaseCombinedItemModel;
            })
          );
        }
         else if (item && (item.imagesFullPath.length == 0)){
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

      /*.pipe(
      // Transformation operator: Map each source value (user) to an Observable (combineDataSources | throwError) which
      // is merged in the output Observable
      concatMap(user => {
        if (user && user.skills) {
          // Map each skill id and get the skill data as an Observable
          const userSkillsObservables: Array<Observable<FirebaseSkillModel>> = user.skills.map(skill => {
            return this.getSkill(skill).pipe(first());
          });

          // Combination operator: Take the most recent value from both input sources (of(user) & forkJoin(userSkillsObservables)),
          // and transform those emitted values into one value ([userDetails, userSkills])
          return combineLatest([
            of(user),
            forkJoin(userSkillsObservables)
          ]).pipe(
            map(([userDetails, userSkills]: [FirebaseUserModel, Array<FirebaseSkillModel>]) => {
              // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
              return {
                ...userDetails,
                skills: userSkills
              } as FirebaseCombinedUserModel;
            })
          );
        } else {
          // Throw error
          return throwError('User does not have any skills.');
        }
      })
    );*/
  
  public getCombinedItemStore(dataSource: Observable<FirebaseCombinedItemModel>): DataStore<FirebaseCombinedItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: FirebaseCombinedItemModel = new FirebaseCombinedItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

  // tslint:disable-next-line:max-line-length
  /*
  public getRelatedUsersDataSource(combinedUserDataSource: Observable<FirebaseCombinedUserModel & ShellModel>): Observable<Array<FirebaseListingItemModel>>  {
    return combinedUserDataSource
    .pipe(
      // Filter user values that are not shells. We need to add this filter if using the combinedUserDataStore timeline
      filter(user => !user.isShell),
      concatMap(user => {
        if (user && user.skills) {
          // Get all users with at least 1 skill in common
          const relatedUsersObservable: Observable<Array<FirebaseListingItemModel>> =
          this.getUsersWithSameSkill(user.id, user.skills);

          return relatedUsersObservable;
        } else {
          // Throw error
          return throwError('Could not get related user');
        }
      })
    );
  }

  public getRelatedUsersStore(dataSource: Observable<Array<FirebaseListingItemModel>>): DataStore<Array<FirebaseListingItemModel>> {
    // Initialize the model specifying that it is a shell model
    const shellModel: Array<FirebaseListingItemModel> = [
      new FirebaseListingItemModel(),
      new FirebaseListingItemModel(),
      new FirebaseListingItemModel()
    ];

    this.relatedUsersDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.relatedUsersDataStore.load(dataSource);

    return this.relatedUsersDataStore;
  }*/

  /*
    Firebase Create User Modal
  */

//LA_2019_11 I put async here.. without it the modal will not dismiss
    public async createItem(itemData : FirebaseItemModel,postImages : PhotosArray[])/* : Promise<DocumentReference>*/{    
    this.afs.collection('posts').add({...itemData}).then(async (res)=>{
      console.log("post id :",res.id);
      let imagesFullPath = [];
      for (var i = 0; i < postImages.length; i++) {
        await this.uploadToStorage(postImages[i].photo,res.id).then(res => {
         imagesFullPath.push(res.metadata.fullPath);
         if(postImages[i].isCover == true){
         itemData.coverPhoto = res.metadata.fullPath;
         }
      } 
      ).catch(err=> {console.log("Error uploading photo: ",err)}); 
  }
  
  if (imagesFullPath.length != 0){
    if(!itemData.coverPhoto){
      itemData.coverPhoto = imagesFullPath[0];
      }
    itemData.imagesFullPath = imagesFullPath;  
  }
    else{
      itemData.coverPhoto = "images/no_image.jpeg";
    } 
    return this.afs.collection('posts').doc(res.id).set({...itemData});
    } 
    );
    return;
    } 
   private uploadToStorage(itemDataPhoto,id) : AngularFireUploadTask {
        console.log("Uploaded",itemDataPhoto);
        let newName = `${new Date().getTime()}.jpeg`;
        console.log("kess eiri 3arssa");        
        //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
        return this.afstore.ref(`images/posts/${id}/${newName}`).putString(itemDataPhoto, 'data_url', { contentType: 'image/jpeg' });
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

  public async updateItem(itemData: FirebaseItemModel, postImages : PhotosArray[]): Promise<void> {
    itemData.coverPhoto = "images/no_image.jpeg";
    console.log("111",postImages);
    console.log("222",itemData);
    //this.afs.collection('posts').add({...itemData}).then(async (res)=>{
      //console.log("post id :",res.id);
      let imagesFullPath = [];
      //itemData.imagesFullPath = [];
      //update DB not working without await here
      for (var i = 0; i < postImages.length; i++) {
        if (postImages[i].photoStoragePath == "") {
         await this.uploadToStorage(postImages[i].photo,itemData.id).then(res => {
          imagesFullPath.push(res.metadata.fullPath);
          if(postImages[i].isCover == true){
         itemData.coverPhoto = res.metadata.fullPath;
         }
      } 
      ).catch(err=> {console.log("Error uploading photo: ",err)}); 
    }
    if(postImages[i].isCover == true){
      itemData.coverPhoto = postImages[i].photoStoragePath;
      }
  }
  
  if (imagesFullPath.length != 0){
    //itemData.imagesFullPath = [];
    
  //for (var i = 0; i < postImages.length; i++) {    
    itemData.imagesFullPath.push(...imagesFullPath);    
    /* if(!itemData.coverPhoto){
      itemData.coverPhoto = imagesFullPath[0];
      } */
  }

  return this.afs.collection('posts').doc(itemData.id).set({...itemData});
    }



  /*
    Firebase Select User Image Modal
  */
  public getAvatarsDataSource(): Observable<Array<ItemImageModel>> {
    return this.afs.collection<ItemImageModel>('avatars').valueChanges();
  }

  public getAvatarsStore(dataSource: Observable<Array<ItemImageModel>>): DataStore<Array<ItemImageModel>> {
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
  }

  /*
    FireStore utility methods
  */
  // Get list of all available Skills (used in the create and update modals)
  public getSkills(): Observable<Array<FirebaseSkillModel>> {
    return this.afs.collection<FirebaseSkillModel>('skills').valueChanges({ idField: 'id' });
  }

  // Get data of a specific Skill
  private getSkill(skillId: string): Observable<FirebaseSkillModel> {
    return this.afs.doc<FirebaseSkillModel>('skills/' + skillId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const data = a.payload.data();
        const id = a.payload.id;
        return { id, ...data } as FirebaseSkillModel;
      })
    );
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

  // Get all users who share at least 1 skill of the user's 'skills' list
  /* private getUsersWithSameSkill(userId: string, skills: Array<FirebaseSkillModel>): Observable<Array<FirebaseListingItemModel>> {
    // Get the users who have at least 1 skill in common
    // Because firestore doesn't have a logical 'OR' operator we need to create multiple queries, one for each skill from the 'skills' list
    const queries = skills.map(skill => {
      return this.afs.collection('users', ref => ref
      .where('skills', 'array-contains', skill.id))
      .valueChanges({ idField: 'id' });
    });

    // Combine all these queries
     return combineLatest(queries).pipe(
      map((relatedUsers: FirebaseListingItemModel[][]) => {
        // Flatten the array of arrays of FirebaseListingItemModel
        const flattenedRelatedUsers = ([] as FirebaseListingItemModel[]).concat(...relatedUsers);

        // Removes duplicates from the array of FirebaseListingItemModel objects.
        // Also remove the original user (userId)
        const filteredRelatedUsers = flattenedRelatedUsers
        .reduce((accumulatedUsers, user) => {
          if ((accumulatedUsers.findIndex(accumulatedUser => accumulatedUser.id === user.id) < 0) && (user.id !== userId)) {
            return [...accumulatedUsers, user];
          } else {
            // If the user doesn't pass the test, then don't add it to the filtered users array
            return accumulatedUsers;
          }
        }, ([] as FirebaseListingItemModel[]));

        return filteredRelatedUsers;
      })
    ); 
  } */

  private calcUserAge(dateOfBirth: number): number {
    return dayjs(Date.now()).diff(dayjs.unix(dateOfBirth), 'year');
  }

/*   uploadToStorage(information) : AngularFireUploadTask {
    console.log("Uploaded");
    let newName = `${new Date().getTime()}.txt`;

    return this.afstore.ref(`files/${newName}`).putString(information);
  } */

  private deleteItemStorage(storagePath : string[]) {
    var storageRef = this.afstore.storage.ref();
    storagePath.forEach(item => {
      storageRef.child(item).delete().then(function() {
    console.log(item,"success");
    }).catch(function(error) {
      console.log(error,"problem deleting storage" + item);
    });
  });
  }

  public deleteItem(item: FirebaseItemModel): Promise<void> {
    if(item.imagesFullPath){
      if(item.imagesFullPath.length >= 0){
      this.deleteItemStorage(item.imagesFullPath);
    }
    }
    return this.afs.collection('posts').doc(item.id).delete();
    
  }

  getPics(imagesFullPath : string){
    for (let index = 0; index < imagesFullPath.length; index++) {
     this.afstore.ref(imagesFullPath[index]).getDownloadURL();//.toPromise().then(DownloadURL => { this.photoSlider[index] = DownloadURL } );
    }
    //console.log('photoSlider',this.photoSlider);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  }

  getPic(imagesFullPath : string){
     return this.afstore.ref(imagesFullPath).getDownloadURL();//.toPromise().then(DownloadURL => { this.photoSlider[index] = DownloadURL } );
    
    //console.log('photoSlider',this.photoSlider);
    //ref.getDownloadURL().subscribe(DownloadURL=>{console.log("DownloadURL:",DownloadURL)});
    //return this.photoSlider;
  }
  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      spinner: "bubbles",
      duration: 5000,
      message: 'Please wait...',
      translucent: true,    
      cssClass: 'custom-class custom-loading'
    });
    await loading.present();
    return loading;
  }
  async presentToast(text : string){
    const toast = await this.toastController.create({
      message : text,
      duration : 500
    });
    await toast.present();  
  }


  
}
