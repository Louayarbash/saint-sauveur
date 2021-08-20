import { ShellModel } from '../../shell/data-store';

export class NotificationItemModel extends ShellModel {
  id : string;
  type: string;
  subType:string;
  action: string;
  creatorName : string;
  createdBy : string;
  createDate : firebase.firestore.FieldValue;
  status : string;
  buildingId: string;

  constructor() {
    super();
  }
}



