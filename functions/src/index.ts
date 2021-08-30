//import * as functions from 'firebase-functions';
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
//import  CloudTasksClient  = require('@google-cloud/tasks');
//import { CloudTasksClient } from '@google-cloud/tasks';
//import * as dayjs from 'dayjs';
// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');
import functions = require('firebase-functions');
const { CloudTasksClient } = require('@google-cloud/tasks');
const nodemailer = require('nodemailer');
const cors = require("cors");
const corsHandler = cors({origin: true});

admin.initializeApp();

// Get the project ID from the FIREBASE_CONFIG env var
const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId;
const location = 'northamerica-northeast1';
//const location = 'us-central1'
const queue = 'queue-firebase';
const tasksClient = new CloudTasksClient();
const queuePath: string = tasksClient.queuePath(project, location, queue);
const db = admin.firestore();

// Payload of JSON data to send to Cloud Tasks, will be received by the HTTP callback
interface RequestTaskPayload {
    docPath: string
}
// Description of document data that contains optional fields for expiration
/* interface TimingDocumentData extends admin.firestore.DocumentData {
    expiresIn?: number
    actionAt?: admin.firestore.Timestamp
    actionTask?: string
} */
interface InfoDocumentData extends admin.firestore.DocumentData {
    type?: string
    expiresIn?: number
    startDateTS?: number//admin.firestore.Timestamp
    endDateTS?: number//admin.firestore.Timestamp
    durationSeconds?: number
    serverStatingTime?: number
    //endsIn?: number
    status?: string
    responseBy? : string
    createdBy? : string
    buildingId? : string 
    actionTaskReminder?: admin.firestore.FieldValue//string
    actionTaskStarted?: admin.firestore.FieldValue//string
    actionTaskEnded?: admin.firestore.FieldValue//string
    actionTaskExpired?: admin.firestore.FieldValue
    startedAt?: number;
    endedAt?: number;
    expiredAt?: number; 
}
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

