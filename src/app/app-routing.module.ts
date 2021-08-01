import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageGuard } from './auth/page.guard';
import { SignInGuard } from './auth/signin.guard';
// import { IntroGuard } from './auth/intro.guard';


const routes: Routes = [
  // { path: '', redirectTo: 'walkthrough', pathMatch: 'full' },
  { path: '', redirectTo: 'auth/sign-in', pathMatch: 'full' },
  { path: 'walkthrough', loadChildren: () => import('./walkthrough/walkthrough.module').then(m => m.WalkthroughPageModule) },
  { path: 'start-menu', loadChildren: () => import('./start-menu/start-menu.module').then(m => m.StartMenuPageModule), canLoad: [PageGuard] },
  { path: 'users', loadChildren: () => import('./users/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'sale', loadChildren: () => import('./sale/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'reportproblem', loadChildren: () => import('./reportproblem/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  //{ path: 'invite', loadChildren: () => import('./buildings/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'rent-sale', loadChildren: () => import('./rent-sale/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'deal', loadChildren: () => import('./deals/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'tickets', loadChildren: () => import('./tickets/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'buildings', loadChildren: () => import('./buildings/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'lost-found', loadChildren: () => import('./lost-found/firebase-integration.module').then(m => m.FirebaseIntegrationModule), canLoad: [PageGuard] },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule), canLoad: [/*IntroGuard,*/ SignInGuard] },				
  { path: 'publication', loadChildren: () => import('./publications/firebase-integration.module').then(m => m.FirebaseIntegrationModule) , canLoad: [PageGuard] },
  { path: 'events', loadChildren: () => import('./events/firebase-integration.module').then(m => m.FirebaseIntegrationModule) , canLoad: [PageGuard] },																				  
  { path: 'auth/forgot-password', loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule) },
  { path: 'page-not-found', loadChildren: () => import('./page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },
  { path: '**', redirectTo: 'page-not-found' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
