import { ShellModel } from '../../shell/data-store';

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

  constructor() {
    super();
  }
}
