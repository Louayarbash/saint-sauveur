import { ShellModel } from '../../shell/data-store';
import { Files } from '../../type'


export class FirebaseItemModel extends ShellModel {  
  id:string;
  subject: string;
  details: string;
  buildingId: string;
  createdBy: string;
  createDate: firebase.firestore.FieldValue;  
  //category:string;
  files: Array<Files> = [];
  // fields for announcement
  //voting: boolean;
  //votingMessage: string;
  //votingResult: boolean;
  //fullPathFromStore:string;
  
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
