import { ShellModel } from '../../shell/data-store';
// import { FirebaseUserModel } from '../../users/user/firebase-user.model';
import { Parkings, Services } from '../../type';
// import { FeatureService } from '../../services/feature/feature.service';

export class BuildingModel extends ShellModel {
  id: string;
  name: string;
  address: string;
  details: string;
  postalCode: string;
  parkings: Parkings[]= [{id: '1', description: 'P1', note: '', active: true}, {id: '2', description: 'P2', note: '', active: true}, {id: '3', description: 'P3', note: '', active: true}];
  services: Services[]= [{id: '1', description: 'ElevatorBooking', active: true}, {id: '2', description: 'NewKeyRequest', active: true}];
  enableSale: boolean= true;
  enableRentSale: boolean= true;
  enableLostFound: boolean= true;
  enableTicket: boolean= true;
  enablePublication: boolean= true;
  enableDeal: boolean= true;
  status: string= 'active';
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
