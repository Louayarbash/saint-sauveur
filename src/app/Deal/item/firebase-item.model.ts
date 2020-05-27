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
  rating:string;
  numberOfOffers:string;
  numberOfRequests:string;
  constructor() {
    super();
  }
}

export class ItemModel extends ShellModel {
  id : string;
  type : string;
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
  parkingInfo : {level:string, number:string};
  constructor() {
    super();
  }
}

export class combinedItemModel extends ItemModel {
  userInfoCreator : userModel = new userModel();
  userInfoResponder : userModel = new userModel();
}

export class RatingUser {     
  dealId : string;
  userId : string;
  userName : string; 
  ratedUserId : string; 
  review : string;
  stars : number; 
  createdDate: firebase.firestore.FieldValue;
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
