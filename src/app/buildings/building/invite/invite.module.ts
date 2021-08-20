import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../../components/components.module';
import { InviteModal } from './invite.modal';
//import { FirebaseService } from '../../firebase-integration.service';
import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: '',
    component: InviteModal/* ,
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
  //declarations: [FirebaseCreateItemModal,FirebaseUpdateItemModal,SliderModal],*/
  //providers: [
    //FirebaseService//,
    //FirebaseItemDetailsResolver
  //],
  //entryComponents: [
   // FirebaseUpdateItemModal,SliderModal
  //]*/
})
export class InvitePageModule {}
