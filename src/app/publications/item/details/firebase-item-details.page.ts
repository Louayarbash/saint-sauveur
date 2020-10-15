import { Component, OnInit, HostBinding } from '@angular/core';
import { ModalController, AlertController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel, FirebaseCombinedItemModel, VotingPublication } from '../firebase-item.model';
// import { FirebaseListingItemModel } from '../../listing/firebase-listing.model';
import { FirebaseUpdateItemModal } from '../update/firebase-update-item.modal';

import { DataStore, ShellModel } from '../../../shell/data-store';
// import { Observable } from 'rxjs';
// import { DocumentViewer, DocumentViewerOptions } from '@ionic-native/document-viewer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { FeatureService } from "../../../services/feature/feature.service"
import { LoginService } from "../../../services/login/login.service"
import firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-firebase-item-details',
  templateUrl: './firebase-item-details.page.html'
})


export class FirebaseItemDetailsPage implements OnInit {
  item: FirebaseCombinedItemModel;
  publicationVoting: Observable<Array<VotingPublication>>;
  countVotingObservable: Observable<{countVotingYes: number, countVotingNo: number}>;
  countVotingYes: number;
  countVotingNo: number;
  userIsAdmin = false;

  @HostBinding('class.is-shell') get isShell() {
    return (this.item && this.item.isShell) ? true : false;
  }

  constructor(
    public firebaseService: FirebaseService,
    public modalController: ModalController,
    private route: ActivatedRoute,
    private file:File,
    private fileOpener:FileOpener,
    private transfer : FileTransfer,
    private featureService : FeatureService,
    private alertController: AlertController,
    private loginService: LoginService,
    private routerOutlet: IonRouterOutlet
  ) { 
    }

  ngOnInit() {
    this.userIsAdmin = this.loginService.isUserAdmin();
    this.route.data.subscribe((resolvedRouteData) => {
      const resolvedDataStores = resolvedRouteData['data'];
      const combinedDataStore: DataStore<FirebaseCombinedItemModel> = resolvedDataStores.item;
      combinedDataStore.state.subscribe(
         async (state) => {
          this.item = state;
          if(this.item.createDate && this.item.voting){
          console.log('1',this.item.createDate);
          console.log("2", this.item.id)
          this.publicationVoting = this.featureService.getPublicationVoting(this.item.id);
          this.countVotingObservable = this.publicationVoting.pipe(map( arr => { 
          let votingYes = arr.filter(res => res.voting == 'yes')
          let votingNo = arr.filter(res => res.voting == 'no')
           //console.log("Yes",votingYes)
           //console.log("No",votingNo)
           return { countVotingYes: votingYes.length ? votingYes.length : 0, countVotingNo: votingNo.length ? votingNo.length : 0 } 
          }));
        this.countVotingObservable.subscribe(res => { this.countVotingNo = res.countVotingNo; this.countVotingYes = res.countVotingYes;})
      
      }
/*       if(this.item.createDate){
        this.userIsCreator = this.item.createdById == this.loginService.getLoginID() ? true : false;    
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
      },
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    });
    await modal.present();
  }
  async openPDF(i:number){
    console.log(i);
    let filePath : string;
    /* try {
      
    } catch (error) {
      
    } */
      
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
    async vote(voting: string){
      
      let votingInfo = new VotingPublication();
      votingInfo.publicationId = this.item.id;
      votingInfo.buildingId = this.loginService.getBuildingId();
      votingInfo.userId = this.loginService.getLoginID();
      votingInfo.voting = voting;
      votingInfo.createdDate = firebase.firestore.FieldValue.serverTimestamp();


      let message = '';
      if(voting == 'no'){
        message = this.featureService.translations.VotingConfirmationMessageNo;
      }
      else if(voting == 'yes'){
        message = this.featureService.translations.VotingConfirmationMessageYes;
      }

      const alert = await this.alertController.create({
        header: this.featureService.translations.PleaseConfirm,
        message: message,
        buttons: [
          {
           text: this.featureService.translations.OK,
           handler: ()=> {
            this.featureService.vote(votingInfo)
           }
         },
         {
           text: this.featureService.translations.Cancel,
            handler: ()=> {
             }, 
           }
       ]
      });
      await alert.present();
      
     }
}
