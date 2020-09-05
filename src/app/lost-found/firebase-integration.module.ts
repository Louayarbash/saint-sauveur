import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { ComponentsModule } from '../components/components.module';

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
  ]/*,
  entryComponents: [
    FirebaseCreateItemModal,
    FirebaseUpdateItemModal,
    SelectItemImageModal
  ],
  declarations: [
    FirebaseUpdateItemModal,
    SelectItemImageModal
  ]*/
})
export class FirebaseIntegrationModule {}
