import { ShellModel } from '../../shell/data-store';
import { UserModel } from '../../users/user/user.model';

export class TicketModel extends ShellModel {
  id: string;
  subject: string;
  details: string;
  photo: string;
  createdBy: string;
  createDate: firebase.firestore.FieldValue;
  typeId: number;
  status: string;
  date: number;
  startDate: number;
  endDate : number;
  reference: string;
  buildingId: string;

  constructor() {
    super();
  }
}

export class FirebaseCombinedTicketModel extends TicketModel {

  creatorDetails : UserModel;

  constructor() {
    super();
  }
}
