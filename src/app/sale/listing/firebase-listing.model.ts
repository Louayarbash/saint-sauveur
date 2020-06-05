import { ShellModel } from '../../shell/data-store';
import { PhotosArray } from '../../type';

export class FirebaseListingItemModel extends ShellModel {

  id: string;
  //coverPhoto: string;
  createdBy : string;
  createDate : number;
  price : string;
  object : string;
  description : string;
  coverPhotoData :string;
  images : Array<PhotosArray> = [];
  constructor() {
    super();
  }
}