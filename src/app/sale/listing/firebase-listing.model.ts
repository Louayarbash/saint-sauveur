import { ShellModel } from '../../shell/data-store';
import { Images } from '../../type';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  //coverPhoto: string;
  createdBy : string;
  createDate : number;
  price : string;
  object : string;
  description : string;
  coverPhotoData :string;
  images : Array<Images> = [];
  status: string;
  constructor() {
    super();
  }
}