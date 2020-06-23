import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { TicketModel } from '../ticket.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { UpdateTicketModal } from '../update/update-ticket.modal';
import { ChatModal } from '../chat/chat.modal';
import { DataStore, ShellModel } from '../../../shell/data-store';
// import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.page.html',
  styleUrls: [
    './styles/ticket-details.page.scss',
    './styles/ticket-details.shell.scss'
  ],
})
export class TicketDetailsPage implements OnInit {
  item: TicketModel;
  status: string;
  type = 'other';
  bookingSection = false;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;

  @HostBinding('class.is-shell') get isShell() {
    return ((this.item && this.item.isShell) /*|| (this.relatedUsers && this.relatedUsers.isShell)*/) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private featureService : FeatureService,
    private loginService : LoginService,
    private routerOutlet: IonRouterOutlet
  ) { }

  ngOnInit() {


    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<TicketModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
       
          this.item = state;
       

          if (this.item.createDate){
          if(this.item.subject == 'elevatorBooking'){
            this.bookingSection = this.item.subject == 'elevatorBooking' ? true : false;
            this.date = dayjs(this.item.date * 1000).format("DD, MMM, YYYY");
            this.endDate = dayjs(this.item.endDate * 1000).format("DD, MMM, YYYY");
            this.startTime = dayjs(this.item.startDate * 1000).format("HH:mm");
            this.endTime = dayjs(this.item.endDate * 1000).format('HH:mm');
          }
  
          switch (this.item.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "closed" : this.status = this.featureService.translations.Closed;
            break;
            default:
              this.status = "";
          }

          this.featureService.getItem('building', this.loginService.getBuildingId()).subscribe(item => {
            const types = item.ticketTypes;
            console.log(types);
              if (this.item.typeId) {
                  let typeCheck = types.find( (type: { id: number; }) => type.id === this.item.typeId );
                  if(typeCheck){
                    this.type = typeCheck.type;
                  }
                  else {
                    this.type = 'other';
                  }
              }   
          });
        }
        }
      );
/*       relatedUsersDataStore.state.subscribe(
        (state) => {
          this.relatedUsers = state;
        }
      ); */
    });
  }

  async openFirebaseUpdateModal() {
    const modal = await this.modalController.create({
      component: UpdateTicketModal,
      componentProps: {
        'item': this.item
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }

  async openChatModal() {
    const modal = await this.modalController.create({
      component: ChatModal,
      componentProps: {
        'item': this.item
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }
  
}
