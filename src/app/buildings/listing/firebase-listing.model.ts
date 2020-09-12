import { ShellModel } from '../../shell/data-store';
// import { FirebaseUserModel } from '../../users/user/firebase-user.model';

export class FirebaseListingItemModel extends ShellModel {
  name: string;
  details: string;
  createdBy: string;
  createDate: firebase.firestore.FieldValue;
  status: string;
  statusTranslation: string;

  constructor() {
    super();
  }
}
