//import * as functions from 'firebase-functions';
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');
//import  CloudTasksClient  = require('@google-cloud/tasks');
//import { CloudTasksClient } from '@google-cloud/tasks';
//import * as dayjs from 'dayjs';
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
    expiresIn?: number
    
    startDateTS?: number//admin.firestore.Timestamp
    endDateTS?: number//admin.firestore.Timestamp
    durationSeconds?: number
    serverStatingTime?: number
    //endsIn?: number
    status?: string
    responseBy? : string
    createdBy? : string
    actionTaskReminder?: admin.firestore.FieldValue//string
    actionTaskStarted?: admin.firestore.FieldValue//string
    actionTaskEnded?: admin.firestore.FieldValue//string
    actionTaskExpired?: admin.firestore.FieldValue
}
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

  
exports.newRequest = functions.firestore
    .document('deals-requests/{dealId}')
    .onCreate(async item => {

    const data = item.data();//.after.data();
    const /*let*/ id = item.id
    if (data && data.status === "new"){
        //const id = data.id
        const createdBy = data.createdBy;
    
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: `${createdBy} - Your building asking for parking check to see if you can help!`,
          icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      },
      data: {
        landing_page: "deal",
        id: id
      }
    }

    // ref to the device collection for the user
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', createdBy)
    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;
      tokens.push( token )
    })

    /*return*/ admin.messaging().sendToDevice(tokens, payload).then(res => {
        //console.log("Sent Successfully", res);
      })
      .catch(err => {
        console.log(err);
      });
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
      await item.ref.update(update)
}
return;
});

/*code for the time scheduling task*/

/* export const onCreateRequest =
functions.firestore.document('/deals-requests/{id}').onCreate(async item => {
    const data = item.data()! as TimingDocumentData
    const { actionIn, actionAt } = data

    let actionAtSeconds: number | undefined
    if (actionIn && actionIn > 0) {
        actionAtSeconds = Date.now() / 1000 + actionIn
    }
    else if (actionAt) {
        actionAtSeconds = actionAt.seconds
    }

    if (!actionAtSeconds) {
        // No expiration set on this document, nothing to do
        return
    }

    // Get the project ID from the FIREBASE_CONFIG env var
    const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId
    const location = 'northamerica-northeast1'
    //const location = 'us-central1'
    const queue = 'queue-firebase'

    const tasksClient = new CloudTasksClient()
    const queuePath: string = tasksClient.queuePath(project, location, queue)

    //const url = `https://${location}-${project}.cloudfunctions.net/changeRequestStatus`
    const url = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatus`
    const docPath = item.ref.path
    const payload: RequestTaskPayload = { docPath }

    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url,
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
        },
        scheduleTime: {
            seconds: actionAtSeconds
        }
    }

    const [ response ] = await tasksClient.createTask({ parent: queuePath, task })

    const actionTask = response.name
    const update: TimingDocumentData = { actionTask }
    await item.ref.update(update)
}) */

export const changeRequestStatusToStarted = functions.https.onRequest(async (req, res) => {
    const payload = req.body as RequestTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "started" , startedAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
export const changeRequestStatusToEnded = functions.https.onRequest(async (req, res) => {
    const payload = req.body as RequestTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "ended", endingAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
export const changeRequestStatusToExpired = functions.https.onRequest(async (req, res) => {
    const payload = req.body as RequestTaskPayload
    try {
        ;
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "expired", expiredAt: admin.firestore.Timestamp.now().seconds});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})
export const reminderToLeave = functions.https.onRequest(async (req, res) => {
    const taskPayload = req.body as RequestTaskPayload
    const item = (await admin.firestore().doc(taskPayload.docPath).get()).data() as InfoDocumentData
    console.log("inside reminder item", item);
    console.log("inside reminder taskPayload", taskPayload);
    try {
        //res.send("Hello from Firebase!");
        const createdBy = item.createdBy;
    
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: "Reminder: please move your car in 5 mins!",
          icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      },
      data: {
        landing_page: "deal"
      }
    }

    // ref to the device collection for the user
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', createdBy)
    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;
      tokens.push( token )
    })

    /*return*/ admin.messaging().sendToDevice(tokens, payload).then(result => {
        //console.log("Sent Successfully", res);
      })
      .catch(err => {
        console.log(err);
      });
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})



/* export const onCancelRequest =
functions.firestore.document('/deals-requests/{id}').onUpdate(async change => {
    const before = change.before.data() as TimingDocumentData
    const after = change.after.data() as TimingDocumentData

    // Did the document lose its expiration?
    const actionTask = after.actionTask
    const removedActionAt = before.actionAt && !after.actionAt
    const removedActionIn = before.actionIn && !after.actionIn
    if (actionTask && (removedActionAt || removedActionIn)) {
        const tasksClient = new CloudTasksClient()
        await tasksClient.deleteTask({ name: actionTask })
        await change.after.ref.update({
            actionTask: admin.firestore.FieldValue.delete()
        })
    }
}) */

