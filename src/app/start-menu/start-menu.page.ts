import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, MenuController, ModalController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';
import { InviteModal } from '../buildings/building/invite/invite.modal';
//import { AngularFireModule } from '@angular/fire';
//import { environment } from '../../environments/environment';

//const { PushNotifications } = Plugins;

@Component({
  selector: 'app-categories',
  templateUrl: './start-menu.page.html',
  styleUrls: [
    './styles/start-menu.page.scss'
  ]
})
export class StartMenuPage implements OnInit {
  userId: string;
  buildingId: string;
  username: string;
  userIsAdmin: boolean= false;
  enableDeal: boolean= false;
  enableLostFound: boolean= false;
  enablePublication: boolean= false;
  enableEvent: boolean= false;
  enableRentSale: boolean= false;
  enableTicket: boolean= false;
  enableSale: boolean= false;
  userIsLouay: boolean= false;
  

  constructor( 
    private loginService: LoginService,
    public menu: MenuController,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet
  ) {
    //this.backButtonHandler = Plugins.App.addListener('backButton', Plugins.App.exitApp)    
    //console.log('start menu constructor');
    //this.menu.enable(true); 
    
  }

  ngOnInit() {
   // this.menu.enable(true); 
    console.log("oninit Louay");  
    this.loginService.currentUserInfo.subscribe(
      userInfo => {
        this.username = userInfo.firstname;
        this.userIsAdmin= this.loginService.isUserAdmin();
        //this.userIsAdmin2= userInfo.role;
        this.userIsLouay= this.loginService.isUserLouay();
      }
      );
      
      this.loginService.currentBuildingInfo.subscribe(
        buildingInfo => {
          this.enableDeal= buildingInfo.enableDeal;
          this.enableLostFound= buildingInfo.enableLostFound
          this.enablePublication= buildingInfo.enablePublication;
          this.enableEvent= buildingInfo.enableEvent;
          this.enableRentSale= buildingInfo.enableRentSale;
          this.enableSale= buildingInfo.enableSale;
          this.enableTicket= buildingInfo.enableTicket;
        }
        );
    console.log('start menu OnInit');
    this.menu.enable(true);
    this.userId = this.loginService.getLoginID();
    this.buildingId = this.loginService.getBuildingId();
    // this.username= this.loginService.getLoginName();
    // this.userIsAdmin= this.loginService.isUserAdmin();


  }

  async inviteModal() {
    const modal = await this.modalController.create({
      component: InviteModal,
/*       componentProps: {
        'item': this.item
      }, */
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });

    await modal.present();
  }

}
