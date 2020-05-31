import { ShellModel } from '../../shell/data-store';

export class FirebaseUserModel extends ShellModel {
  id: string;
  photo: string;
  firstname: string;
  lastname: string;
  building:string;
  app:string;
  parking:any[];
  type:string;
  role:string;
  code:string;
  email: string;
  phone: number;
  birthdate: number;
  language:string;

  constructor() {
    super();
  }
}
