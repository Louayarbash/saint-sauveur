//import * as functions from 'firebase-functions';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');

const { CloudTasksClient } = require('@google-cloud/tasks');

admin.initializeApp();

// Payload of JSON data to send to Cloud Tasks, will be received by the HTTP callback
interface RequestTaskPayload {
    docPath: string
}

// Description of document data that contains optional fields for expiration
interface TimingDocumentData extends admin.firestore.DocumentData {
    actionIn?: number
    actionAt?: admin.firestore.Timestamp
    actionTask?: string
}
interface InfoDocumentData extends admin.firestore.DocumentData {
    status?: string
    responseBy? : string
    createdBy? : string
    actionTask1?: string
    actionTask2?: string
}

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

exports.newRequest = functions.firestore
    .document('deals-requests/{dealId}')
    .onCreate(async item => {
    //console.log(item);

    const data = item.data();//.after.data();    
       
    let id = item.id
    if (data && data.status == "new"){
        //const id = data.id
        //console.log("createdBy",data.createdBy);
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
      /* Cretate task to change status to not accepted */
      const dataFortask = item.data()! as TimingDocumentData
      const { actionIn, actionAt } = dataFortask
 
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
      const url = `https://us-central1-${project}.cloudfunctions.net/changeRequestStatus/expired`
      const docPath = item.ref.path
      const payload2: RequestTaskPayload = { docPath }
  
      const task = {
          httpRequest: {
              httpMethod: 'POST',
              url,
              body: Buffer.from(JSON.stringify(payload2)).toString('base64'),
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

export const changeRequestStatus = functions.https.onRequest(async (req, res) => {
    const status = req.get('status')
    const payload = req.body as RequestTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: status});
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

export const onUpdateRequest =
functions.firestore.document('/deals-requests/{id}').onUpdate(async item => {
    const before = item.before.data() as InfoDocumentData
    const after = item.after.data() as InfoDocumentData
    //const data = item.data();//.after.data();
    let id = item.before.id
    //const id = data.id
    //console.log("createdBy",data.createdBy);
    const responseBy = after.responseBy;
    const createdBy = after.createdBy;

    if ((before.status == "accepted" || before.status == "started") && (after.status == "canceled")){
            
       

    
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: `${responseBy} - canceled the deal!`,
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
    if (after.status == "accepted"){
        /* Cretate task to change status to not accepted */
      // Get the project ID from the FIREBASE_CONFIG env var
      const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId
      const location = 'northamerica-northeast1'
      //const location = 'us-central1'
      const queue = 'queue-firebase'
      const actionAtSecondsStarting : number | undefined = Date.now() / 1000 + 60
      const actionAtSecondsEnded : number | undefined  = Date.now() / 1000 + 120
      

      const tasksClient = new CloudTasksClient()
      const queuePath: string = tasksClient.queuePath(project, location, queue)
  
      //const url = `https://${location}-${project}.cloudfunctions.net/changeRequestStatus`
      const url1 = `https://us-central1-${project}.cloudfunctions.net/changeRequest/status=started`
      const url2 = `https://us-central1-${project}.cloudfunctions.net/changeRequest/status=ended`
      
      const docPath = after.ref.path
      const payload: RequestTaskPayload = { docPath }
        
      const task1 = {
          httpRequest: {
              httpMethod: 'POST',
              url1,
              body: Buffer.from(JSON.stringify(payload)).toString('base64'),
              headers: {
                  'Content-Type': 'application/json',
              },
          },
          scheduleTime: {
              seconds: actionAtSecondsStarting//actionAtSeconds
          }
      }
      const task2 = {
        httpRequest: {
            httpMethod: 'POST',
            url2,
            body: Buffer.from(JSON.stringify(payload)).toString('base64'),
            headers: {
                'Content-Type': 'application/json',
            },
        },
        scheduleTime: {
            seconds: actionAtSecondsEnded
        }
    }

    const [ response1 ] = await tasksClient.createTask({ parent: queuePath, task1 })
    const [ response2 ] = await tasksClient.createTask({ parent: queuePath, task2 })

      const actionTask1 = response1.name
      const actionTask2 = response2.name
      const update : InfoDocumentData = { actionTask1 , actionTask2 }
      await after.ref.update(update)

/*send notification to creater*/
    
      // Notification content
      const message = {
        notification: {
            title: '',
            body: `${createdBy} - Your building asking for parking check to see if you can help!`,
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
})