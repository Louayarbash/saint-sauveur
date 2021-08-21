import { ShellModel } from '../../shell/data-store';

export class NotificationListingItemModel extends ShellModel {

  id : string;
  type: string;
  typeTranslation: string;
  creatorName : string;
  createdBy : string;
  createDate : firebase.firestore.FieldValue;
  status : string;
  buildingId: string;

  constructor() {
    super();
  }
}
