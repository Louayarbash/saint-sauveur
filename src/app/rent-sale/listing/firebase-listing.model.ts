import { ShellModel } from '../../shell/data-store';
import { Images } from '../../type';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  creatorPhoto: string;
  creatorName: string;
  type: string;
  createdBy : string;
  createDate : number;
  price : string;
  object : string;
  objectTranslated : string;
  description : string;
  coverPhotoData :string;
  images : Array<Images> = [];
  status: string;
  constructor() {
    super();
  }
}