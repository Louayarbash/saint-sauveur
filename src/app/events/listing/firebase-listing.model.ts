import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  createdById: string;
  createDate: number;
  subject: string;
  description: string;
  startDate : string;
  startDateTS : number;
  
  constructor() {
    super();

    
  }
}