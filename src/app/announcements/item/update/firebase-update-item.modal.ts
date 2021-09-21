import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
import { FeatureService } from "../../../services/feature/feature.service"
import { Files } from '../../../type'
import { Chooser } from '@ionic-native/chooser/ngx';

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html'
})

export class FirebaseUpdateItemModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: FirebaseItemModel;

  updateItemForm: FormGroup;
  files : Files[] = [];
  newName : string = "";
  nameChanging : boolean[] = [];
  voting: boolean;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    public router: Router,
    private featureService : FeatureService,
    private alertController : AlertController,
    private chooser : Chooser
  ) { }

  ngOnInit() {
    this.updateItemForm = new FormGroup({
      subject: new FormControl(this.item.subject, Validators.required),
      details: new FormControl(this.item.details),
      voting: new FormControl(this.item.voting),
      votingResult: new FormControl(this.item.votingResult),
      votingMessage: new FormControl(this.item.votingMessage)
    },
    {validators: this.changingNameValidator}
    );

    this.voting= this.item.voting;
    
    if(this.item.files){
      if(this.item.files.length > 0){
      //this.getPics(this.item.imagesFullPath);
      //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} ); 
      this.files = [{fileName:"" , filePath:"", fileData:"", storagePath : ""}];
      this.item.files.map((res,index)=>{
          let file : Files = {fileName:"",filePath:"", fileData:"", storagePath:""};
          file.fileName = res.fileName;
          file.storagePath = res.storagePath;
          this.files[index] = file;       
      });
      //loading.then(res=>{res.dismiss();});
    }
  } 
  }
  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {

    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;
  };

  votingChanged(ev:any) {
    // console.log(ev);
    this.voting = ev.detail.checked;
  }
  
  dismissModal() {
   this.modalController.dismiss();
  }

  selectFile(){
    this.chooser.getFile("application/pdf")
   .then(file => {
     let fileUpload : Files = {fileData:"",fileName:"",filePath:"", storagePath:""};
     let extention = file.name.slice(file.name.length-4);
     console.log("extention", extention);
     console.log(file ? file.name.slice(0,file.name.length-4) : 'canceled');
     if(extention == ".pdf"){    
     fileUpload.fileData = file.dataURI;
     fileUpload.fileName = file.name.slice(0,file.name.length-4);
     fileUpload.filePath = file.uri;
     console.log("file.uri",file); 
     this.files.push(fileUpload);        
     }
     else{
       this.featureService.presentToast(this.featureService.translations.OnlyPDfAllowed,2000);
     }
     console.log(this.files);
     console.log("this.files.length",this.files.length);
     }).catch((error: any) => console.error(error));
   }
   
   confirmChanging(index,txtName,btnChange,btnConfirm){
     this.nameChanging.shift();
     console.log(this.nameChanging.length)
     this.updateItemForm.updateValueAndValidity();
     console.log(txtName);
     txtName.disabled = true;
     btnChange.disabled = false;
     btnConfirm.disabled = true;
     this.files[index].fileName = txtName.value;
     //this.item.fileFullPath[index].fileName = txtName.value;
     // this.featureService.presentToast(this.featureService.translations.,2000);
     console.log("files after changing name",this.files);
   }
   changeBtnStatus(txtName,btnChange,btnConfirm){
     txtName.disabled = false;
     btnChange.disabled = true;
     btnConfirm.disabled = false;
     this.nameChanging.push(true);
     console.log(this.nameChanging.length);
     this.updateItemForm.updateValueAndValidity();
   }
  async deleteItem() {
    const alert = await this.alertController.create({
      header: this.featureService.translations.PleaseConfirm,
      message: this.featureService.translations.DeletePostConfirmation,
      buttons: [
        {
          text: this.featureService.translations.No,
          role: 'cancel',
          handler: () => {}
        },
        {
          text: this.featureService.translations.Yes,
          handler: () => {
            this.featureService.deleteItem(this.item.files, this.item.id, 'announcements')
            .then(
              () => {
                this.featureService.presentToast(this.featureService.translations.DeletedSuccessfully,2000);
                this.dismissModal();
                this.router.navigate(['app/start-menu/announcement']);
              },
              err => { 
                console.log(err);
                this.featureService.presentToast(this.featureService.translations.DeletingErrors,2000);
               }
            );
          }
        }
      ]
    });
    await alert.present();
  }

  updateItem() {

     //if(this.item.category == 'announcement'){
      this.item.voting = this.updateItemForm.value.voting;
      this.item.votingMessage = this.updateItemForm.value.votingMessage;
      this.item.votingResult = this.updateItemForm.value.votingResult;
    // }

    this.item.subject = this.updateItemForm.value.subject;
    this.item.details = this.updateItemForm.value.details;
    this.item.voting = this.updateItemForm.value.voting;
    this.item.votingResult = this.updateItemForm.value.votingResult;
    const {isShell, ...itemData} = this.item;
    this.firebaseService.updateItem(itemData as FirebaseItemModel, this.files)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.UpdatedSuccessfully,2000);
      this.modalController.dismiss();
    }
    ).catch((err)=> {
      this.featureService.presentToast(this.featureService.translations.UpdatingErrors,2000);
      console.log(err)
    });
  }
  deleteFile(index : number){ 
        //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} );
         if(this.files[index].storagePath !== "") {         
         this.featureService.deleteFromStorage(this.files[index].storagePath).then(res=> {
         console.log("before",this.item);
         this.item.files.splice(index,1);
         console.log("after",this.item);
         this.featureService.updateItemWithoutOptions(this.item, 'announcements').then(()=> {
          this.files.splice(index,1); 
          this.featureService.presentToast(this.featureService.translations.DeletedSuccessfully,2000);}
          ).catch(err=>{console.log("Error in deletePhoto Storage:",err)});  
          }
          ).catch(err => console.log("Error in deletePhoto DB: ",err));
        console.log("files after delete",this.files);
      }
      else{
        this.files.splice(index,1);
      }
      //loading.then(res=>{res.dismiss();})
}
  //END
}