exports.onUpdateRequest = functions.firestore.document('deals-requests/{dealId}').onUpdate(async item => {
//export const onUpdateRequest = functions.firestore.document('/deals-requests/{id}').onUpdate(async item => {

    const before = item.before.data() as InfoDocumentData
    const after = item.after.data() as InfoDocumentData
    //const data = item.data();//.after.data();
    const /*let*/ id = item.before.id
    //const id = data.id
    //console.log("createdBy",data.createdBy);
    const responseBy = after.responseBy;
    const createdBy = after.createdBy;

    if ((before.status === "new") && ((after.status === "canceled") || (after.status === "accepted"))){
    const actionTaskExpired = after.actionTaskExpired
    if ( actionTaskExpired ) {

        //const tasksClient = new CloudTasksClient()
        await tasksClient.deleteTask({ name: actionTaskExpired })
/*         await item.after.ref.update({
            actionTaskExpired: admin.firestore.FieldValue.delete()
        }) */
    }
    
    }
    if ((before.status === "accepted" || before.status === "started") && (after.status === "canceled")){
        

    if (after.actionTaskStarted) {

            //const tasksClient = new CloudTasksClient()
            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskStarted });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskStarted : admin.firestore.FieldValue.delete() , actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
      } 
      else if(after.actionTaskEnded) {
            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
      }
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: `Dear ${responseBy} - deal canceled by the creator!`,
          icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      },
      data: {
        landing_page: "request",
        id: id
      }
    }
    
    // ref to the device collection for the user
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', responseBy)

    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;

      tokens.push( token )
    })

    /*return*/ admin.messaging().sendToDevice(tokens, payload).then(res => {
        //console.log("Sent Successfully", res);
      })
      .catch(err => {
        console.log(err);
      });
    }
    if ((before.status === "accepted") && (after.status === "new")){
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
      const update: InfoDocumentData = { actionTaskExpired }
      await item.after.ref.update(update)
      /*delete tasks*/
      if (after.responseBy) {
  
              //const tasksClient = new CloudTasksClient()
              tasksClient.deleteTask({ name: after.actionTaskReminder });
              tasksClient.deleteTask({ name: after.actionTaskStarted });
              tasksClient.deleteTask({ name: after.actionTaskEnded });
              
              const updateData : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskStarted : admin.firestore.FieldValue.delete() , actionTaskEnded : admin.firestore.FieldValue.delete() };
              await item.after.ref.update(updateData);
        } 

      /* send notification to creater */
      const payload = {
        notification: {
            title: '',
            body: `Dear ${createdBy} - deal canceled by the responder!`,
            icon: 'https://goo.gl/Fz9nrQ',
            click_action:"FCM_PLUGIN_ACTIVITY"
        },
        data: {
          landing_page: "request",
          id: id
        }
      }
      
      // ref to the device collection for the user
      const db = admin.firestore()
      const devicesRef = db.collection('devices').where('userId', '==', createdBy)
  
      // get the user's tokens and send notifications
      const devices = await devicesRef.get();
  
      /*const tokens = [];*/
      const tokens: string | any[] = [];
  
      // send a notification to each device token
      devices.forEach(result => {
        const token = result.data().token;
  
        tokens.push( token )
      })
  
      /*return*/ admin.messaging().sendToDevice(tokens, payload).then(res => {
          //console.log("Sent Successfully", res);
        })
        .catch(err => {
          console.log(err);
        });
      }
    if (after.status === "accepted" && !(after.actionTaskStarted) && (after.serverStatingTime) && (after.durationSeconds)){
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
      
    /*deletin expiration task after request acceptance */
    //await tasksClient.deleteTask({ name : after.actionTaskExpired });
    // update deals-requests
    const update : InfoDocumentData = { actionTaskStarted , actionTaskEnded, actionTaskReminder, actionTaskExpired : admin.firestore.FieldValue.delete() };
    await item.after.ref.update(update);

/*send notification to creater*/
    
      // Notification content
      const message = {
        notification: {
            title: '',
            body: `Your request has been accepted by: ${responseBy}`,
            icon: 'https://goo.gl/Fz9nrQ',
            click_action:"FCM_PLUGIN_ACTIVITY"
        },
        data: {
          landing_page: "request",
          id: id
        }
      }
      
      // ref to the device collection for the user
      const db = admin.firestore()
      const devicesRef = db.collection('devices').where('userId', '==', createdBy)
      // get the user's tokens and send notifications
      const devices = await devicesRef.get();
      /*const tokens = [];*/
      const tokens: string | any[] = [];
  
      // send a notification to each device token
      devices.forEach(result => {
      const token = result.data().token;
  
        tokens.push( token )
      })
  
      /*return*/ admin.messaging().sendToDevice(tokens, message).then(res => {
          //console.log("Sent Successfully", res);
        })
        .catch(err => {
          console.log(err);
        });
    }
    return;
});

// sending invitations emails
export const sendInvitationEmails = functions.https.onRequest(/*async*/ (req, res) => {
    corsHandler(req, res, async() => {
    try {  
      const mailOptions = req.body
      const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      // service: 'gmail',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'marcelouay@gmail.com',
        pass: 'li2annalahama3ana'
      }/* ,
      tls: {
        rejectUnauthorized:false
      } */
    });
  
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