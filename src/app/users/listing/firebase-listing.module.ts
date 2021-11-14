import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../components/components.module';

import { FirebaseListingPage } from './firebase-listing.page';
import { FirebaseService } from '../firebase-integration.service';
import { FirebaseListingResolver } from './firebase-listing.resolver';
import { TranslateModule } from '@ngx-translate/core';
import { FirebaseCreateUserModal } from "../user/create/firebase-create-user.modal";
import { InviteModal } from '../../buildings/building/invite/invite.modal';

const routes: Routes = [
  {
    path: '',
    component: FirebaseListingPage,
    resolve: {
      data: FirebaseListingResolver
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ComponentsModule,
    TranslateModule,    
    RouterModule.forChild(routes)
  ],
  declarations: [FirebaseListingPage, FirebaseCreateUserModal],
  providers: [
    FirebaseService,
    FirebaseListingResolver
  ],
  entryComponents: [
    //FirebaseCreateUserModal,
    InviteModal
  ]
})
export class FirebaseListingPageModule {}
