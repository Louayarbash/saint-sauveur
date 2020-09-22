import { ShellModel } from '../../shell/data-store';
import { Images } from '../../type';
import { UserModel } from '../../users/user/user.model';

export class FirebasePhotoModel /*extends ShellModel*/ {
  isCover : boolean;
  photoData : string;
  storagePath : string;
  constructor() {
    //super();
  }
}

export class FirebaseItemModel extends ShellModel {
  id: string;
  object: string;
  type: string;
  bedRooms: number;
  bathRooms: number;
  balcony: number;
  floor: number;
  description: string;
  price: string;
  createdBy: string;
  createDate: firebase.firestore.FieldValue;
  images: Array<Images> = [];
  status: string;
  buildingId: string;

  constructor() {
    super();
  }
}

export class FirebaseCombinedItemModel extends FirebaseItemModel {
  photos: Array<Images> = [
    new FirebasePhotoModel(),
    new FirebasePhotoModel(),
    new FirebasePhotoModel()
  ];
  creatorDetails : UserModel;

  constructor() {
    super();
  }
}
