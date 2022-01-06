import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {
  photo: string;
  firstname: string;
  birthdate: number; // timestamp
  lastname: string;
  id: string;
  app :string;
  status: string;

  constructor() {
    super();
  }
}