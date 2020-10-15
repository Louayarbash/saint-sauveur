import { ShellModel } from '../../shell/data-store';
import { Files } from '../../type'

export class FirebaseItemModel extends ShellModel {  
  id:string;
  subject: string;
  details: string;
  buildingId: string;
  createdById: string;
  createDate: firebase.firestore.FieldValue;  
  files: Array<Files> = [];
  date : string;
  dateTS : number;
  startDate : string;
  startDateTS : number;
  endDate : string;
  endDateTS : number;
  constructor() {
    super();
  }
}
