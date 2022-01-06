import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
import { FirebaseUpdateUserModal } from '../update/firebase-update-user.modal';
import { DataStore } from '../../../shell/data-store';
import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { AuthService } from '../../../auth/auth.service';
import { ParkingInfo } from '../../../type';

@Component({
  selector: 'app-firebase-user-details',
  templateUrl: './firebase-user-details.page.html',
  styleUrls: [
    './styles/firebase-user-details.page.scss'
  ],
})

export class FirebaseUserDetailsPage implements OnInit {
  user: UserModel;
  userIsAdmin: boolean= false;
  isLoggedInUser: boolean = false;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  //relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
  birthdate : string;
  role: string;
  type: string;
  language: string;
  parkingInfo: ParkingInfo[] = [];
  status: string;
  enableNotifications: string;
  ltr: boolean;


  @HostBinding('class.is-shell') get isShell() {
    return ((this.user && this.user.isShell)) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private featureService : FeatureService,
    private loginService : LoginService,
    private routerOutlet: IonRouterOutlet,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.ltr= this.loginService.getUserLanguage() == 'ar' ? false : true;    
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<UserModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
          // console.log(state);
          this.user = state;

          if (!this.user.isShell) {
            console.log("isLoggedInUser",this.isLoggedInUser)
            console.log("user",this.user)
          this.userIsAdmin = this.loginService.isUserAdmin() ? true : false;
          this.isLoggedInUser = this.loginService.getLoginID() == this.user.id ? true : false;
          this.birthdate = dayjs(this.user.birthdate * 1000).format('DD, MMM, YYYY');
     
          switch (this.user.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "inactive" : this.status = this.featureService.translations.InActive;
            break;
            default:
              this.status = "Undefined";
      }


    }
    });
  });
}

  async openFirebaseUpdateModal() {
    const modal = await this.modalController.create({
      component: FirebaseUpdateUserModal,
      componentProps: {
        'user': this.user
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }


  
}
