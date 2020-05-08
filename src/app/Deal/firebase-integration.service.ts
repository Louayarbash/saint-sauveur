import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, forkJoin, throwError, combineLatest, scheduled } from 'rxjs';
import { map, concatMap, first, filter } from 'rxjs/operators';
//import * as dayjs from 'dayjs';
import { DataStore, ShellModel } from '../shell/data-store';

import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { ItemModel, userModel, combinedItemModel } from './item/firebase-item.model';
//import { ItemImageModel } from './item/select-image/item-image.model';

import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
import { LoginService } from "../services/login/login.service"
import { FeatureService } from '../services/feature/feature.service'; 

import { Router } from '@angular/router';

//import { firestore} from "firebase-admin";

//import { CompileShallowModuleMetadata } from '@angular/compiler';
//import { OneSignal, OSNotification } from "@ionic-native/onesignal/ngx";

@Injectable()
export class FirebaseService {
  // Listing Page
  private tableName = "deals-requests";
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<ItemModel>;
  
  constructor(
    private afs: AngularFirestore, 
    public afstore : AngularFireStorage, 
    public loginService : LoginService, 
    private featureService : FeatureService,
    private router : Router    
    )  {

    }
      
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    //this.loginService.getUserInfo();
    console.log("building inside deal service",this.loginService.buildingId);
    return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.where('buildingId', '==', this.loginService.buildingId)).valueChanges({  idField: 'id' })
      //.pipe(map(actions => actions.map(item => { 
        //const listingDetails = item.id + "New parking request on " + dayjs(item.date).format("DD, MMM, YYYY") + " from " + dayjs(item.startDate).format("HH:mm") + " to " + dayjs(item.endDate).format("HH:mm");
          //const age = this.calcUserAge(post.createDate);
          // const CoverPic = this.getProfilePic(post.photo);
          //return { age, ...post } as FirebaseListingItemModel;
          //return { listingDetails, ...item } as FirebaseListingItemModel;
        //})
      //)
  //  );  
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
  // Filter users by age
/*   public searchUsersByAge(lower: number, upper: number): Observable<Array<FirebaseListingItemModel>> {
    // we save the dateOfBirth in our DB so we need to calc the min and max dates valid for this query
    const minDate = (dayjs(Date.now()).subtract(upper, 'year')).unix();
    const maxDate =  (dayjs(Date.now()).subtract(lower, 'year')).unix();

    const listingCollection = this.afs.collection<FirebaseListingItemModel>('deals-requests', ref =>
      ref.orderBy('createDate'));
      //.startAt(minDate).endAt(maxDate));

    return listingCollection.valueChanges({ idField: 'id' })
     .pipe(
      map(actions => actions.map(post => {
         const age = this.calcUserAge(post.createdDate);
         return { age, ...user } as FirebaseListingItemModel;
       })
     )); 
  } */

  /*
    Firebase User Details Page
  */
  // Concat the userData with the details of the userSkills (from the skills collection)
   public  getCombinedItemDataSource(itemId: string): Observable<combinedItemModel> {
    //return this.getItem(itemId);
    let b : Observable<userModel>;
    //let c : Observable<combinedItemModel>;
    return this.getItem(itemId).pipe(concatMap(deal => { 
      if (deal && deal.createdBy) {
          const userInfoRequObservable = this.getUser(deal.createdBy).pipe(first());
          const userInfoRespObservable = this.getUser(deal.responseBy).pipe(first());
          return combineLatest([
          of(deal),
          userInfoRequObservable,
          userInfoRespObservable
          ]).pipe(
          map(([userDetails, userInfoRequ, userInfoResp]: [ItemModel, userModel, userModel]) => {
          // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
          console.log("111",userDetails);
          console.log("222",userInfoRequ);
          console.log("333",userInfoResp);
          return {
          ...userDetails,
          userInfoRequ : userInfoRequ,
          userInfoResp : userInfoResp
        } as combinedItemModel;
      })
    );
    }
    else{
      throwError('deal or creator not found');
    }
  })
  )
  }   
    private getUser(userId: string): Observable<userModel>
    {
      console.log("hellogetUser", userId);
      
        return this.afs.doc<userModel>('users/'+ userId)
        .snapshotChanges()
        .pipe(
          map(a => {
            //console.log("hello2",a);
            const data = a.payload.data();
            const id = a.payload.id;
            console.log("LOuaydata",{ id, ...data });
            return { id, ...data } as userModel;
          })
        );  
    }
      // Get data of a specific User
  private getItem(itemId: string): Observable<ItemModel> {
    console.log("getItem", itemId);
    return this.afs.doc<ItemModel>(this.tableName+'/' + itemId)
    .snapshotChanges()
    .pipe(
      map(a => {
        console.log("hellogetItem",a);
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData } as ItemModel;
      })
    );
  }
  public getCombinedItemStore(dataSource: Observable<ItemModel>): DataStore<ItemModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: ItemModel = new ItemModel();

    this.combinedItemDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedItemDataStore.load(dataSource);

    return this.combinedItemDataStore;
  }

