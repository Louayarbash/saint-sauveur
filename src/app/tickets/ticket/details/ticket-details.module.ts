import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../../components/components.module';

import { TicketDetailsPage } from './ticket-details.page';
import { FirebaseService } from '../../firebase-integration.service';
import { TicketDetailsResolver } from './ticket-details.resolver';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateTicketModal } from "../update/update-ticket.modal";

const routes: Routes = [
  {
    path: '',
    component: TicketDetailsPage,
    resolve: {
      data: TicketDetailsResolver
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
  declarations: [TicketDetailsPage, UpdateTicketModal],
  providers: [
    FirebaseService,
    TicketDetailsResolver
  ],
  entryComponents: [
    UpdateTicketModal
  ] 
})
export class TicketDetailsPageModule {}
