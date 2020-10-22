import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  createdById: string;
  subject: string;
  dateTS: number;
  startDateTS : number;
  endDateTS : number;
  
  constructor() {
    super();

    
  }
}