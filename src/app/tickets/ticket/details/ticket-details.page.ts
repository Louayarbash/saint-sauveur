import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { TicketModel, FirebaseCombinedTicketModel} from '../ticket.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { UpdateTicketModal } from '../update/update-ticket.modal';
import { ChatModal } from '../chat/chat.modal';
import { DataStore } from '../../../shell/data-store';
// import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.page.html'
})
export class TicketDetailsPage implements OnInit {
  item: FirebaseCombinedTicketModel;
  status: string;
  type = 'other';
  bookingSection = false;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  userIsCreator: boolean;
  userIsAdmin: boolean;
  canModify: boolean = false;

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
      const combinedDataStore: DataStore<FirebaseCombinedTicketModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
       
          this.item = state;
       

          if (this.item.createDate){

          this.userIsCreator = this.item.createdBy == this.loginService.getLoginID() ? true : false;
          this.userIsAdmin = this.loginService.isUserAdmin() ? true : false;
          this.canModify = this.userIsCreator || this.userIsAdmin; 

          if(this.item.subject == 'ElevatorBooking'){
            this.bookingSection = true;
            this.date = dayjs(this.item.date * 1000).format("DD, MMM, YYYY");
            this.endDate = dayjs(this.item.endDate * 1000).format("DD, MMM, YYYY");
            this.startTime = dayjs(this.item.startDate * 1000).format("HH:mm");
            this.endTime = dayjs(this.item.endDate * 1000).format('HH:mm');
          }

          switch (this.item.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "resolved" : this.status = this.featureService.translations.Resolved;
            break;
            case "closed" : this.status = this.featureService.translations.Closed;
            break;
            default:
              this.status = "Undefined";
          }



/*           this.featureService.getItem('building', this.loginService.getBuildingId()).subscribe(item => {
            const types = item.ticketTypes;
            console.log(types);
              if (this.item.typeId) {
                  let typeCheck = types.find( (type: { id: number; }) => type.id === this.item.typeId );
                  if(typeCheck){
                    this.type = typeCheck.description;
                  }
                  else {
                    this.type = 'other';
                  }
              }   
          }); */
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
    const { creatorDetails, ...itemData } = this.item; // Remove photos and creatorDetails from the item object
    const modal = await this.modalController.create({
      component: UpdateTicketModal,
      componentProps: {
        'item': itemData as TicketModel// this.item
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
