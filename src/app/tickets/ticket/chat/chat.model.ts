import { ShellModel } from '../../../shell/data-store';

export class ChatModel extends ShellModel {
  text : string;
  //name : string;
  createDate : firebase.firestore.FieldValue;
  userId : string;
  channelId : string;
  //isShell :true;

  constructor() {
    super();
  }
}