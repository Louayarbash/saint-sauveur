import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ComponentsModule } from './components/components.module';

import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
/*LA_ add for cordova */
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Crop } from "@ionic-native/crop/ngx";
import { File } from "@ionic-native/file/ngx";
//import { File } from "@ionic-native/file-chooser";
import { ImagePicker } from '@ionic-native/image-picker/ngx'; 
import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
//import { OneSignal } from "@ionic-native/onesignal/ngx";
import { FCM } from '@ionic-native/fcm/ngx';
//import { FcmService } from 'src/app/services/fcm/fcm.service';


/*LA_ end */

//import { Firebase } from '@ionic-native/firebase';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from '@angular/fire/firestore';
//import { AngularFireMessagingModule } from '@angular/fire/messaging';											  

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
	    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    //AngularFireMessagingModule,	 
    ReactiveFormsModule,
    AppRoutingModule,
    ComponentsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    Crop,
    Camera,    
    StatusBar,
    ImagePicker,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
	    File,
    DocumentViewer,
    FileOpener,
    //FcmService,
    /*FcmService,*/
    //Firebase
    //OneSignal,
    FCM	 
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
