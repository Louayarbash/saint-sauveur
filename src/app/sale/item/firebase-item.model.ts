import { ShellModel } from '../../shell/data-store';
import { Images } from '../../type';
import { FirebaseUserModel } from '../../users/user/firebase-user.model';



/* export class FirebaseSkillModel extends ShellModel {
  id: string;
  name: string;

  constructor() {
    super();
  }
} */

export class FirebasePhotoModel /*extends ShellModel*/ {
  //photo: string;
  isCover : boolean;
  photoData : string;
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
  //coverPhoto:string;
  createdBy : string;
  createDate : firebase.firestore.FieldValue;
  images : Array<Images> = [];
  // status : string;
  buildingId: string;

  constructor() {
    super();
  }
}
/* export class FirebaseCombinedSkillModel extends FirebaseItemModel {
  skills: Array<FirebaseSkillModel> = [
    new FirebaseSkillModel(),
    new FirebaseSkillModel(),
    new FirebaseSkillModel()
  ];

  constructor() {
    super();
  }
} */

export class FirebaseCombinedItemModel extends FirebaseItemModel {
  photos: Array<Images> = [
    new FirebasePhotoModel(),
    new FirebasePhotoModel(),
    new FirebasePhotoModel()
  ];
  creatorDetails : FirebaseUserModel;

  constructor() {
    super();
  }
}
