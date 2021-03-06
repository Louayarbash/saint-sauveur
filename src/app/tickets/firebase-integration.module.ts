import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { ComponentsModule } from '../components/components.module';
import { environment } from '../../environments/environment';

//import { FirebaseCreateUserModal } from './user/create/firebase-create-user.modal';
//import { FirebaseUpdateUserModal } from './user/update/firebase-update-user.modal';
//import { ChatModal } from './ticket/chat/chat.modal';
//import { SelectUserImageModal } from './user/select-image/select-user-image.modal';


const firebaseRoutes: Routes = [
  {
    path: 'listing',
    loadChildren: () => import('./listing/firebase-listing.module').then(m => m.FirebaseListingPageModule)
  },
  {
    path: 'details/:id',
    loadChildren: () => import('./ticket/details/ticket-details.module').then(m => m.TicketDetailsPageModule)
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
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule
  ]//,
  //entryComponents: [
    //FirebaseCreateUserModal,
    //FirebaseUpdateUserModal,
    ///SelectUserImageModal,
    //ChatModal
  //],
  //declarations: [
    //FirebaseCreateUserModal,
    //FirebaseUpdateUserModal,
    //SelectUserImageModal,
    //ChatModal
  //]
})
export class FirebaseIntegrationModule {}
