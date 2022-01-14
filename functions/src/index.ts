//import * as functions from 'firebase-functions';
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
//import  CloudTasksClient  = require('@google-cloud/tasks');
//import { CloudTasksClient } from '@google-cloud/tasks';
//import * as dayjs from 'dayjs';
// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');
import functions = require('firebase-functions');
//const { CloudTasksClient } = require('@google-cloud/tasks');
import nodemailer = require('nodemailer');
import cors = require("cors");
const corsHandler = cors({origin: true});

admin.initializeApp();

// Get the project ID from the FIREBASE_CONFIG env var
//const project = JSON.parse(process.env.FIREBASE_CONFIG!).projectId;
//const location = 'northamerica-northeast1';
//const location = 'us-central1'
//const queue = 'queue-firebase';
//const tasksClient = new CloudTasksClient();
//const queuePath: string = tasksClient.queuePath(project, location, queue);
const db = admin.firestore();

// Payload of JSON data to send to Cloud Tasks, will be received by the HTTP callback

// Description of document data that contains optional fields for expiration
/* interface TimingDocumentData extends admin.firestore.DocumentData {
    expiresIn?: number
    actionAt?: admin.firestore.Timestamp
    actionTask?: string
} 
interface InfoDocumentData extends admin.firestore.DocumentData {
    startDateTS?: number//admin.firestore.Timestamp
    endDateTS?: number//admin.firestore.Timestamp
    serverStatingTime?: number
    createdBy? : string
}*/
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript

exports.onNewRequest = functions.firestore
    .document('announcements/{annId}')
    .onCreate(async (item, context) => {
    
    const annId = context.params.annId;    

    const itemData = item.data();//.after.data();
    //const id = item.id
    
    if (itemData){
      sendPushNotifications(itemData.createdBy,'all', annId, 'newAnnouncement').then(() => console.log('Notifications sent')).catch((err) => console.log('Notifications sending prob. ', err))
}
return
});

/* export const changeRequestStatusToStarted = functions.https.onRequest(async (req: any, res: any) => {
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
}) */

//exports.onUpdateRequest = functions.firestore.document('announcements/{annId}').onUpdate((item, context) => {
  //const annId = context.params.annId;
    //const before = item.before.data() as InfoDocumentData
    //const after = item.after.data() as InfoDocumentData
    //const update : InfoDocumentData = { firebasefunctions: 'Louay' + annId };
    //return item.after.ref.update(update);
//});

// sending invitations emails
export const sendInvitationEmails = functions.https.onRequest(/*async*/ (req: any, res: any) => {
    corsHandler(req, res, async() => {
    try {  
      const options = req.body

      const mailOptions = {
        from: '"Saint sauveur App" <donotreply@parkondo.com>', // sender address
        to: options.emailsList, // list of receivers
        subject: "Invitation to join Saint sauveur App", // Subject line
        text: options.invitationMsg, // plain text body
        html: "<b>" + options.invitationMsg + "</b><br><a href='https://play.google.com/store/apps/details?id=louay.arbash.saintsauveur'><b>Download on the Google Play (Android version)</b></a><br><a href='https://apps.apple.com/ca/app/parkondo/id1565989030'><b>Download on the App Store (Iphone version)</b></a>", // html body
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

async function sendPushNotifications(userId: string, type: string, itemId?: string, chanel?: string) {
//let titleEN = '', titleFR = '', titleAR = '', titleES = '';
//let bodyEN = '', bodyFR = '', bodyAR = '', bodyES= '';
let landing_page = '';
let headerEN = '', headerFR = '', headerAR = ''
let messageEN = '', messageFR = '', messageAR = '';

  switch (chanel) {    
    case "newAnnouncement" :
    landing_page = '/app/start-menu/announcements'

    headerEN = 'New announcement added'
    messageEN = 'Would you like to check it ?'
        
    headerFR = 'Nouvel avis a été ajouté'
    messageFR = 'Voulez-vous le  consulter ?'

    headerAR = 'اعلان جديد'
    messageAR = 'هل ترغب في الاضطلاع ؟'
    
    break;
        
  default:
  }
  
  const payloadEN = {
    notification: {
        title: headerEN,
        body: messageEN
    },
    data: {      
      landing_page: landing_page,
      header: headerEN,
      message: messageEN
    }
  }

  const payloadFR = {
    notification: {
        title: headerFR,
        body: messageFR
    },
    data: {      
      landing_page: landing_page,
      header: headerFR,
      message: messageFR
    }
  }

  const payloadAR = {
    notification: {
        title: headerAR,
        body: messageAR
    },
    data: {      
      landing_page: landing_page,
      header: headerAR,
      message: messageAR
    }
  }
  
  const tokensEN: string[] = [];
  const tokensFR: string[] = [];
  const tokensAR: string[] = [];
  
  //let users : any
  if(type === 'single'){
    const userRef = db.collection('users').doc(userId);    
    const user = await userRef.get();
    if (user.exists) {
      if(user.data()?.tokens){
        if((user.data()?.language === 'en')){        
          user.data()?.tokens.forEach((token: string) => {tokensEN.push( token )})        
      }
      else if(user.data()?.language === 'fr'){        
          user.data()?.tokens.forEach((token: string) => {tokensFR.push( token )})      
      }
      else if(user.data()?.language === 'ar'){        
          user.data()?.tokens.forEach((token: string) => {tokensAR.push( token )})        
      }
      }      
    }    
  }
  else if(type === 'all'){
    const usersRef = db.collection('users')
    const users = await usersRef.get(); 
  //const usersRef = db.collection('users').where('buildingId', '==', buildingId);
  
  if(users.size > 0){
    users.forEach(user => {

    if(user.data().tokens){

    if((user.data().language === 'en') /*&& (user.id !== userId)*/){      
        user.data().tokens.forEach((token: string) => {tokensEN.push( token )})      
    }
   
    else if((user.data().language === 'fr') /*&& (user.id !== userId)*/){     
        user.data().tokens.forEach((token: string) => {tokensFR.push( token )})    
    }
    
    else if((user.data().language === 'ar') /*&& (user.id !== userId)*/){      
        user.data().tokens.forEach((token: string) => {tokensAR.push( token )})
      }
    }
    }
    )
  }
}
    if (tokensEN.length > 0){
      admin.messaging().sendToDevice(tokensEN, payloadEN).then((response) => {
        console.log('Successfully sent message EN:', response);
      })
      .catch((error) => {
        console.log('Error sending message EN:', error);
      });
    }

    if (tokensFR.length > 0){
    admin.messaging().sendToDevice(tokensFR, payloadFR).then((response) => {
      console.log('Successfully sent message FR:', response);
    })
    .catch((error) => {
      console.log('Error sending message FR:', error);
    });
    }

    if (tokensAR.length > 0){
    admin.messaging().sendToDevice(tokensAR, payloadAR).then((response) => {
      console.log('Successfully sent message AR:', response);
    })
    .catch((error) => {
      console.log('Error sending message AR:', error);
    });
    }  
  //throw new Error('Function not implemented.');
}