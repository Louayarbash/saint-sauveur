import { ShellModel } from '../../shell/data-store';
import { Images } from '../../type';

export class FirebaseListingItemModel extends ShellModel {
  creatorPhoto: string;
  creatorName: string;
  id: string;
  type: string;
  subject: string;
  details: string;
  createdBy : string;
  createDate : number;
  coverPhotoData :string;
  images : Array<Images> = [];
  status: string;
  constructor() {
    super();
  }
}