import { Injectable } from '@angular/core';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { 

  }
  timestampToISOString(timestamp : number){
  var date = new Date(timestamp*1000);
  return date.toISOString();
  }

  timestampToString(timestamp : number, format: string){
    return dayjs(timestamp * 1000).format(format);
    }

  getTime(timestamp : number){
    var date = new Date(timestamp * 1000);
    return date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0");
  }

/*   formatAMPM(date) {
      let hoursMinutes = date.split(':');
        var hours = hoursMinutes[0];
        var minutes = hoursMinutes[1];
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }  */
      //let timestamp2 = firebase.firestore.Timestamp.fromDate(a);
//let startTime = new Date(timestamp * 1000);
/* let currentDate = startTime.getDate();
let currentMonth = startTime.getMonth()+1;
let currentYear = startTime.getFullYear();
let currentHour = startTime.getHours();
let currentMinute = startTime.getMinutes();
let dateFormat = currentDate + " " + currentMonth + " " + currentYear+ " " + currentHour+ " " +  currentMinute; */

      /* <ion-item>
      <ion-label>Date</ion-label>
      <ion-datetime displayFormat="hh:mm A" [(ngModel)]="myDate"></ion-datetime>
    </ion-item>
    
    <button ion-button (click)="click(myDate)">Click</button>
    Component file:
    
    myDate:any;
    
    click(date){
        console.log('click..',date);
        let hoursMinutes = date.split(':');
        let time = this.formatAMPM(hoursMinutes);
        console.log('time',time);
    }
    */
}
