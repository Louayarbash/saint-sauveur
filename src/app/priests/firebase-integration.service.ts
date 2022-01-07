import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import * as dayjs from 'dayjs';
import { DataStore } from '../shell/data-store';
import { FirebaseListingItemModel } from './listing/firebase-listing.model';
import { UserModel } from './priest/user.model';
//import { UserImageModel } from './user/select-image/user-image.model';
import { LoginService } from '../services/login/login.service';
import { FcmService } from '../services/fcm/fcm.service';



@Injectable()
export class FirebaseService {
  // Listing Page
  private listingDataStore: DataStore<Array<FirebaseListingItemModel>>;
  // User Details Page
  private combinedUserDataStore: DataStore<UserModel>;
  // private relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>>;

  private tableName = "priests";

  // Select User Image Modal
  //private avatarsDataStore: DataStore<Array<UserImageModel>>;
  

  constructor(private afs: AngularFirestore, private loginService: LoginService, private fcmService: FcmService) {}

  /*
    Firebase User Listing Page
  */
  public getListingDataSource(): Observable<Array<FirebaseListingItemModel>> {
    // return this.afs.collection<FirebaseListingItemModel>('users').valueChanges({ idField: 'id' });
    return this.afs.collection<FirebaseListingItemModel>(this.tableName, ref => ref.orderBy('createDate', 'desc')).valueChanges({ idField: 'id' })
/*      .pipe(
       map(actions => actions.map(user => {
          const age = this.calcUserAge(user.birthdate);
          return { age, ...user } as FirebaseListingItemModel;
        })
      )
    ); */
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
  // public searchUsers(lower: number, upper: number): Observable<Array<FirebaseListingItemModel>> {
    // we save the dateOfBirth in our DB so we need to calc the min and max dates valid for this query
    // const minDate = (dayjs(Date.now()).subtract(upper, 'year')).unix();
    // const maxDate =  (dayjs(Date.now()).subtract(lower, 'year')).unix();

    // const listingCollection = this.afs.collection<FirebaseListingItemModel>('users', ref =>
    //  ref.orderBy('birthdate'));
      //.startAt(minDate).endAt(maxDate));

    // return listingCollection.valueChanges({ idField: 'id' });
/*     .pipe(
      map(actions => actions.map(user => {
         const age = this.calcUserAge(user.birthdate);
         return { age, ...user } as FirebaseListingItemModel;
       })
     )); */
  // }

  /*
    Firebase User Details Page
  */
  // Concat the userData with the details of the userSkills (from the skills collection)
  public getCombinedUserDataSource(userId: string): Observable<UserModel> {
    return this.getUser(userId);
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
  
  public getCombinedUserStore(dataSource: Observable<UserModel>): DataStore<UserModel> {
    // Initialize the model specifying that it is a shell model
    const shellModel: UserModel = new UserModel();

    this.combinedUserDataStore = new DataStore(shellModel);
    // Trigger the loading mechanism (with shell) in the dataStore
    this.combinedUserDataStore.load(dataSource);

    return this.combinedUserDataStore;
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
  public createUser(userData: any): Promise<DocumentReference>  {
    // this.loginService.signup(logincredential);
    return this.afs.collection('priests').add({...userData});
  }

  /*
    Firebase Update User Modal
  */
  public async updateUser(userData: any): Promise<void> {
    console.log("updateUser", userData);

    const tokens: string | any[] = [];
    
    if(userData.enableNotifications == false){

      userData.tokens = null;
      /*let results = await this.afs.firestore.collection('devices').where('userId', '==', userData.id).get();
        results.forEach(result => {
        const id = result.id;
        this.afs.collection('devices').doc(id).delete();
      });*/
    }
    
    else if((userData.enableNotifications == true) && (userData.id == this.loginService.getLoginID()) && !(this.loginService.notificationsAllowed())){
      // console.log(userData.enableNotifications == true);
      // console.log(userData.id == this.loginService.getLoginID());
      // console.log(!(this.loginService.notificationsAllowed()));
      this.fcmService.initPushNotification();
    }
    return this.afs.collection('priests').doc(userData.id).update({...userData});
  }

  public deleteUser(userKey: string): Promise<void> {
    return this.afs.collection('priests').doc(userKey).delete();
  }

  /*
    Firebase Select User Image Modal
  */
/*  public getAvatarsDataSource(): Observable<Array<UserImageModel>> {
    return this.afs.collection<UserImageModel>('avatars').valueChanges();
  }

   public getAvatarsStore(dataSource: Observable<Array<UserImageModel>>): DataStore<Array<UserImageModel>> {
    // Use cache if available
    if (!this.avatarsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<UserImageModel> = [
        new UserImageModel(),
        new UserImageModel(),
        new UserImageModel(),
        new UserImageModel(),
        new UserImageModel()
      ];

      this.avatarsDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.avatarsDataStore.load(dataSource);
    }
    return this.avatarsDataStore;
  } */


  // Get data of a specific User
  private getUser(userId: string): Observable<UserModel> {
    return this.afs.doc<UserModel>('priests/' + userId)
    .snapshotChanges()
    .pipe(
      map(a => {
        const userData = a.payload.data();
        const id = a.payload.id;
        return { id, ...userData } as UserModel;
      })
    );
  }

/*   getItem(tableName : string, itemId: string): Observable<any> {
    console.log("getItem", itemId);
    return this.afs.doc<any>( tableName + '/' + itemId).valueChanges();

  } */
}