exports.onNewRequest = functions.firestore
    .document('deals/{dealId}')
    .onCreate(async item => {

    const data = item.data();//.after.data();
    const /*let*/ id = item.id
    if (data && data.status === "new"){
        //const id = data.id
        //const createdBy = data.createdBy;
    
    // Notification content
    const payload = {
      notification: {
          body: `Someone in your building is asking for parking, check to see if you can help!`,
          //icon: 'https://goo.gl/Fz9nrQ',
          //click_action:"FCM_PLUGIN_ACTIVITY",
          //collapse_key:"com.enappd.IonicReactPush"
      },
      data: {
        //actionId:"tap",
        landing_page: "/app/start-menu/deal",
        id: id,
        //collapse_key:"com.enappd.IonicReactPush"
      }
    }

    const usersRef = db.collection('users').where('buildingId', '==', data.buildingId);
    // get the user's tokens and send notifications
    const users = await usersRef.get();

    /*const tokens = [];*/
    //const tokens: string | any[] = [];
    const tokens: string[] = [];

    // send a notification to each device token
    if(users.size > 0){
      users.forEach(result => {
        console.log("tokens",result.data().tokens);
        if(result.data().tokens){
          result.data().tokens.forEach((res: string) => {tokens.push( res )})
        }
      })
      admin.messaging().sendToDevice(tokens, payload).then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
    }


    console.log("Louay tokens array",tokens);

    /* 2 */
    /* Cretate task to change status to expired */
    const dataFortask = data as InfoDocumentData;
    const { expiresIn } = dataFortask;
      
    let expiresAtSeconds: number | undefined;
      
    if (expiresIn) {
        expiresAtSeconds = admin.firestore.Timestamp.now().seconds + expiresIn;
    }
       
      //console.log("Louay startDateTS",startDateTS);
      console.log("Louay expiresAtSeconds",expiresAtSeconds);
      
      const urlExpired = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatusToExpired`;

      const docPath = item.ref.path;
      const payloadTask: RequestTaskPayload = { docPath };
  
      const taskExpired = {
          httpRequest: {
              httpMethod: 'POST',
              url : urlExpired,
              body: Buffer.from(JSON.stringify(payloadTask)).toString('base64'),
              headers: {
                  'Content-Type': 'application/json',
              },
          },
          scheduleTime: {
              seconds: expiresAtSeconds
          }
      }

      const [ responseExpired ] = await tasksClient.createTask({parent : queuePath, task : taskExpired});
      const actionTaskExpired = responseExpired.name
      const update: InfoDocumentData = { actionTaskExpired , serverStatingTime : expiresAtSeconds }
      await item.ref.update(update);

}
return
});
//export const changeRequestStatusToStarted = functions.https.onRequest(async (req, res) => {
export const changeRequestStatusToStarted = functions.https.onRequest(async (req: any, res: any) => {
    const payload = req.body as RequestTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "started" , actionTaskStarted : admin.firestore.FieldValue.delete(), startedAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
//export const changeRequestStatusToEnded = functions.https.onRequest(async (req, res) => {
export const changeRequestStatusToEnded = functions.https.onRequest(async (req:any, res: any) => {
    const payload = req.body as RequestTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "ended", actionTaskEnded : admin.firestore.FieldValue.delete(), endedAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
export const changeRequestStatusToExpired = functions.https.onRequest(async (req: any, res: any) => {
    const payload = req.body as RequestTaskPayload
    try {
        ;
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "expired", actionTaskExpired : admin.firestore.FieldValue.delete(), expiredAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
export const reminderToLeave = functions.https.onRequest(async (req: any, res:any) => {
  try {  
    
    let userId: any;
    const taskPayload = req.body as RequestTaskPayload
    const getItem= await admin.firestore().doc(taskPayload.docPath).get();
    const item = getItem.data() as InfoDocumentData;
    console.log("inside reminder item", item);
    console.log("inside reminder taskPayload", taskPayload);
    
    //res.send("Hello from Firebase!");
    //const createdBy = item.createdBy;
    
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: "Reminder: Time to move your car",
          //icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      },
      data: {
        landing_page: "/app/start-menu/deal"
      }
    }

    if(item.type === "request"){
      userId = item.createdBy ?  item.createdBy : null
    }
    else { 
      userId = item.responseBy ?  item.responseBy : null
    }

    if(userId){
    // ref to the device collection for the user
    const devicesRef = db.collection('devices').where('userId', '==', userId).where('buildingId', '==', item.buildingId)
    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;
      tokens.push( token )
    })
    admin.messaging().sendToDevice(tokens, payload).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      res.status(500)
      console.log('Error sending message:', error);
    });

    }
    else res.status(500)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }

  }
  )

exports.onUpdateRequest = functions.firestore.document('deals/{dealId}').onUpdate(async item => {
//export const onUpdateRequest = functions.firestore.document('/deals-requests/{id}').onUpdate(async item => {
    const before = item.before.data() as InfoDocumentData
    const after = item.after.data() as InfoDocumentData
    //const data = item.data();//.after.data();
    const /*let*/ id = item.before.id
    //const id = data.id
    //console.log("createdBy",data.createdBy);
    //const responseBy = after.responseBy;
    
    //const createdBy = after.createdBy;
  
    // Canceled (by creator) (OK)
    if ((before.status === "new") && (after.status === "canceled") && (after.actionTaskExpired)){

        await tasksClient.deleteTask({ name: after.actionTaskExpired });
        const update : InfoDocumentData = { actionTaskExpired : admin.firestore.FieldValue.delete() };
            return item.after.ref.update(update);
    }
    // Canceled (by creator) - after acceptance (OK)
    else if ((before.status === "accepted" || before.status === "started") && (after.status === "canceled")){
    if ( after.actionTaskStarted ) { // before status === "accepted"

            //const tasksClient = new CloudTasksClient()
            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskStarted });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskStarted : admin.firestore.FieldValue.delete() , actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
    } 
    else if( after.actionTaskReminder ) { // before status === "started"
            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
    }
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: `Deal is canceled by the creator!`,
          //icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      },
      data: {
        landing_page: "/app/start-menu/deal",
        id: id
      }
    }

    //if(before.type = "request"){
    //  userId = before.createdBy ? before.createdBy : null
    // }
    // else { 
    // userId = before.responseBy? before.responseBy : null;
    // }

    if(before.createdBy){
    // ref to the device collection for the user
    const devicesRef = db.collection('devices').where('userId', '==', before.createdBy).where('buildingId', '==', before.buildingId)
    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;
      tokens.push( token )
    })
    admin.messaging().sendToDevice(tokens, payload).then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });

    }
    else return


    }
    // canceled by responder (OK)
    else if ((before.status === "accepted") && (after.status === "new")){
      /* 2 */
      /* Cretate task to change status to expired */
      
      let expiresAtSeconds: number | undefined;
      
      if (after.serverStatingTime) {
        expiresAtSeconds = after.serverStatingTime
      }
       
      //console.log("Louay startDateTS",startDateTS);
      console.log("Louay expiresAtSeconds",expiresAtSeconds);
      
      const urlExpired = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatusToExpired`;
      const docPath = item.after.ref.path;
      const payloadTask: RequestTaskPayload = { docPath };
      const taskExpired = {
          httpRequest: {
              httpMethod: 'POST',
              url : urlExpired,
              body: Buffer.from(JSON.stringify(payloadTask)).toString('base64'),
              headers: {
                  'Content-Type': 'application/json',
              },
          },
          scheduleTime: {
              seconds: expiresAtSeconds
          }
      }

      const [ responseExpired ] = await tasksClient.createTask({parent : queuePath, task : taskExpired});
      const actionTaskExpired = responseExpired.name
      let update: InfoDocumentData;// = { actionTaskExpired }
      // await item.after.ref.update(update)
      /*delete tasks*/
      if (after.actionTaskEnded) {
  
              //const tasksClient = new CloudTasksClient()
              tasksClient.deleteTask({ name: after.actionTaskReminder });
              tasksClient.deleteTask({ name: after.actionTaskStarted });
              tasksClient.deleteTask({ name: after.actionTaskEnded });
              
              update = { actionTaskExpired, actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskStarted : admin.firestore.FieldValue.delete() , actionTaskEnded : admin.firestore.FieldValue.delete() };
              
      } 
      else{
        update = { actionTaskExpired }
      }
      await item.after.ref.update(update);

    /* send notification to creater */
    const payload = {
      notification: {
          title: '',
          body: `Deal was canceled by the responder!`,
          //icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
        },
        data: {
          landing_page: "/app/start-menu/deal",
          id: id
        }
      }
  
      if(before.createdBy){
      // ref to the device collection for the user
      const devicesRef = db.collection('devices').where('userId', '==', before.createdBy).where('buildingId', '==', before.buildingId)
      // get the user's tokens and send notifications
      const devices = await devicesRef.get();
  
      /*const tokens = [];*/
      const tokens: string | any[] = [];
  
      // send a notification to each device token
      devices.forEach(result => {
        const token = result.data().token;
        tokens.push( token )
      })
      admin.messaging().sendToDevice(tokens, payload).then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  
      }
      else return

    }
    //Accepted (OK)
    else if (after.status === "accepted" && (before.status === "new") /*&& !(after.actionTaskStarted)*/ && (after.serverStatingTime) && (after.durationSeconds)){

      if ( after.actionTaskExpired ) {

        await tasksClient.deleteTask({ name: after.actionTaskExpired })

    }
        /* Cretate task to change status to not accepted */

      let reminderAtSeconds: number | undefined;
      if (after.endDateTS) {
        reminderAtSeconds = after.serverStatingTime + after.durationSeconds - 300;
      }
      let startsAtSeconds: number | undefined;
      if (after.startDateTS) { 
        startsAtSeconds = after.serverStatingTime;
      }
      let endsAtSeconds: number | undefined;
      if (after.endDateTS) {
        endsAtSeconds = after.serverStatingTime + after.durationSeconds;
      }

      const urlStarted = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatusToStarted`;
      const urlEnded = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatusToEnded`;
      const urlReminderToLeave = `https://us-central1-${project}.cloudfunctions.net/reminderToLeave`;

      const docPath = item.after.ref.path
      const payload: RequestTaskPayload = { docPath }

      const taskStarted = {
          httpRequest: {
              httpMethod: 'POST',
              url : urlStarted,
              body: Buffer.from(JSON.stringify(payload)).toString('base64'),
               headers: {
                  'Content-Type': 'application/json',
              }, 
          },
          scheduleTime: {
              seconds: startsAtSeconds
          }
       } 

      const taskEnded = {
        httpRequest: {
            httpMethod: 'POST',
            url : urlEnded,
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
        },
        scheduleTime: {
            seconds: endsAtSeconds
        }
      }

      const taskReminderToLeave = {
        httpRequest: {
            httpMethod: 'POST',
            url : urlReminderToLeave,
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
        },
        scheduleTime: {
            seconds: reminderAtSeconds
        }
      }

      const [ responseStarted ] = await tasksClient.createTask({ parent : queuePath, task : taskStarted })
      const actionTaskStarted = responseStarted.name
      const [ responseEnded ] = await tasksClient.createTask({ parent : queuePath, task : taskEnded })
      const actionTaskEnded = responseEnded.name
      const [ responseReminder ] = await tasksClient.createTask({ parent : queuePath, task : taskReminderToLeave })
      const actionTaskReminder = responseReminder.name
      
    /* deletin expiration task after request acceptance */
    // await tasksClient.deleteTask({ name : after.actionTaskExpired });
    // update deals-requests
    const update : InfoDocumentData = { actionTaskStarted, actionTaskEnded, actionTaskReminder, actionTaskExpired : admin.firestore.FieldValue.delete() };
    await item.after.ref.update(update);

/*send notification to creater*/
    

       // Notification content
       const message = {
        notification: {
            title: '',
            body: before.type === "request" ? `Your request has been accepted`:`Your offer has been accepted`,
            //icon: 'https://goo.gl/Fz9nrQ',
            click_action:"FCM_PLUGIN_ACTIVITY"
        },
        data: {
          landing_page: "/app/start-menu/deal",
          id: id
        }
      }

      if(before.createdBy){
      // ref to the device collection for the user
      const devicesRef = db.collection('devices').where('userId', '==',  before.createdBy).where('buildingId', '==', before.buildingId)
      // get the user's tokens and send notifications
      const devices = await devicesRef.get();
  
      /*const tokens = [];*/
      const tokens: string | any[] = [];
  
      // send a notification to each device token
      devices.forEach(result => {
        const token = result.data().token;
        tokens.push( token )
      })
      admin.messaging().sendToDevice(tokens, message).then((response) => {
        // Response is a message ID string.
        console.log('Successfully sent message:', response);
      })
      .catch((error) => {
        console.log('Error sending message:', error);
      });
  
      }
      else return
    }
    return;
});

