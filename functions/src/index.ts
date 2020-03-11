//import * as functions from 'firebase-functions';

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');

const { CloudTasksClient } = require('@google-cloud/tasks');

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
 }); 


 // Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    const snapshot = await admin.database().ref('/messages').push({original: original});
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref.toString());
  });

  // Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
/* exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
.onCreate((snapshot, context) => {
  // Grab the current value of what was written to the Realtime Database.
  const original = snapshot.val();
  console.log('Uppercasing', context.params.pushId, original);
  const uppercase = original.toUpperCase();
  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to the Firebase Realtime Database.
  // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  return snapshot.ref.parent.child('uppercase').set(uppercase);
}); */

exports.newSubscriberNotification = functions.firestore
    .document('subscribers/{subscriptionId}')
    .onCreate(async event => {
    console.log(event);
    const data = event.data();//.after.data();//.after.data();
    if (data){
        const userId = data.userId
        const subscriber = data.subscriberId
        
    // Notification content
    const payload = {
      notification : {
          title: 'New Subscriber',
          body: `${subscriber} is following your content!`,
          icon: 'https://goo.gl/Fz9nrQ',
          click_action:"FCM_PLUGIN_ACTIVITY"
      }
    }
    
    // ref to the device collection for the user
    const db = admin.firestore()
    const devicesRef = db.collection('devices').where('userId', '==', userId)

    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    /*const tokens = [];*/
    const tokens: string | any[] = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;

      tokens.push( token )
    })

    return admin.messaging().sendToDevice(tokens, payload)
}
return;
});

exports.newRequestNotification = functions.firestore
    .document('deals-requests/{dealId}')
    .onCreate(async event => {
    console.log(event);
    const data = event.data();//.after.data();    
    let id = event.id
    if (data){
        //const id = data.id
        console.log("createdBy",data.createdBy);
        const createdBy = data.createdBy;
    
    // Notification content
    const payload = {
      notification: {
          title: '',
          body: `${createdBy} - (ionic 5) your building asking for parking check to see if you can help Louay!`,
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

    return admin.messaging().sendToDevice(tokens, payload).then(res => {
        console.log("Sent Successfully", res);
      })
      .catch(errr => {
        console.log(errr);
      });
}
return;
});
/* exports.scheduledFunction = functions.pubsub.schedule('every 1 minutes').onRun((context) => {
  
  console.log('This will be run every 5 minutes!');
  return null;
}); */

/******************8code for the time scheduling task************************/

// Payload of JSON data to send to Cloud Tasks, will be received by the HTTP callback
interface ExpirationTaskPayload {
    docPath: string
}

// Description of document data that contains optional fields for expiration
interface ExpiringDocumentData extends admin.firestore.DocumentData {
    expiresIn?: number
    expiresAt?: admin.firestore.Timestamp
    expirationTask?: string
}

export const onCreatePost =
functions.firestore.document('/deals-requests/{id}').onCreate(async snapshot => {
    const data = snapshot.data()! as ExpiringDocumentData
    const { expiresIn, expiresAt } = data

    let expirationAtSeconds: number | undefined
    if (expiresIn && expiresIn > 0) {
        expirationAtSeconds = Date.now() / 1000 + expiresIn
    }
    else if (expiresAt) {
        expirationAtSeconds = expiresAt.seconds
    }

    if (!expirationAtSeconds) {
        // No expiration set on this document, nothing to do
        return
    }

    // Get the project ID from the FIREBASE_CONFIG env var
    const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId
    const location = 'northamerica-northeast1'
    const queue = 'queue-firebase'

    const tasksClient = new CloudTasksClient()
    const queuePath: string = tasksClient.queuePath(project, location, queue)

    //const url = `https://${location}-${project}.cloudfunctions.net/firestoreTtlCallback`
    const url = `https://us-central1-${project}.cloudfunctions.net/firestoreTtlCallback`
    const docPath = snapshot.ref.path
    const payload: ExpirationTaskPayload = { docPath }

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
            seconds: expirationAtSeconds
        }
    }

    const [ response ] = await tasksClient.createTask({ parent: queuePath, task })

    const expirationTask = response.name
    const update: ExpiringDocumentData = { expirationTask }
    await snapshot.ref.update(update)
})


export const firestoreTtlCallback = functions.https.onRequest(async (req, res) => {
    const payload = req.body as ExpirationTaskPayload
    try {
        //res.send("Hello from Firebase!");
        await admin.firestore().doc(payload.docPath).update({status: "started"});
        res.send(200)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }
})

/* 
export const onUpdatePostCancelExpirationTask =
functions.firestore.document('/deals-requests/{id}').onUpdate(async change => {
    const before = change.before.data() as ExpiringDocumentData
    const after = change.after.data() as ExpiringDocumentData

    // Did the document lose its expiration?
    const expirationTask = after.expirationTask
    const removedExpiresAt = before.expiresAt && !after.expiresAt
    const removedExpiresIn = before.expiresIn && !after.expiresIn
    if (expirationTask && (removedExpiresAt || removedExpiresIn)) {
        const tasksClient = new CloudTasksClient()
        await tasksClient.deleteTask({ name: expirationTask })
        await change.after.ref.update({
            expirationTask: admin.firestore.FieldValue.delete()
        })
    }
}) */