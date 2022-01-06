import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, throwError, combineLatest } from 'rxjs';
import { map, concatMap, first } from 'rxjs/operators';
import { DataStore, ShellModel } from '../shell/data-store';

import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { TicketModel, FirebaseCombinedTicketModel } from './ticket/ticket.model';
//import { UserImageModel } from './user/select-image/user-image.model';
//import { LoginService } from '../services/login/login.service';
import { UserModel } from '../users/user/user.model';
import { LoginService } from "../services/login/login.service"

@Injectable()
export class FirebaseService {
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedItemDataStore: DataStore<TicketModel>;
  // private relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<UserImageModel>>;
  private tableName = "tickets";

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

  public getCombinedItemDataSource(id: string): Observable<TicketModel> {
    return this.getItem(id) 
    .pipe(
      concatMap(item => {
        const creatorDetails  = this.afs.doc<UserModel>( 'users/' + item.createdBy).valueChanges().pipe(first()).pipe(map(res => {return res}))
        if (item){
          return combineLatest([
           of(item),
           creatorDetails,
         ]).pipe(
           map(([ticketDetails, creatorDetails]: [TicketModel, UserModel]) => {
             // Spread operator (see: https://dev.to/napoleon039/how-to-use-the-spread-and-rest-operator-4jbb)
             return {
               ...ticketDetails,
               creatorDetails : creatorDetails
             } as FirebaseCombinedTicketModel;
           })
         );
       } 
       else {
        // Throw error
        return throwError('User does not have any skills.');
      }
    })
  );
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
  }
  
  public getCombinedItemStore(dataSource: Observable<TicketModel>): DataStore<TicketModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: TicketModel = new TicketModel();

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

  private getItem(id: string): Observable<TicketModel> {
    return this.afs.doc<TicketModel>(this.tableName + '/' + id)
    .snapshotChanges()
    .pipe(
      map(a => {
        const itemData = a.payload.data();
        const id = a.payload.id;
        return { id, ...itemData } as TicketModel;
      })
    );
  }

 // getItem(tableName : string, itemId: string): Observable<any> {
 // console.log("getItem", itemId);
 // return this.afs.doc<any>( tableName + '/' + itemId).valueChanges();
  /*  .snapshotChanges()
     .pipe(
      map(a => {
        const postData = a.payload.data();
        const id = a.payload.id;
        return { id, ...postData };
      })
    ); */
 // }
}
