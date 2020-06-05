import { ShellModel } from '../../shell/data-store';
import { PhotosArray, Images } from '../../type';


export class FirebaseSkillModel extends ShellModel {
  id: string;
  name: string;

  constructor() {
    super();
  }
}

export class FirebasePhotoModel /*extends ShellModel*/ {
  //photo: string;
  isCover : boolean;
  photo : string;
  storagePath : string;
  constructor() {
    //super();
  }
}

export class FirebaseItemModel extends ShellModel {
  id : string;
  object : string;
  description : string;
  price : string;
  coverPhoto:string;
  createdBy : string;
  createDate : firebase.firestore.FieldValue;
  images : Array<Images> = [];
  status : string;

  constructor() {
    super();
  }
}
export class FirebaseCombinedSkillModel extends FirebaseItemModel {
  skills: Array<FirebaseSkillModel> = [
    new FirebaseSkillModel(),
    new FirebaseSkillModel(),
    new FirebaseSkillModel()
  ];

  constructor() {
    super();
  }
}

export class FirebaseCombinedItemModel extends FirebaseItemModel {
  photos: Array<PhotosArray> = [
    new FirebasePhotoModel(),
    new FirebasePhotoModel(),
    new FirebasePhotoModel()
  ];

  constructor() {
    super();
  }
}
