import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {
  photo: string;
  name: string;
  birthdate: number; // timestamp
  lastname: string;
  /*age: number;*/
  id: string;
  app :string;

  constructor() {
    super();
  }
}