import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { PageGuard } from '../auth/page.guard';
//import { SignInGuard } from '../auth/signin.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    //canLoad: [PageGuard],
    children: [
       {
        path: '',
        redirectTo: 'start-menu',
        pathMatch: 'full'
      },  
      {
        path: 'start-menu',
        children: [
          {
            path: '',
            loadChildren: () => import('../start-menu/start-menu.module').then(m => m.StartMenuPageModule), canActivate: [PageGuard]
          },
          {
            path: 'announcements',
            loadChildren: () => import('../announcements/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard],
          },
          {
            path: 'announcements/details/:id',
            loadChildren: () => import('../announcements/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'reservations',
            loadChildren: () => import('../reservations/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard],
          },
          {
            path: 'reservations/details/:id',
            loadChildren: () => import('../announcements/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'tickets',
            loadChildren: () => import('../tickets/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'tickets/details/:id',
            loadChildren: () => import('../tickets/ticket/details/ticket-details.module').then(m => m.TicketDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'events',
            loadChildren: () => import('../events/listing/firebase-listing.module').then(m => m.EventsListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'events/details/:id',
            loadChildren: () => import('../events/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'users',
            loadChildren: () => import('../users/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'users/details/:id',
            loadChildren: () => import('../users/user/details/firebase-user-details.module').then(m => m.FirebaseUserDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'priests',
            loadChildren: () => import('../priests/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'priests/details/:id',
            loadChildren: () => import('../priests/priest/details/firebase-user-details.module').then(m => m.FirebaseUserDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'problems',
            loadChildren: () => import('../problems/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'problems/details/:id',
            loadChildren: () => import('../problems/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'problems/create',
            loadChildren: () => import('../problems/item/create/firebase-item-create.module').then(m => m.FirebaseItemCreatePageModule), canActivate: [PageGuard] 
          },
          {
            path: 'churchs',
            loadChildren: () => import('../churchs/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'churchs/details/:id',
            loadChildren: () => import('../churchs/church/details/details.module').then(m => m.BuildingDetailsPageModule), canActivate: [PageGuard] 
          }  
        ]
      },
      {
        path: 'profil/:id',
        children: [
          {
            path: '',           
            loadChildren: () => import('../users/user/profil/firebase-user-details.module').then(m => m.UserProfilPageModule), canActivate: [PageGuard] 
          }          
        ]
      },
      {
        path: 'buildingProfil/:id',
        children: [
          {
            path: '',
            loadChildren: () => import('../churchs/church/profil/details.module').then(m => m.BuildingProfilPageModule), canActivate: [PageGuard] 
          }          
        ]
      },
      {
        path: 'notifications',
        children: [
          {
            path: '',
            loadChildren: () => import('../notifications/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          }
        ]
      }
    ]
  }
];

 @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
}) 

/* @NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [ ]
}) */

export class TabsPageRoutingModule {}
