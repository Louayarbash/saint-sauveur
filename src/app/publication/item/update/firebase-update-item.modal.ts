import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, ValidatorFn,ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

//import * as dayjs from 'dayjs';

//import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel } from '../firebase-item.model';
//import { AngularFireAuth } from "@angular/fire/auth";
//import { Observable } from "rxjs";
//import { PhotosData } from '../../../type'
import { File } from "@ionic-native/file/ngx";
import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
import { FileUpload } from '../../../type'
import { Chooser } from '@ionic-native/chooser/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';

@Component({
  selector: 'app-firebase-update-item',
  templateUrl: './firebase-update-item.modal.html',
  styleUrls: [
    './styles/firebase-update-item.modal.scss',
    './styles/firebase-update-item.shell.scss'
  ],
})
export class FirebaseUpdateItemModal implements OnInit {
  // "user" is passed in firebase-details.page
  @Input() item: FirebaseItemModel;

  updateItemForm: FormGroup;
  files : FileUpload[] = [];
  newName : string = "";
  nameChanging : boolean[] = [];

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    public router: Router,
    private loginService : LoginService,
    private featureService : FeatureService,
    private alertController : AlertController,
    private chooser : Chooser,
    private file:File,
    private fileOpener:FileOpener,
    private transfer : FileTransfer
  ) { 

  }

  ngOnInit() {
    this.updateItemForm = new FormGroup({
      title: new FormControl(this.item.title,  [
        Validators.required,
        Validators.minLength(4)
      ]),
      description: new FormControl(this.item.description),
      category: new FormControl(this.item.category),
    },
    {validators: this.changingNameValidator}
    );

    if(this.item.fileFullPath){
      if(this.item.fileFullPath.length > 0){
      //this.getPics(this.item.imagesFullPath);
      //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} ); 
      
      this.files = [{fileName:"" , filePath:"", fileData:"",fileStoragePath : ""}];
      this.item.fileFullPath.map((res,index)=>{
          let file : FileUpload = {fileName:"",filePath:"", fileData:"",fileStoragePath:""};
          file.fileName = res.fileName;
          file.fileStoragePath = res.storagePath;
          this.files[index] = file;       
      });
      //loading.then(res=>{res.dismiss();});
    }
  } 
  }
  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;

  };
  dismissModal() {
   this.modalController.dismiss();
  }
  selectFile(){
    this.chooser.getFile("application/pdf")
   .then(file => {
     let fileUpload : FileUpload = {fileData:"",fileName:"",filePath:"",fileStoragePath:""};
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
       this.featureService.presentToast("Only pdf is allowed",2000);
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
     this.featureService.presentToast("File name changed",2000);
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
      header: 'Confirm',
      message: 'Do you want to delete ' + this.item.title + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {}
        },
        {
          text: 'Yes',
          handler: () => {
            this.firebaseService.deleteItem(this.item)
            .then(
              () => {
                this.dismissModal();
                this.router.navigate(['publication/listing']);
              },
              err => console.log(err)
            );
          }
        }
      ]
    });
    await alert.present();
  }

  updateItem() {
    this.item.title = this.updateItemForm.value.title;
    this.item.description = this.updateItemForm.value.description;
    const {...itemData} = this.item;

    this.firebaseService.updateItem(itemData,this.files)
    .then(
      () => this.modalController.dismiss(),
      err => console.log(err)
    );
  }
  deleteFile(index : number){ 
        //const loading = this.featureService.presentLoadingWithOptions(2000).then( res => {return res;} );
         if(this.files[index].fileStoragePath !== "") {         
         this.firebaseService.deleteFromStorage(this.files[index].fileStoragePath).then(res=> {
         console.log("before",this.item);
         this.item.fileFullPath.splice(index,1);
         console.log("after",this.item);
         this.firebaseService.updateItemWithoutOptions(this.item).then(()=> {
          this.files.splice(index,1); 
          this.featureService.presentToast("file removed from storage and DB",2000);}
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
async openFile(i:number){
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
  //END
}
