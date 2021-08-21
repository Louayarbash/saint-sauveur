import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { CreateProblemModal } from './firebase-create-item.modal';
import { FirebaseService } from '../../firebase-integration.service';
//import { FirebaseItemDetailsResolver } from './firebase-item-details.resolver';
import { TranslateModule } from '@ngx-translate/core';
//import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
//import { SliderModal } from '../slider/slider.modal';

const routes: Routes = [
  {
    path: '',
    component: CreateProblemModal/* ,
    resolve: {
      data: FirebaseItemDetailsResolver
    } */
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
  declarations: [CreateProblemModal],
  providers: [
    FirebaseService//,
    //FirebaseItemDetailsResolver
  ]/*,
  entryComponents: [
    FirebaseUpdateItemModal,SliderModal
  ]*/
})
export class FirebaseItemCreatePageModule {}
