import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { UserProfilPage } from './firebase-user-details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseUserDetailsResolver } from './firebase-user-details.resolver';
import { TranslateModule } from '@ngx-translate/core';
import { FirebaseUpdateUserModal } from '../update/firebase-update-user.modal';

const routes: Routes = [
  {
    path: '',
    component: UserProfilPage,
    resolve: {
      data: FirebaseUserDetailsResolver
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule
  ],
  declarations: [UserProfilPage],
  providers: [
    FirebaseService,
    FirebaseUserDetailsResolver
  ] ,
  entryComponents: [
    FirebaseUpdateUserModal
  ]  
})
export class FirebaseUserDetailsPageModule {}