// sending invitations emails
export const sendInvitationEmails = functions.https.onRequest(/*async*/ (req: any, res: any) => {
    corsHandler(req, res, async() => {
    try {  
      const options = req.body

      const mailOptions = {
        from: '"Parkondo App" <donotreply@parkondo.com>', // sender address
        to: options.emailsList, // list of receivers
        subject: "Invitation to join Parkondo App", // Subject line
        text: options.invitationMsg, // plain text body
        html: "<b>" + options.invitationMsg + "</b><br><a href='https://play.google.com/store/apps/details?id=louay.arbash.parkondo'><b>Download on the Google Play (Android version)</b></a><br><a href='https://apps.apple.com/ca/app/parkondo/id1565989030'><b>Download on the App Store (Iphone version)</b></a>", // html body
      /*   attachments: [
        {
          filename: android.png,
          path: __dirname+/android.png,
          cid: android
        },
        {
          filename: apple.png,
          path: __dirname+/apple.png, 
          cid: apple
        }
        ] */
    };

      const transporter = nodemailer.createTransport(
        /* {host: "smtp.gmail.com",
      // service: 'gmail',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'marcelouay@gmail.com',
        pass: 'li2annalahama3ana'
      }/*
      // ,
      //tls: {
      //rejectUnauthorized:false
      //} 
    } */
    
    {
    host: "p3plzcpnl470352.prod.phx3.secureserver.net",
    //host: "mail.parkondo.com",
    // service: 'gmail',
    //service: 'Godaddy',
    //secureConnection: false,
    port: 465,
    //tls: {
    //  rejectUnauthorized: false
    //},
    //requireTLS:true,
    //port: 587,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'donotreply@parkondo.com',
      pass: 'Lakecomo82'
    }
  }

    );
  
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
        res.send(info);
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
  }
  );
})

