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
            loadChildren: () => import('../start-menu/start-menu.module').then(m => m.StartMenuPageModule), canLoad: [PageGuard]
          },
          {
            path: 'sale',
            loadChildren: () => import('../sale/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard],
          },
          {
            path: 'sale/details/:id',
            loadChildren: () => import('../sale/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'deal',
            loadChildren: () => import('../deals/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'deal/details/:id',
            loadChildren: () => import('../deals/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'rent-sale',
            loadChildren: () => import('../rent-sale/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'rent-sale/details/:id',
            loadChildren: () => import('../rent-sale/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'tickets',
            loadChildren: () => import('../tickets/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'tickets/details/:id',
            loadChildren: () => import('../tickets/ticket/details/ticket-details.module').then(m => m.TicketDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'lost-found',
            loadChildren: () => import('../lost-found/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'lost-found/details/:id',
            loadChildren: () => import('../lost-found/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'publication',
            loadChildren: () => import('../publications/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'publication/details/:id',
            loadChildren: () => import('../publications/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'events',
            loadChildren: () => import('../events/listing/firebase-listing.module').then(m => m.EventsListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'events/details/:id',
            loadChildren: () => import('../events/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'buildings',
            loadChildren: () => import('../buildings/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'buildings/invite',
            loadChildren: () => import('../buildings/building/invite/invite.module').then(m => m.InvitePageModule), canLoad: [PageGuard] 
          },
          {
            path: 'buildings/details/:id',
            loadChildren: () => import('../buildings/building/details/details.module').then(m => m.BuildingDetailsPageModule), canLoad: [PageGuard] 
          } ,
          {
            path: 'users',
            loadChildren: () => import('../users/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'users/details/:id',
            loadChildren: () => import('../users/user/details/firebase-user-details.module').then(m => m.FirebaseUserDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'problems',
            loadChildren: () => import('../problems/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'problems/details/:id',
            loadChildren: () => import('../problems/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canLoad: [PageGuard] 
          },
          {
            path: 'problems/create',
            loadChildren: () => import('../problems/item/create/firebase-item-create.module').then(m => m.FirebaseItemCreatePageModule), canLoad: [PageGuard] 
          }  
        ]
      },
      {
        path: 'profil/:id',
        children: [
          {
            path: '',           
            loadChildren: () => import('../users/user/profil/firebase-user-details.module').then(m => m.UserProfilPageModule), canLoad: [PageGuard] 
          }          
        ]
      },
      {
        path: 'buildingProfil/:id',
        children: [
          {
            path: '',
            loadChildren: () => import('../buildings/building/profil/details.module').then(m => m.BuildingProfilPageModule), canLoad: [PageGuard] 
          }          
        ]
      },
      {
        path: 'notifications',
        children: [
          {
            path: '',
            loadChildren: () => import('../notifications/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canLoad: [PageGuard] 
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
