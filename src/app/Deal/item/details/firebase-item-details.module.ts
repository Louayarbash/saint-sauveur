import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { FirebaseItemDetailsPage } from './firebase-item-details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemDetailsResolver } from './firebase-item-details.resolver';

import { PipesModule } from '../../../pipes/pipes.module';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../language/language.service';
import { FirebaseUpdateItemModal } from "../../item/update/firebase-update-item.modal";

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
    ComponentsModule,    
    PipesModule
  ],
  declarations: [FirebaseItemDetailsPage,FirebaseUpdateItemModal],
  providers: [
    FirebaseService,
    FirebaseItemDetailsResolver,
    LanguageService
  ] ,
  entryComponents: [
    FirebaseUpdateItemModal
  ] 
})
export class FirebaseItemDetailsPageModule {}
