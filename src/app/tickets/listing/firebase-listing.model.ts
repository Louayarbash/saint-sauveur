import { ShellModel } from '../../shell/data-store';
import { UserModel } from '../../users/user/user.model';

export class FirebaseListingItemModel extends ShellModel {
  reference:String;
  typeId: string;
  createDate :string;
  subject: string;
  subjectTranslation: string;
  details: string;
  createdBy: string;
  status: string;
  statusTranslation: string;
  creatorDetails : UserModel;

  constructor() {
    super();
  }
}
