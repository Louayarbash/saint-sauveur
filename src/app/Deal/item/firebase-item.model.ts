import { ShellModel } from '../../shell/data-store';
//import  * as firebase from 'firebase/app';

export class userModel extends ShellModel {
  id : string;
  photo : string;
  name : string;
  lastname : string;
  building :string;
  app : string;
  parking:string;
  owner:string;
  code:string;
  email: string;
  phone: number;
  birthdate: number;
  language:string;

  constructor() {
    super();
  }
}

export class FirebaseItemModel extends ShellModel {
  id : string;
  date : string;
  dateTS : number;
  startDate : string;
  startDateTS : number;
  endDate : string;
  endDateTS : number;
  status : string = "new";
  createdBy : string;
  responseBy : string;// = "5MHn6X5lnOUDaYRH5oyvKrAtYbA3";
  note : string;
  createDate : firebase.firestore.FieldValue;
  count : string;
  expiresIn : number;
  durationSeconds : number;
  buildingId : string;
  admin : boolean = false;
  constructor() {
    super();
  }
}

export class combinedItemModel extends FirebaseItemModel {
  userInfoRequ : userModel = new userModel();
  userInfoResp : userModel = new userModel();
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
} */
