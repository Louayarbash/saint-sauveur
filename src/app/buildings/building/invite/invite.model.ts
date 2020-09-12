import { ShellModel } from '../../../shell/data-store';

export class InviteModel extends ShellModel {
  createDate: firebase.firestore.FieldValue;
  userId : string;
  emails: string[];
  buildingId: string;
  invitationMessage: string;

  constructor() {
    super();
  }
}