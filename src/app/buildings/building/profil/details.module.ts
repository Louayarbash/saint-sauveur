import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { BuildingDetailsPage } from './details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { BuildingDetailsResolver } from './details.resolver';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateBuildingModal } from "../update/update.modal";
//import { InviteModal } from "../invite/invite.modal";


const routes: Routes = [
  {
    path: '',
    component: BuildingDetailsPage,
    resolve: {
      data: BuildingDetailsResolver
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
  declarations: [BuildingDetailsPage/*, InviteModal*/],
  providers: [
    FirebaseService,
    BuildingDetailsResolver
  ],
  entryComponents: [
    UpdateBuildingModal/*,
    InviteModal*/
  ] 
})
export class BuildingProfilPageModule {}
