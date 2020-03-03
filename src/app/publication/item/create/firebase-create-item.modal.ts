import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { ModalController,AlertController,ToastController,LoadingController } from '@ionic/angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import * as dayjs from 'dayjs';
import { CheckboxCheckedValidator } from '../../../validators/checkbox-checked.validator';

import { FirebaseService } from '../../firebase-integration.service';
import { FirebaseItemModel} from '../firebase-item.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Date } from 'core-js';

import { File } from "@ionic-native/file/ngx";
import { Chooser } from '@ionic-native/chooser/ngx';
import { FileUpload } from '../../../type'




@Component({
  selector: 'app-firebase-create-item',
  templateUrl: './firebase-create-item.modal.html',
  styleUrls: [
    './styles/firebase-create-item.modal.scss',
    './styles/firebase-create-item.shell.scss'
  ],
})
export class FirebaseCreateItemModal implements OnInit {

  createItemForm: FormGroup;
  itemData: FirebaseItemModel = new FirebaseItemModel();
  files : FileUpload[] = [];
  newName : string = "";

  constructor(
    private modalController: ModalController,
    public firebaseService: FirebaseService,
    private changeRef: ChangeDetectorRef,
    private chooser: Chooser
  ) { }

  ngOnInit() {

    this.createItemForm = new FormGroup({
      title: new FormControl('', Validators.required),
      description : new FormControl(''),
      category : new FormControl('')   
      

      //skills: new FormArray([], CheckboxCheckedValidator.minSelectedCheckboxes(1)),
      //spanish: new FormControl(),
      //english: new FormControl(),
      //french: new FormControl()
    });
/*     this.firebaseService.getSkills().subscribe(skills => {
      this.skills = skills;
      // create skill checkboxes
      this.skills.map(() => {
        (this.createUserForm.controls.skills as FormArray).push(new FormControl());
      });
    }); */
  }

  //get skillsFormArray() { return <FormArray>this.createUserForm.get('skills'); }

  selectFile(){
   this.chooser.getFile("application/pdf")
  .then(file => {

    console.log("this.file",file);
    let fileUpload : FileUpload = {fileData:"",fileName:"",filePath:""};
    let extention = file.name.slice(file.name.length-4);
    console.log("extention", extention);
    console.log(file ? file.name.slice(0,file.name.length-4) : 'canceled');
    if(extention == ".pdf"){    
    fileUpload.fileData = file.dataURI;
    fileUpload.fileName = file.name.slice(0,file.name.length-4);
    this.files.push(fileUpload);        
    }
    else{
      this.firebaseService.presentToast("Only pdf is allowed");
    }
    console.log(this.files);
    console.log("this.files",this.files.length);
    }).catch((error: any) => console.error(error));
  }
  confirmChanging(index,txtName,btnChange,btnConfirm){
    console.log(txtName);
    txtName.disabled = true;
    btnChange.disabled = false;
    btnConfirm.disabled = true;
    this.files[index].fileName = txtName.value;
    this.firebaseService.presentToast("File name changed");
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

  }
/*   nameChanged(i,btnChange){
    console.log("changing text to", i);
  } */
  deleteFile(index){
    console.log("files",this.files);
    console.log("doc",index);
    this.files.splice(index,1);
    this.firebaseService.presentToast("File removed");
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
    this.itemData.createdById = this.firebaseService.auth.getLoginID();
    const loading = this.firebaseService.presentLoadingWithOptions();
    this.firebaseService.createItem(this.itemData,this.files)
    .then(() => {
      this.dismissModal();
      this.firebaseService.presentToast("post added successfully");
      loading.then(res=>res.dismiss());  
    });     
  }
  async dismissModal() {
    await this.modalController.dismiss();
   }
  //END

}
