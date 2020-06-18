import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {
  firstname: string;
  lastname: string;
  typeId: string;
  createDate :string;
  subject: string;
  details: string;
  createdBy: string;
  status: string;

  constructor() {
    super();
  }
}