import { Injectable } from '@angular/core';
import { LanguageModel } from './language.model';

@Injectable()
export class LanguageService {
  languages: Array<LanguageModel> = new Array<LanguageModel>();

   constructor() {
     this.languages.push(
      { name: 'English', code: 'en' },
      { name: 'French', code: 'fr' },
      { name: 'Arabic', code: 'ar' },
      { name: 'Spanish', code: 'es' }
     );
   }

   getLanguages() {
     return this.languages;
   }

 }
