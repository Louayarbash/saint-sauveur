import { ShellModel } from '../../shell/data-store';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  coverPhoto: string;
  createdById: string;
  createDate : number;
  price : string;
  title : string;
  descriptionn : string;
  category:string;
  coverPhotoData :string;
  constructor() {
    super();

    
  }
}