import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { FirebaseService } from '../../firebase-integration.service';
import {  TicketModel } from '../ticket.model';
//import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';

import { DataStore } from '../../../shell/data-store';

@Injectable()
export class TicketDetailsResolver implements Resolve<any> {

  constructor(private firebaseService: FirebaseService) {}

  resolve(route: ActivatedRouteSnapshot) {
    const itemId = route.paramMap.get('id');

    // We created a FirebaseCombinedUserModel to combine the userData with the details of the userSkills (from the skills collection).
    // They are 2 different collections and we need to combine them into 1 dataSource.

    const combinedUserDataSource: Observable<TicketModel/*FirebaseCombinedUserModel*/> = this.firebaseService
    .getCombinedItemDataSource(itemId);

     const combinedUserDataStore: DataStore<TicketModel> = this.firebaseService
    .getCombinedItemStore(combinedUserDataSource);

    // The user details page has a section with related users, showing users with the same skills
    // For this we created another datastore which depends on the combinedUser data store
    // The DataStore subscribes to the DataSource, to avoid creating two subscribers to the combinedUserDataSource,
    // use the combinedUserDataStore timeline instead. (The timeline is a Subject, and is intended to have many subscribers)
    // Using, and thus subscribing to the timeline won't trigger two requests to the firebase endpoint
    /* const relatedUsersDataSource: Observable<Array<FirebaseListingItemModel>> = this.firebaseService
    .getRelatedUsersDataSource(combinedUserDataStore.state);

    const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = this.firebaseService
    .getRelatedUsersStore(relatedUsersDataSource); */

    return {user : combinedUserDataStore /*user: combinedUserDataStore, relatedUsers: relatedUsersDataStore*/};
  }
}
