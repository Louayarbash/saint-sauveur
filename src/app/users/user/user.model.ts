import { ShellModel } from '../../shell/data-store';

export class UserModel extends ShellModel {
  id: string;
  photo: string;
  firstname: string;
  lastname: string;
  buildingId: string;
  apartment: string;
  parkings: any[];
  type: string;
  role: string;
  code: string;
  email: string;
  phone: number;
  birthdate: number;
  language: string= 'en';
  status: string;
  createDate : firebase.firestore.FieldValue;
  
  constructor() {
    super();
  }
}
