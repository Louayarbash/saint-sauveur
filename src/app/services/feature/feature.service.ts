import { Injectable } from '@angular/core';
import { ToastController,LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from '../../services/login/login.service';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  translations;
  userLanguage;
  //translate : TranslateService;
  
  constructor(    
    private toastController : ToastController,
    private loadingController : LoadingController,
    private translateee : TranslateService,
    private loginService : LoginService
    ) {
/*     this.userLanguage = this.loginService.getUserLanguage();
    console.log("1servicdes", this.userLanguage);
    //this.getTranslations();
    //this.translate.use(this.userLanguage);
    this.translate.onLangChange.subscribe(() => {
    console.log("here",this.translate.currentLang);
    this.getTranslations();
    console.log("onLangChange",this.translations);
   }); 

    console.log("2",this.translate.currentLang);
    console.log("3",this.translate);
    console.log("4",this.translations); */
    //this.getTranslations(); 
/*     this.translate.get('RequestAddedSuccessfully', {value: 'worldssss'}).subscribe((res: string) => {
      console.log('hello world',res);
      //=> 'hello world'
  }); */

    }

async presentLoadingWithOptions(duration) {
  const loading = await this.loadingController.create({
    spinner: "bubbles",
    duration: duration,
    message: this.translations.PleaseWait,
    translucent: true,    
    cssClass: 'custom-class custom-loading'
  });
  await loading.present();
  return loading;
}
async presentToast(message : string, duration : number){
  const toast = await this.toastController.create({
    message : message,
    duration : duration
  });
  await toast.present();  
}
getTranslations() {
  // get translations for this page to use in the Language Chooser Alert
  this.translateee.getTranslation(this.translateee.currentLang)
  .subscribe((translations) => {
    console.log("inside getTranslationss",translations);
    this.translations = translations;
  });
} 

}