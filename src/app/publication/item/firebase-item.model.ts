import { ShellModel } from '../../shell/data-store';

export class FirebaseSkillModel extends ShellModel {
  id: string;
  name: string;

  constructor() {
    super();
  }
}

export class FirebasePhotoModel /*extends ShellModel*/ {
  photo: string;

  constructor() {
    //super();
  }
}

export class FirebaseItemModel extends ShellModel {  
  id:string
  title : string;
  description : string;
  createdById: string;
  createDate : string;  
  category:string;
  //fullPathFromStore:string;
  fileFullPath: Array<string> = [];

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
  photos: Array<FirebasePhotoModel> = [
    new FirebasePhotoModel()//,
    //new FirebasePhotoModel(),
    //new FirebasePhotoModel()
  ];

  constructor() {
    super();
  }
}
