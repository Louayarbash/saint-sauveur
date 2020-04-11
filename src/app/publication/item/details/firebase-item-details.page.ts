import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel, FirebaseCombinedItemModel } from '../firebase-item.model';
import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';

import { DataStore, ShellModel } from '../../../shell/data-store';
import { Observable } from 'rxjs';
import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html',
  styleUrls: [
    './styles/firebase-item-details.page.scss',
    './styles/firebase-item-details.shell.scss'

  ],
})


export class FirebaseItemDetailsPage implements OnInit {
  item: FirebaseCombinedItemModel;
  //fileList : any[] = [""];

  @HostBinding('class.is-shell') get isShell() {
    return (this.item && this.item.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private file:File,
    private fileOpener:FileOpener,
    private transfer : FileTransfer
  ) { 
    }

  ngOnInit() {
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseCombinedItemModel> = resolvedDataStores.item;
      combinedDataStore.state.subscribe(
         async (state) => {
          this.item = state;
/*           console.log("fileFullPath.length",this.item.fileFullPath.length);
          if((this.item.fileFullPath.length !== 0) && !(this.item.isShell)){
                      
          } */
        }
      );
    });
  }
  async openFirebaseUpdateModal() {
    delete this.item.photos;
    delete this.item.isShell;
    const modal = await this.modalController.create({
      component: FirebaseUpdateItemModal,
      componentProps: {
        'item': this.item as FirebaseItemModel
      }
    });
    await modal.present();
  }
  async openPDF(i:number){
    console.log(i);
    let filePath : string;
    /* try {
      
    } catch (error) {
      
    } */
      
      await this.firebaseService.afstore.ref(this.item.fileFullPath[i].storagePath).getDownloadURL()
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
