import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
import { FirebaseUpdateUserModal } from '../update/firebase-update-user.modal';
import { ChatModal } from '../chat/chat.modal';
import { DataStore } from '../../../shell/data-store';
import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { AuthService } from '../../../auth/auth.service';
import { ParkingInfo } from '../../../type';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-firebase-user-details',
  templateUrl: './firebase-user-details.page.html',
  styleUrls: [
    './styles/firebase-user-details.page.scss'
  ],
})

export class UserProfilPage implements OnInit {
  user: UserModel;
  userIsAdmin: boolean= false;
  isLoggedInUser: boolean = false;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  //relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
  birthdate : string;
  role: string;
  language: string;
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
    private alertController: AlertController,
    private menu: MenuController
  ) { }

  ngOnInit() {
 
    this.menu.enable(true);
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<UserModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
          
          // console.log(state);
          this.user = state;
/*           console.log("isLoggedInUser",this.isLoggedInUser)
          console.log("userIsAdmin",this.userIsAdmin)
          console.log("user",this.user)
          console.log("getLoginID",this.loginService.getLoginID()) */

          if (!this.user.isShell) {
          this.userIsAdmin = this.loginService.isUserAdmin() ? true : false;
          this.isLoggedInUser = this.loginService.getLoginID() == this.user.id ? true : false;
          this.birthdate = dayjs(this.user.birthdate * 1000).format('DD, MMM, YYYY');
          
          //this.role = this.user.role === 'user' ? this.featureService.translations.RegularUser : this.featureService.translations.Admin;
          this.language = this.user.language === 'fr' ? this.featureService.translations.Frensh : this.featureService.translations.English;
          this.enableNotifications = this.user.enableNotifications ? this.featureService.translations.Enabled : this.featureService.translations.Disabled;
          
          switch (this.user.status) {
            case "active" : this.status = this.featureService.translations.Active;
            break;
            case "inactive" : this.status = this.featureService.translations.InActive;
            break;
            default:
              this.status = "Undefined";
      }
      switch (this.user.role) {
        case "user" : this.role = this.featureService.translations.RegularUser;
        break;
        case "admin" : this.role = this.featureService.translations.Admin;
        break;
        case "globalAdmin" : this.role = this.featureService.translations.GlobalAdmin;
        break;
        default:
          this.role = "Undefined";
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

  async openChatModal() {
    const modal = await this.modalController.create({
      component: ChatModal,
      componentProps: {
        'user': this.user
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }

  async signOut() {


    const alert = await this.alertController.create({
      header: this.featureService.translations.LogOutHeader,
      message: this.featureService.translations.LogOutMessage,
      buttons: [
        {
          text: this.featureService.translations.Yes,
          handler: ()=> {
            this.authService.signOut().subscribe(() => {
              // Sign-out successful.
              // Replace state as we are no longer authorized to access profile page.
              this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
            }, (error) => {
              console.log('signout error', error); 
            });
          }
        }, {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }
  
  
}
