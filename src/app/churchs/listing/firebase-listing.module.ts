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
import { CreateBuildingModal } from  '../church/create/create.modal';

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
  declarations: [FirebaseListingPage, CreateBuildingModal],
  providers: [
    FirebaseService,
    FirebaseListingResolver
  ],
  entryComponents: [
    CreateBuildingModal
  ]
})
export class FirebaseListingPageModule {}
