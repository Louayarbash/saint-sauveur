import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { ComponentsModule } from '../components/components.module';
import { environment } from '../../environments/environment';

import { FirebaseCreateItemModal } from './item/create/firebase-create-item.modal';
import { FirebaseUpdateItemModal } from './item/update/firebase-update-item.modal';
//import { SelectItemImageModal } from './item/select-image/select-item-image.modal';



const firebaseRoutes: Routes = [
  {
    path: 'listing',
    loadChildren: () => import('./listing/firebase-listing.module').then(m => m.FirebaseListingPageModule)
  },
  {
    path: 'details/:id',
    loadChildren: () => import('./item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule)
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    RouterModule.forChild(firebaseRoutes),
    //AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule
  ],
  entryComponents: [
    FirebaseCreateItemModal,
    FirebaseUpdateItemModal
  ],
  declarations: [
    FirebaseCreateItemModal,
    FirebaseUpdateItemModal
  ]
})
export class FirebaseIntegrationModule {}
