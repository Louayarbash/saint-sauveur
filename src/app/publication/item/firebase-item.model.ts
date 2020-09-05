import { ShellModel } from '../../shell/data-store';
import { Files } from '../../type'

export class FirebasePhotoModel /*extends ShellModel*/ {
  photo: string;

  constructor() {
    //super();
  }
}

export class FirebaseItemModel extends ShellModel {  
  id:string;
  subject: string;
  details: string;
  
  buildingId: string;
  createdById: string;
  createDate: firebase.firestore.FieldValue;  
  category:string;
  files: Array<Files> = [];
  // firelds for event
  date : string;
  dateTS : number;
  startDate : string;
  startDateTS : number;
  endDate : string;
  endDateTS : number;
  // fields for announcement
  voting: boolean;
  votingMessage: string;
  votingResult: boolean;
  //fullPathFromStore:string;
  
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

export class VotingPublication {     
  publicationId: string;  
  buildingId: string;
  userId: string;
  voting: string; 
  createdDate: firebase.firestore.FieldValue;
}
