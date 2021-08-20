import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';

import { FirebaseService } from '../firebase-integration.service';
import { NotificationListingItemModel } from './firebase-listing.model';

import { DataStore } from '../../shell/data-store';

@Injectable()
export class FirebaseListingResolver implements Resolve<any> {

  constructor(private firebaseService: FirebaseService) {}

  resolve() {
    const dataSource: Observable<Array<NotificationListingItemModel>> = this.firebaseService.getListingDataSource();

    const dataStore: DataStore<Array<NotificationListingItemModel>> = this.firebaseService.getListingStore(dataSource);

    return dataStore;
  }
}
