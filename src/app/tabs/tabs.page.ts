import { Component } from '@angular/core';
//import { MenuController } from '@ionic/angular';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  userId: string;
  buildingId: string;
  isAdmin: boolean = false;

  constructor(
    private loginService : LoginService    
  ) {
    this.loginService.currentUserInfo.subscribe(
      userInfo => {
        this.userId= userInfo.id;
        this.isAdmin= this.loginService.isUserAdmin();//userInfo.role == 'admin' || 'globalAdmin' ? true : false;
      }
      );
  }


}
/* ionViewWillEnter() {
  this.menu.enable(true);
}

ionTabsDidChange(event) {
  // console.log('ionTabsDidChange', event);
} */
