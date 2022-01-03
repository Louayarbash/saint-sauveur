import { ShellModel } from '../../shell/data-store';

//import { firebase } from '@firebase/app';

export class UserModel extends ShellModel {
  id: string;
  photo: string;
  firstname: string;
  lastname: string;
  role: string;
  email: string;
  phone: number;
  birthdate: number;
  language: string;
  enableNotifications: boolean;
  tokens: string[];
  status: string;
  createDate : firebase.firestore.FieldValue
  modificationDate : firebase.firestore.FieldValue;
  createdBy: string;
  
  constructor() {
    super();
  }
}
