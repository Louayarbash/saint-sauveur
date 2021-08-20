import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ComponentsModule } from '../components/components.module';
import { environment } from '../../environments/environment';

const firebaseRoutes: Routes = [
  {
    path: 'listing',
    loadChildren: () => import('./listing/firebase-listing.module').then(m => m.FirebaseListingPageModule)
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
   // ChatModal
    //FirebaseCreateUserModal,
    //FirebaseUpdateUserModal,
    ///SelectUserImageModal,
 // ],
  //declarations: [
  //  ChatModal
    //FirebaseCreateUserModal,
    //FirebaseUpdateUserModal,
    //SelectUserImageModal,
//  ]
})
export class FirebaseIntegrationModule {}
