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
  username2: string;

  constructor( 
    private loginService: LoginService,
    public menu: MenuController
  ) {
    console.log('start menu constructor');
    this.menu.enable(true);
    
  }

  ngOnInit() {
    console.log('start menu OnInit');
    this.menu.enable(true);
    this.userId = this.loginService.getLoginID();
    this.buildingId = this.loginService.getBuildingId();
    this.username= this.loginService.getLoginName();
  }
}