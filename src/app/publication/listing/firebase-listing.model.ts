import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  createdById: string;
  createDate : number;
  title : string;
  descriptionn : string;
  category:string;
  fileFullPath:any[] = [];
  constructor() {
    super();

    
  }
}