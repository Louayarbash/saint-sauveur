import { ShellModel } from '../../shell/data-store';

export class FirebaseUserModel extends ShellModel {
  id: string;
  photo: string;
  firstname: string;
  lastname: string;
  buildingId: string;
  app: string;
  parkings: any[];
  type: string;
  role: string;
  code: string;
  email: string;
  phone: number;
  birthdate: number;
  language: string;
  createDate : firebase.firestore.FieldValue;
  
  constructor() {
    super();
  }
}
