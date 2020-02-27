import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TestPage } from './test.page';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, Routes } from '@angular/router';
import { LanguageService } from '../../../language/language.service';


const routes: Routes = [
  {
    path: '',
    component: TestPage
  }
];

@NgModule({
  imports: [
/*     RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    IonicModule, */
    //TranslateModule
  ]
})
export class TestPageModule {}
