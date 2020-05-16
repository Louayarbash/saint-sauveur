import { Component, OnInit/*,ChangeDetectorRef*/ } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray,ValidatorFn,ValidationErrors } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
//import { AngularFirestore } from '@angular/fire/firestore';
import { Date } from 'core-js';

//import { File } from "@ionic-native/file/ngx";
import { Chooser } from '@ionic-native/chooser/ngx';
import { FileUpload } from '../../../type'
import { LoginService } from "../../../services/login/login.service"
import { FeatureService } from "../../../services/feature/feature.service"
//import { FileOpener } from '@ionic-native/file-opener/ngx';
//import { FilePath } from '@ionic-native/file-path/ngx';


@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})
export class FirebaseCreateItemModal implements OnInit {

  createItemForm : FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  files : FileUpload[] = [];
  newName : string = "";
  nameChanging : boolean[] = [];


  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    //private changeRef: ChangeDetectorRef,
    private chooser: Chooser,
    private loginService : LoginService,
    private featureService : FeatureService
    //private fileOpener : FileOpener,
    //private filePath : FilePath,
    //private file : File
  ) { 
    
  }

  ngOnInit() {
    this.createItemForm = new FormGroup({
      title: new FormControl('',  [
        Validators.required,
        Validators.minLength(4)
      ]),
      description : new FormControl(''),
      category : new FormControl('')
    },
    {validators: this.changingNameValidator}
    );
  }

  changingNameValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    //const name = control.get('name');
    
    return !(this.nameChanging.length == 0) ? { 'nameChanging': true } : null;

  };
  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }

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
    //this.createItemForm.get('name').setValue(file.name.slice(0,file.name.length-4));
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
    this.createItemForm.updateValueAndValidity();
    console.log(txtName);
    txtName.disabled = true;
    btnChange.disabled = false;
    btnConfirm.disabled = true;
    this.files[index].fileName = txtName.value;
    this.featureService.presentToast("File name changed",2000);
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
    this.featureService.presentToast("File removed",2000);
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
    this.itemData.title = this.createItemForm.value.title;
    this.itemData.description = this.createItemForm.value.description;
    this.itemData.category = this.createItemForm.value.category;
    this.itemData.createDate = Date.now().toString();
    this.itemData.createdById = this.loginService.getLoginID();
    const loading = this.featureService.presentLoadingWithOptions(2000);
    this.firebaseService.createItem(this.itemData,this.files)
    .then(res => {
      console.log("createItem then: ",res)
      this.dismissModal();
      this.featureService.presentToast("post added successfully",2000);
      loading.then(res=>res.dismiss());  
    });     
  }

  async dismissModal() {
    await this.modalController.dismiss();
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