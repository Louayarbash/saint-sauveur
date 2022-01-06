import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ComponentsModule } from '../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { StartMenuPage } from './start-menu.page';
import { InviteModal } from "../churchs/church/invite/invite.modal";

const categoriesRoutes: Routes = [
  {
    path: '',
    component: StartMenuPage
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild(categoriesRoutes),
    TranslateModule,
    ComponentsModule
  ],
  declarations: [ StartMenuPage ], 
  entryComponents: [    
    InviteModal
  ] 
})
export class StartMenuPageModule {}
