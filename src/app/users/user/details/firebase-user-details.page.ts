import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { UserModel } from '../user.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateUserModal } from '../update/firebase-update-user.modal';
import { ChatModal } from '../chat/chat.modal';
import { DataStore } from '../../../shell/data-store';
import dayjs from 'dayjs';
import { FeatureService } from '../../../services/feature/feature.service';
import { LoginService } from '../../../services/login/login.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-firebase-user-details',
  templateUrl: './firebase-user-details.page.html',
  styleUrls: [
    './styles/firebase-user-details.page.scss',
    './styles/firebase-user-details.shell.scss'
  ],
})
export class FirebaseUserDetailsPage implements OnInit {
  user: UserModel;
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  //relatedUsers: Array<FirebaseListingItemModel> & ShellModel;
  birthdate : string;
  role: string;
  type: string;
  language: string;
  userParking = [];

  @HostBinding('class.is-shell') get isShell() {
    return ((this.user && this.user.isShell) /*|| (this.relatedUsers && this.relatedUsers.isShell)*/) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    public router: Router,
    private route: ActivatedRoute,
    private featureService : FeatureService,
    private loginService : LoginService,
    private routerOutlet: IonRouterOutlet,
    private authService: AuthService
  ) { }

  ngOnInit() {


    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<UserModel> = resolvedDataStores.user;
      //const relatedUsersDataStore: DataStore<Array<FirebaseListingItemModel>> = resolvedDataStores.relatedUsers;
      combinedDataStore.state.subscribe(
        (state) => {
          console.log(state);
          this.user = state;
          this.birthdate = dayjs(this.user.birthdate * 1000).format('DD, MMM, YYYY');
          this.type = this.user.type === 'owner' ? this.featureService.translations.Owner : this.featureService.translations.Tenant;
          this.role = this.user.role === 'user' ? this.featureService.translations.RegularUser : this.featureService.translations.Admin;
          this.language = this.user.language === 'fr' ? this.featureService.translations.Frensh : this.featureService.translations.English;
          
          this.firebaseService.getItem('buildings', this.loginService.getBuildingId()).subscribe(item => {
            const levels = item.parkings;
            console.log(this.user.parkings);
              if (this.user.parkings) {
                this.userParking = this.user.parkings.map((userParking) => { 
                  
                  let levelCheck = levels.find( (level: { id: number; }) => level.id === userParking.id );
                  if(levelCheck){
                    return { id : userParking.id ,number : userParking.number , description : levelCheck.description };
                  }
                });
              }
              this.userParking = this.userParking.filter(function (res) {
                return res != null;
              });   
          });
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

  signOut() {
    this.authService.signOut().subscribe(() => {
      // Sign-out successful.
      // Replace state as we are no longer authorized to access profile page.
      this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
    }, (error) => {
      console.log('signout error', error); 
    });
  }
  
  
}
