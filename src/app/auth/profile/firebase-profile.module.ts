import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../components/components.module';
import { FirebaseProfilePageGuard } from './firebase-profile-can-activate.guard';
import { FirebaseProfilePage } from './firebase-profile.page';
import { FirebaseProfileResolver } from './firebase-profile.resolver';

const routes: Routes = [
  {
    path: '',
    component: FirebaseProfilePage,
    canActivate: [FirebaseProfilePageGuard],
    resolve: {
      data: FirebaseProfileResolver
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
  declarations: [
    FirebaseProfilePage
  ],
  providers: [
    FirebaseProfilePageGuard,
    FirebaseProfileResolver
  ]
})
export class FirebaseProfilePageModule {}
