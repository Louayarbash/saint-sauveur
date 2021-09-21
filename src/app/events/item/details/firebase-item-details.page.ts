import { Component, OnInit } from '@angular/core';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { LoginService } from "../../../services/login/login.service"
import { DataStore } from '../../../shell/data-store';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html'
})

export class FirebaseItemDetailsPage implements OnInit {
  item: FirebaseItemModel;
  userIsAdmin = false;
  ltr: boolean;

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private file:File,
    private fileOpener:FileOpener,
    private transfer : FileTransfer,
    private loginService: LoginService,
    private routerOutlet: IonRouterOutlet
  ) {}

  ngOnInit() {
    this.ltr= this.loginService.getUserLanguage() == 'ar' ? false : true;    
    this.userIsAdmin = this.loginService.isUserAdmin();
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseItemModel> = resolvedDataStores.item;
      combinedDataStore.state.subscribe(
         async (state) => {
          this.item = state;
        } 
      );
    });
  }

  async openFirebaseUpdateModal() {
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as FirebaseItemModel
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }

  async openPDF(i:number){
    console.log(i);
    let filePath : string;
    await this.firebaseService.afstore.ref(this.item.files[i].storagePath).getDownloadURL()
    .toPromise()
    .then((a)=>{  console.log('getDownloadURL',a); filePath = a;}).catch(err=>{console.log('Error:',err); });
    const fileTransfer = this.transfer.create();
    fileTransfer.download(filePath, this.file.dataDirectory + 'file.pdf').then((entry) => {
      console.log('download complete: ' + entry.toURL());
      let url = entry.toURL();
      this.fileOpener.open(url,'application/pdf');
    }, (error) => {
      console.log('error: ' + error);
    }).catch(err => console.log(err));
    }

}
