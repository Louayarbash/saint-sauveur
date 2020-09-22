import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs';
import { DataStore } from '../../shell/data-store';
import { FirebaseProfileModel } from './profile.model';

@Injectable()
export class FirebaseProfileResolver implements Resolve<any> {

  constructor(private firebaseAuthService: AuthService) {}

  resolve() {
    const dataSource: Observable<FirebaseProfileModel> = this.firebaseAuthService.getProfileDataSource();
    const dataStore: DataStore<FirebaseProfileModel> = this.firebaseAuthService.getProfileStore(dataSource);
    return dataStore;
  }
}
