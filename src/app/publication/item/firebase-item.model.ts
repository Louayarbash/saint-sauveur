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
  id : string;
  coverPhoto:string;
  createdById: string;
  createDate : string;
  price : string;
  title : string;
  description : string;
  category:string;
  //fullPathFromStore:string;
  imagesFullPath: Array<string> = [];
/*   photoslider: Array<any>= [
    '',
    '',
    ''
  ]; */
  /*age?: number;*/
  /*skills: Array<any> = [
    '',
    '',
    ''
  ];*/
  /*languages: {
    spanish: number,
    english: number,
    french: number
  } = {
    spanish: 0,
    english: 0,
    french: 0
  };*/

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

/* export class PhotosArray1 {
    cover: boolean;
    photo: string;


  constructor() {
  }
} */
