import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  id : string;
  date:string;
  startDate:string;
  endDate:string;
  status:string;
  createdBy:string;
  responseBy:string;
  note:string;
  createDate : string;
  listingDetails : string;
  
  constructor() {
    super();
  }
}