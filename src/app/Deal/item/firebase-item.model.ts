import { ShellModel } from '../../shell/data-store';
//import * as admin from 'functions/node_modules/firebase-admin/lib';

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
  startDateTS:number;
  endDateTS:number;
  status:string = "new";
  createdBy:string;
  responseBy:string = "5MHn6X5lnOUDaYRH5oyvKrAtYbA3";
  note:string;
  createDate : string;
  count : string;
  expiresIn:number;
  durationSeconds : number;
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
