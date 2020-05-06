import { ShellModel } from '../../shell/data-store';

export class FirebaseUserModel extends ShellModel {
  id: string;
  photo: string;
  name: string;
  lastname: string;
  building:string;
  app:string;
  parking:string;
  owner:string;
  code:string;
  email: string;
  phone: number;
  birthdate: number;
  language:string;

  constructor() {
    super();
  }
}
