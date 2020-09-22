import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components/components.module';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('./sign-in/sign-in.module').then(m => m.FirebaseSignInPageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then(m => m.FirebaseSignUpPageModule)
  },
/*   {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.FirebaseProfilePageModule)
  }, */
  {
    path: 'sign-up-first-time',
    loadChildren: () => import('./sign-up-first-time/sign-up1.module').then(m => m.FirebaseSignUp1PageModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule
  ],
  providers: [AuthService]
})
export class AuthModule {}
