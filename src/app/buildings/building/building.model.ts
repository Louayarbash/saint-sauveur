import { ShellModel } from '../../shell/data-store';
// import { FirebaseUserModel } from '../../users/user/firebase-user.model';
import { Parkings, Services } from '../../type';

export class BuildingModel extends ShellModel {
  id: string;
  name: string;
  address: string;
  details: string;
  postalCode: string;
  parkings: Parkings[];
  services: Services[];
  enableSale: boolean;
  enableRentSale: boolean;
  enableLostFound: boolean;
  enableTicket: boolean;
  enablePublication: boolean;
  enableDeal: boolean;
  status: string;
  createdBy: string;
  createDate: firebase.firestore.FieldValue;

  constructor() {
    super();
  }
}
/* 
export class FirebaseCombinedTicketModel extends TicketModel {

  creatorDetails : FirebaseUserModel;

  constructor() {
    super();
  }
} */
