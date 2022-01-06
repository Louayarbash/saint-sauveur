import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
// import dayjs from 'dayjs';
import { FirebaseService } from '../../firebase-integration.service';
import { BuildingModel } from '../building.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { UpdateBuildingModal } from '../update/update.modal';
import { InviteModal } from '../invite/invite.modal';
import { DataStore, ShellModel } from '../../../shell/data-store';
// import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from "../../../services/login/login.service"
import { Parkings, Services} from '../../../type';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-building-details',
  templateUrl: './details.page.html'
})
export class BuildingDetailsPage implements OnInit {
  item: BuildingModel;
  status: string;
  parkings: Parkings[];
  services: Services[];
  enableAnnouncement: string;
  enableEvent: string;
  enableTicket: string;
  userIsAdmin = false;
  country: any;
  enableDonate: any;
  enablePriest: any;
  enableReservation: any;

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
    private routerOutlet: IonRouterOutlet,
    private menu: MenuController
  ) { }

  ngOnInit() {
    this.menu.enable(true); 
    //console.log("louay",this.item);
    this.userIsAdmin = this.loginService.isUserAdmin();
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<BuildingModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
       
          this.item = state;

          if (!this.item.isShell){
          this.country = this.featureService.getCountryName(this.item.country);
          this.enableDonate = this.item.enableDonate ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          this.enablePriest = this.item.enablePriest ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          this.enableAnnouncement = this.item.enableAnnouncement ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          this.enableReservation = this.item.enableReservation ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          this.enableEvent = this.item.enableEvent ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          this.enableTicket = this.item.enableTicket ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;

          this.services = this.item.services;
  
          switch (this.item.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "inactive" : this.status = this.featureService.translations.InActive;
            break;
            default:
              this.status = "Undefined";
          }

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

  async updateModal() {
    const modal = await this.modalController.create({
      component: UpdateBuildingModal,
      componentProps: {
        'item': this.item
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }

  async inviteModal() {
    const modal = await this.modalController.create({
      component: InviteModal,
      componentProps: {
        'item': this.item
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }
  
}
