import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-categories',
  templateUrl: './start-menu.page.html',
  styleUrls: [
    './styles/start-menu.page.scss',
    './styles/start-menu.shell.scss',
    './styles/start-menu.responsive.scss'
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
  userIsAdmin2: string;

  constructor( 
    private loginService: LoginService,
    public menu: MenuController
  ) {
    console.log('start menu constructor');
    this.menu.enable(true);
    
  }

  ngOnInit() {
    
    this.loginService.currentUserInfo.subscribe(
      userInfo => {
        this.username = userInfo.firstname;
        this.userIsAdmin= this.loginService.isUserAdmin();
        this.userIsAdmin2= userInfo.role;
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