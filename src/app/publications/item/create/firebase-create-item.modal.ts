import { Component, OnInit/*,ChangeDetectorRef*/ } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Validators, FormGroup, FormControl,ValidatorFn,ValidationErrors } from '@angular/forms';
import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { Chooser } from '@ionic-native/chooser/ngx';
import { Files } from '../../../type'
import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
import firebase from 'firebase/app';

@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html'
})
export class FirebaseCreateItemModal implements OnInit {
  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  files: Files[] = [];
  newName: string = "";
  nameChanging: boolean[] = [];
  voting: boolean;
  categorySelected: string = 'announcement';
  disableSubmit: boolean;

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private chooser: Chooser,
    private loginService : LoginService,
    private featureService : FeatureService
  ) { }

  ngOnInit() {
  this.disableSubmit= false;
    this.createItemForm = new FormGroup({
      subject: new FormControl('',  [
        Validators.required
      ]),
      details : new FormControl(''),
      category: new FormControl('announcement'),
      voting: new FormControl(false),
      votingResult: new FormControl(false),
      votingMessage: new FormControl('')
    },
    { validators: this.changingNameValidator }
    );
  }

  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;
  }

  votingChanged(ev:any) {
    // console.log(ev);
    this.voting = ev.detail.checked;
  }

  categoryChanged(ev:any) {
    console.log('categoryChanged', ev.detail.value);
    this.categorySelected = ev.detail.value;
  }

  selectFile(){
   this.chooser.getFile("application/pdf")
  .then(file => {
    let fileUpload : Files = {fileData:"",fileName:"",filePath:"",storagePath:""};
    let extention = file.name.slice(file.name.length-4);
    console.log("extention", extention);
    console.log(file ? file.name.slice(0,file.name.length-4) : 'canceled');
    if(extention == ".pdf"){ 
    fileUpload.fileData = file.dataURI;
    fileUpload.fileName = file.name.slice(0,file.name.length-4);
    fileUpload.filePath = file.uri;
    //this.createItemForm.get('name').setValue(file.name.slice(0,file.name.length-4));
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
    this.createItemForm.updateValueAndValidity();
    console.log(txtName);
    txtName.disabled = true;
    btnChange.disabled = false;
    btnConfirm.disabled = true;
    this.files[index].fileName = txtName.value;
    // this.featureService.presentToast("File name changed",2000);
    console.log("files after delete",this.files);    
/*      this.files.forEach( (item, index) => {
      if(item === file) {
        item.fileName = txtName.value
        console.log("files after delete",this.files);
        this.changeRef.detectChanges();
        this.firebaseService.presentToast("File name changed");
      }
    }); */
  }
  changeBtnStatus(txtName,btnChange,btnConfirm){
    txtName.disabled = false;
    btnChange.disabled = true;
    btnConfirm.disabled = false;
    this.nameChanging.push(true);
    console.log(this.nameChanging.length);
    this.createItemForm.updateValueAndValidity();
  }

  deleteFile(index){
    console.log("files",this.files);
    console.log("doc",index);
    this.files.splice(index,1);
    // this.featureService.presentToast("File removed",2000);
     /* this.files.forEach( (item, index) => {
      if(item === file) {
         this.files.splice(index,1);
        console.log("files after delete",this.files);
        this.changeRef.detectChanges();
        this.firebaseService.presentToast("File removed");
      }
    }); */
}

   createItem() {
    this.disableSubmit= true;
     if(this.categorySelected == 'announcement'){
      this.itemData.voting = this.createItemForm.value.voting;
      this.itemData.votingMessage = this.createItemForm.value.votingMessage;
      this.itemData.votingResult = this.createItemForm.value.votingResult;
     }
    this.itemData.subject = this.createItemForm.value.subject;
    this.itemData.details = this.createItemForm.value.details;
    this.itemData.buildingId = this.loginService.getBuildingId();
    this.itemData.category = this.createItemForm.value.category;
    this.itemData.createDate = firebase.firestore.FieldValue.serverTimestamp();
    this.itemData.createdById = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    const {isShell, ...itemData} = this.itemData;
    this.firebaseService.createItem(itemData, this.files)
    .then(() => {
      this.featureService.presentToast(this.featureService.translations.AddedSuccessfully, 2000);
      this.dismissModal();
      loading.then(res=>res.dismiss());  
    }).catch((err) => { 
      this.disableSubmit= false;
      this.featureService.presentToast(this.featureService.translations.AddingErrors, 2000);
      loading.then(res=>res.dismiss());  
      console.log(err);
     });          
  }

  dismissModal() {
     this.modalController.dismiss();
   }

  /*
  // cant open cloud decide not to use it
  async openFile(i : number){
     let uri;
     console.log("PDFs: ",this.files);
     try {
      uri = await this.filePath.resolveNativePath(this.files[i].filePath); // only android
      console.log("uri",uri);
     } catch (err) {
      console.log("error",err)
      this.featureService.presentToast("Error opening file: " + err,2000);
     }
    this.fileOpener.open(uri,'application/pdf')
    .then(() => console.log('File is opened'))
    .catch(e => {this.featureService.presentToast("Error opening file",2000); console.log('Error opening file', e)});
   }
   */
  //END
}