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
            path: 'sale',
            loadChildren: () => import('../sale/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard],
          },
          {
            path: 'sale/details/:id',
            loadChildren: () => import('../sale/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'deal',
            loadChildren: () => import('../deals/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'deal/details/:id',
            loadChildren: () => import('../deals/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'rent-sale',
            loadChildren: () => import('../rent-sale/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'rent-sale/details/:id',
            loadChildren: () => import('../rent-sale/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
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
            path: 'lost-found',
            loadChildren: () => import('../lost-found/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'lost-found/details/:id',
            loadChildren: () => import('../lost-found/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'announcement',
            loadChildren: () => import('../announcements/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'announcement/details/:id',
            loadChildren: () => import('../announcements/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'regulation',
            loadChildren: () => import('../regulations/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'regulation/details/:id',
            loadChildren: () => import('../regulations/item/details/firebase-item-details.module').then(m => m.FirebaseItemDetailsPageModule), canActivate: [PageGuard] 
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
            path: 'buildings',
            loadChildren: () => import('../buildings/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'buildings/invite',
            loadChildren: () => import('../buildings/building/invite/invite.module').then(m => m.InvitePageModule), canActivate: [PageGuard] 
          },
          {
            path: 'buildings/details/:id',
            loadChildren: () => import('../buildings/building/details/details.module').then(m => m.BuildingDetailsPageModule), canActivate: [PageGuard] 
          } ,
          {
            path: 'users',
            loadChildren: () => import('../users/listing/firebase-listing.module').then(m => m.FirebaseListingPageModule), canActivate: [PageGuard] 
          },
          {
            path: 'users/details/:id',
            loadChildren: () => import('../users/user/details/firebase-user-details.module').then(m => m.FirebaseUserDetailsPageModule), canActivate: [PageGuard] 
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
            loadChildren: () => import('../buildings/building/profil/details.module').then(m => m.BuildingProfilPageModule), canActivate: [PageGuard] 
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
