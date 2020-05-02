import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  id : string;
  date:string;
  startDate:string;
  endDate:string;
  startDateTS:number;
  endDateTS:number;
  status:string;
  createdBy:string;
  responseBy:string;
  note:string;
  createDate : string;
  startTimeCounter : string = "";
  endTimeCounter : string = "";
  startTime : string;
  endTime : string;
  
  constructor() {
    super();
  }
}