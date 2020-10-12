import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first } from 'rxjs/operators';
//import * as dayjs from 'dayjs';
import { DataStore } from '../shell/data-store';

import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { ItemModel, userModel, combinedItemModel } from './item/firebase-item.model';
//import { ItemImageModel } from './item/select-image/item-image.model';

import { AngularFireStorage } from "@angular/fire/storage";
import { LoginService } from "../services/login/login.service"
import { FeatureService } from '../services/feature/feature.service'; 
import { Router } from '@angular/router';

//import { firestore} from "firebase-admin";
//import { CompileShallowModuleMetadata } from '@angular/compiler';
//import { OneSignal, OSNotification } from "@ionic-native/onesignal/ngx";

@Injectable()
export class FirebaseService {
  // Listing Page
  private tableName = "deals";
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
/*           this.loginService.getAuthID().subscribe(user=> {
          this.loginService.initializeApp(user.uid).then(()=>
          console.log('App juste reinitialized')
        ) 
       }); */

    }
      
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {

     return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.where('buildingId', '==', this.loginService.getBuildingId()).orderBy('createDate', 'desc')).valueChanges({  idField: 'id' })
    //this.loginService.getUserInfo();
    //console.log("building inside deal service",this.loginService.getBuildingId());
    
    
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
 
   public  getCombinedItemDataSource(itemId: string): Observable<combinedItemModel> {

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

          return {
          ...userDetails,
          userInfoCreator : userInfoRequ,
          userInfoResponder : userInfoResp
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
        return this.afs.doc<userModel>('users/'+ userId)
        .snapshotChanges()
        .pipe(
          map(a => {
            const data = a.payload.data();
            const id = a.payload.id;
            return { id, ...data } as userModel;
          })
        );  
    }
      // Get data of a specific User
  private getItem(itemId: string): Observable<ItemModel> {

    return this.afs.doc<ItemModel>(this.tableName+'/' + itemId)
    .snapshotChanges()
    .pipe(
      map(a => {

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
     if(itemData.type == "request"){
      for (let index = 1; index <= count ; index++) {
        itemData.count = index + "/" + count;
        this.afs.firestore.collection(this.tableName).add({...itemData}).then(() => {
        if(count == index){
          this.featureService.presentToast(this.featureService.translations.RequestAddedSuccessfully, 2000)
        }
        }
        ).catch(err => {
          console.log(err)
          this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
        });            
      }  
     }
     else if(itemData.type == "offer"){
      itemData.count = "1";
      this.afs.firestore.collection(this.tableName).add({...itemData}).then(() => {
        this.featureService.presentToast(this.featureService.translations.OfferAddedSuccessfully,2000)
      }
      ).catch(err => {
        console.log(err)
        this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      });   
     }         
    
  }

  /*
    Firebase Update User Modal
  */
    public updateItemWithoutOptions(itemData: ItemModel): Promise<void> {
    return this.afs.collection(this.tableName).doc(itemData.id).set(itemData);
    }

    public async updateItem(itemId : string, itemDataNote: string): Promise<void> {

    // console.log("itemData",itemData);
    
    return this.afs.collection(this.tableName).doc(itemId).update({note : itemDataNote});
    //return this.afs.collection(this.tableName).doc(itemData.id).set({...itemData});
    }


  public proposeParking(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {
          let oldStatus = doc.data().status;
          let newStatus = "accepted";
          if (oldStatus == "new"){
            tran.update(itemRef, { parkingInfo : itemData.parkingInfo, status: newStatus, responseBy:this.loginService.getLoginID()});
            //console.log("changed");
            this.featureService.presentToast(this.featureService.translations.RequestResponded, 2000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Status changed to ' + newStatus);
          } else {
            this.featureService.presentToast(this.featureService.translations.RequestAlreadyResponded, 2000);
            this.router.navigate(['deal/listing']);
            //console.log("not changed");
            return Promise.reject(this.featureService.translations.RequestRespondedOrCanceled);
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
            let newStatus = "canceled"; // newRequestCanceled
            tran.update(itemRef, {status: newStatus});            
            this.featureService.presentToast(this.featureService.translations.RequestCanceled, 2000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('NewRequestCanceled!' + newStatus);
          }
          else if (oldStatus == "accepted"){
            let newStatus = "canceled"; // acceptedRequestCanceled
            tran.update(itemRef, {status: newStatus});            
            this.featureService.presentToast(this.featureService.translations.RequestAcceptedCanceled, 2000);
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

  public cancelRequestDeal(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {          
          let oldStatus = doc.data().status;          
          if (oldStatus == "accepted"){ //and not started 
            let newStatus = "new"; 
            tran.update(itemRef, {status: newStatus, responseBy:""});            
            this.featureService.presentToast(this.featureService.translations.RequestDealCanceled, 2000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Your deal is canceled!' + newStatus);
          }
          else {        
            this.featureService.presentToast(this.featureService.translations.RequestCantCancelDeal, 2000);
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

  public acceptOffer(itemData: ItemModel) {
    let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
    this.afs.firestore.runTransaction(tran => {
      return tran.get(itemRef)
        .then(doc => {
          let oldStatus = doc.data().status;
          let newStatus = "accepted";
          if (oldStatus == "new"){
            tran.update(itemRef, { /*parkingInfo : itemData.parkingInfo,*/ status: newStatus, responseBy:this.loginService.getLoginID()});
            //console.log("changed");
            this.featureService.presentToast(this.featureService.translations.OfferAccepted, 2000);
            this.router.navigate(['deal/listing']);
            return Promise.resolve('Status changed to ' + newStatus);
          } else {
            this.featureService.presentToast(this.featureService.translations.OfferAlreadyAccepted, 2000);
            this.router.navigate(['deal/listing']);
            //console.log("not changed");
            return Promise.reject(this.featureService.translations.OfferAcceptedOrCanceled);
          }
        });
    }).then(result => {
      console.log("Transaction success:", result);
    }).catch(err => {
      console.log("Transaction failure:", err);
    });
}

public cancelOffer(itemData: ItemModel) {
  let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
  this.afs.firestore.runTransaction(tran => {
    return tran.get(itemRef)
      .then(doc => {          
        let oldStatus = doc.data().status;          
        if (oldStatus == "new"){
          let newStatus = "canceled"; // newOfferCanceled
          tran.update(itemRef, {status: newStatus});            
          this.featureService.presentToast(this.featureService.translations.OfferCanceled, 2000);
          this.router.navigate(['deal/listing']);
          return Promise.resolve('NewOfferCanceled!' + newStatus);
        }
        else if (oldStatus == "accepted"){
          let newStatus = "canceled"; // acceptedOfferCanceled
          tran.update(itemRef, {status: newStatus});            
          this.featureService.presentToast(this.featureService.translations.OfferAcceptedCanceled, 2000);
          this.router.navigate(['deal/listing']);
          return Promise.resolve('Accepted offer canceled!' + newStatus);
        }
        
      });
  }).then(result => {
    console.log("Transaction success:", result);
  }).catch(err => {
    console.log("Transaction failure:", err);
  });
}

public cancelOfferDeal(itemData: ItemModel) {
  let itemRef = this.afs.firestore.collection(this.tableName).doc(itemData.id);    
  this.afs.firestore.runTransaction(tran => {
    return tran.get(itemRef)
      .then(doc => {          
        let oldStatus = doc.data().status;          
        if (oldStatus == "accepted"){ //and not started 
          let newStatus = "new"; 
          tran.update(itemRef, {status: newStatus, responseBy:""});            
          this.featureService.presentToast(this.featureService.translations.OfferDealCanceled, 2000);
          this.router.navigate(['deal/listing']);
          return Promise.resolve('Your deal is canceled!' + newStatus);
        }
        else {        
          this.featureService.presentToast(this.featureService.translations.OfferCantCancelDeal, 2000);
          this.router.navigate(['deal/listing']);
          return Promise.reject('cant cancel this offer!');
        } 
      });
  }).then(result => {
    console.log("Transaction success:", result);
  }).catch(err => {
    console.log("Transaction failure:", err);
  });
}


}
