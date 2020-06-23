import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { FirebaseItemDetailsPage } from './firebase-item-details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemDetailsResolver } from './firebase-item-details.resolver';
import { TranslateModule } from '@ngx-translate/core';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
import { SliderModal } from '../slider/slider.modal';

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
    TranslateModule,
    ComponentsModule
  ],
  declarations: [FirebaseItemDetailsPage,FirebaseUpdateItemModal,SliderModal],
  providers: [
    FirebaseService,
    FirebaseItemDetailsResolver
  ],
  entryComponents: [
    FirebaseUpdateItemModal,SliderModal
  ] 
})
export class FirebaseItemDetailsPageModule {}
