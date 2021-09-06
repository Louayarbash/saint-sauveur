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
  language: string;
  enableNotifications: boolean;
  tokens: string[];
  status: string;
  createDate : firebase.firestore.FieldValue;
  modificationDate : firebase.firestore.FieldValue;
  createdBy: string;
  
  constructor() {
    super();
  }
}
