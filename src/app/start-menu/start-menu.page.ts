import { Component, OnInit } from '@angular/core';
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

  constructor( private loginService: LoginService
  ) {
    
  }

  ngOnInit() {
    this.userId = this.loginService.getLoginID();
    this.buildingId = this.loginService.getBuildingId();
  }
}