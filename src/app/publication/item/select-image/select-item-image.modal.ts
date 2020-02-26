import { Component, OnInit, HostBinding } from '@angular/core';
import { FirebaseService } from '../../firebase-integration.service';
import { ModalController } from '@ionic/angular';

import { ItemImageModel } from './item-image.model';
import { ShellModel } from '../../../shell/data-store';

@Component({
  selector: 'app-select-item-image',
  templateUrl: './select-item-image.modal.html',
  styleUrls: [
    './styles/select-item-image.modal.scss',
    './styles/select-item-image.shell.scss'
  ]
})
export class SelectItemImageModal implements OnInit {
  // Use Typescript intersection types to enable docorating the Array of firebase models with a shell model
  // (ref: https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types)
  avatars: Array<ItemImageModel> & ShellModel;

  @HostBinding('class.is-shell') get isShell() {
    return (this.avatars && this.avatars.isShell) ? true : false;
  }

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    const dataSource = this.firebaseService.getAvatarsDataSource();
    const dataStore = this.firebaseService.getAvatarsStore(dataSource);

    dataStore.state.subscribe(
      (state) => {
        this.avatars = state;
      },
      (error) => {}
    );
  }

  dismissModal(avatar?: ItemImageModel) {
    this.modalController.dismiss(avatar);
  }
}
