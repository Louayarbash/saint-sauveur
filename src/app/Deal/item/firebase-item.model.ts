import { ShellModel } from '../../shell/data-store';

export class FirebaseSkillModel extends ShellModel {
  id: string;
  name: string;

  constructor() {
    super();
  }
}

export class FirebaseItemModel extends ShellModel {
  
  id : string;
  date:string;
  startDate:string;
  endDate:string;
  status:string = "new";
  createdBy:string;
  responseBy:string;
  note:string;
  createDate : string;
  count : string;
  actionIn:number = 60;
  /*actionAt:number = 1583904656000;*/


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