//LA_2019_11 I put async here.. without it the modal will not dismiss
    public async createItem(itemData : ItemModel)/* : Promise<DocumentReference>*/{     
      console.log(itemData);
      //return this.afs.collection(this.tableName).add({...itemData});
     const count =  +itemData.count;
     for (let index = 1; index <= count ; index++) {
      itemData.count = index + "/" + count;
      this.afs.firestore.collection(this.tableName).add({...itemData}).then(() => {
      this.featureService.presentToast(this.featureService.translations.RequestAddedSuccessfully + itemData.count,2000)
      }
      ).catch(err => {
        console.log(err)
        this.featureService.presentToast(this.featureService.translations.ConnectionProblem,2000);
        //loading.then(res=>res.dismiss());
      });            
    }
  }

  /*
    Firebase Update User Modal
  */
  public updateItemWithoutOptions(itemData: ItemModel): Promise<void> {
    return this.afs.collection(this.tableName).doc(itemData.id).set(itemData);
  }

  public async updateItem(itemData: ItemModel): Promise<void> {

    console.log("itemData",itemData);
    //this.afs.collection('posts').add({...itemData}).then(async (res)=>{
      //console.log("post id :",res.id);
  
  return this.afs.collection(this.tableName).doc(itemData.id).set({...itemData});
    }

/*   public deleteItem(item: FirebaseItemModel): Promise<void> {
    //this.afstore.ref(item.imagesFullPath).delete();
    console.log('deleteItem',item.id);
    return this.afs.collection(this.tableName).doc(item.id).delete();
  } */



  public proposeParking(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {
          let oldStatus = doc.data().status;
          let newStatus = "accepted";
          if (oldStatus == "new"){
            tran.update(itemRef, {status: newStatus, responseBy:this.loginService.getLoginID()});
            console.log("changed");
            this.featureService.presentToast("You responce has been sent to the requester, Thank you!",3000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Status changed to ' + newStatus);
          } else {
            this.featureService.presentToast("Request already respoded by another tenant, Thank you!",3000);
            this.router.navigate(['deal/listing']);
            console.log("not changed");
            return Promise.reject('Request has already been responded or has been canceled, thank you');
          }
        });
    }).then(result => {
      console.log("Transaction success:", result);
    }).catch(err => {
      console.log("Transaction failure:", err);
    });
  }
  public cancelRequest(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {          
          let oldStatus = doc.data().status;          
          if (oldStatus == "new"){
            let newStatus = "new request canceled";
            tran.update(itemRef, {status: newStatus});            
            this.featureService.presentToast("Your new request has been canceled!",3000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('New request canceled!' + newStatus);
          }
          else if (oldStatus == "accepted"){
            let newStatus = "accepted request canceled";
            tran.update(itemRef, {status: newStatus});            
            this.featureService.presentToast("Your accepted request has been canceled!",3000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Accepted request canceled!' + newStatus);
          }
          
        });
    }).then(result => {
      console.log("Transaction success:", result);
    }).catch(err => {
      console.log("Transaction failure:", err);
    });
  }

  public cancelDeal(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {          
          let oldStatus = doc.data().status;          
          if (oldStatus == "accepted"){ //and not started 
            let newStatus = "new"; 
            tran.update(itemRef, {status: newStatus, responseBy:""});            
            this.featureService.presentToast("You canceled your deal!",3000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Your deal is canceled!' + newStatus);
          }
          else {        
            this.featureService.presentToast("Cant cancel request!",3000);
            this.router.navigate(['deal/listing']);
            return Promise.reject('cant cancel this request!');
          } 
        });
    }).then(result => {
      console.log("Transaction success:", result);
    }).catch(err => {
      console.log("Transaction failure:", err);
    });
  }
}
