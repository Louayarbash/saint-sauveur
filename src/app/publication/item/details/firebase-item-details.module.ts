import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { FirebaseItemDetailsPage } from './firebase-item-details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemDetailsResolver } from './firebase-item-details.resolver';

const routes: Routes = [
  {
    path: '',
    component: FirebaseItemDetailsPage,
    resolve: {
      data: FirebaseItemDetailsResolver
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
    ComponentsModule
  ],
  declarations: [FirebaseItemDetailsPage],
  providers: [
    FirebaseService,
    FirebaseItemDetailsResolver
  ]
})
export class FirebaseItemDetailsPageModule {}
