import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';
//import { AngularFireModule } from '@angular/fire';
//import { environment } from '../../environments/environment';

//const { PushNotifications } = Plugins;

@Component({
  selector: 'app-categories',
  templateUrl: './start-menu.page.html',
  styleUrls: [
    './styles/start-menu.page.scss',
    './styles/start-menu.shell.scss'
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
  userIsGlobalAdmin: boolean= false;

  constructor( 
    private loginService: LoginService,
    public menu: MenuController
  ) {
    //this.backButtonHandler = Plugins.App.addListener('backButton', Plugins.App.exitApp)    
    //console.log('start menu constructor');
    this.menu.enable(true); 
    
  }

  ngOnInit() {
    console.log("oninit Louay");
  
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
/*     PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        alert('Initializing HomePage test push notifications FAILED');
        // Show some error
      }
    }); 

    
    console.log('Initializing HomePage test push notifications 123');
    alert('Initializing HomePage test push notifications after register');
  
    PushNotifications.addListener(
      'registration',
      (token: PushNotificationToken) => {
        alert('Push registration success, token: ' + token.value);
      },
    );
  
    PushNotifications.addListener('registrationError', (error: any) => {
      alert('Error on registration: ' + JSON.stringify(error));
    });
  
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotification) => {
        alert('Push received: ' + JSON.stringify(notification));
      },
    );
  
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      },
    );
    */
    this.loginService.currentUserInfo.subscribe(
      userInfo => {
        this.username = userInfo.firstname;
        this.userIsAdmin= this.loginService.isUserAdmin();
        //this.userIsAdmin2= userInfo.role;
        this.userIsGlobalAdmin= this.loginService.isUserGlobalAdmin();
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

}
