import { ShellModel } from '../../shell/data-store';

//import { firebase } from '@firebase/app';

export class UserModel extends ShellModel {
  id: string;
  photo: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: number;
  birthdate: number;
  status: string;
  createDate : firebase.firestore.FieldValue
  modificationDate : firebase.firestore.FieldValue;
  createdBy: string;
  
  constructor() {
    super();
  }
}
