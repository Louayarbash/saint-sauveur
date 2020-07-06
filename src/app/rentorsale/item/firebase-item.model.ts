import { ShellModel } from '../../shell/data-store';
import { PhotosData, Images } from '../../type';
import { FirebaseUserModel } from '../../users/user/firebase-user.model';

export class FirebasePhotoModel /*extends ShellModel*/ {
  isCover : boolean;
  photo : string;
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
  balcony: boolean;
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
  photos: Array<PhotosData> = [
    new FirebasePhotoModel(),
    new FirebasePhotoModel(),
    new FirebasePhotoModel()
  ];
  creatorDetails : FirebaseUserModel;

  constructor() {
    super();
  }
}
