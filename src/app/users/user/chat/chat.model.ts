import { ShellModel } from '../../../shell/data-store';
import { timestamp } from 'rxjs/operators';

export class ChatItemModel extends ShellModel {
  text : string;
  name : string;
  createdAt : number;
  userId:string;
  //isShell :true;

  constructor() {
    super();
  }
}