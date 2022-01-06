//import * as functions from 'firebase-functions';
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
//import  CloudTasksClient  = require('@google-cloud/tasks');
//import { CloudTasksClient } from '@google-cloud/tasks';
//import * as dayjs from 'dayjs';
// The Firebase Admin SDK to access the Firebase Realtime Database.
import admin = require('firebase-admin');
import functions = require('firebase-functions');
const { CloudTasksClient } = require('@google-cloud/tasks');
import nodemailer = require('nodemailer');
import cors = require("cors");
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
    //buildingId? : string 
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
    .onCreate(async (item, context) => {
    
    const dealId = context.params.dealId;    

    const itemData = item.data();//.after.data();
    //const id = item.id
    
    if (itemData && itemData.status === "new"){
    
    if(itemData.type === "request"){
      sendPushNotifications(itemData.createdBy,'all', dealId, 'newRequestDeal').then(() => console.log('Notifications sent')).catch((err) => console.log('Notifications sending prob. ', err))
    }
    else if(itemData.type === "offer"){
      sendPushNotifications(itemData.createdBy,'all', dealId, 'newOfferDeal').then(() => console.log('Notifications sent')).catch((err) => console.log('Notifications sending prob. ', err))
    }    

    /* 2 */
    /* Cretate task to change status to expired */
    const dataFortask = itemData as InfoDocumentData;
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
    const item= await admin.firestore().doc(taskPayload.docPath).get();
    //const item = getItem.data() as InfoDocumentData;

    const itemData = item.data() as InfoDocumentData;;    

    //res.send("Hello from Firebase!");
    //const createdBy = item.createdBy;
    
    if(itemData.type === "request"){
      userId = itemData.createdBy ?  itemData.createdBy : null
    }
    else { 
      userId = itemData.responseBy ?  itemData.responseBy : null
    }

    if(userId){
    // ref to the device collection for the user

    sendPushNotifications(userId, 'single', item.id,'reminderToLeave').then(() => console.log('Notifications sent')).catch((err) => console.log(err))

    }
    else res.status(500)
    }
    catch (error) {
        console.error(error)
        res.status(500).send(error)
    }

})

exports.onUpdateRequest = functions.firestore.document('deals/{dealId}').onUpdate(async item => {
    const before = item.before.data() as InfoDocumentData
    const after = item.after.data() as InfoDocumentData
  
    // Canceled (by creator) (OK)
    if ((before.status === "new") && (after.status === "canceled") && (after.actionTaskExpired)){

        await tasksClient.deleteTask({ name: after.actionTaskExpired });
        const update : InfoDocumentData = { actionTaskExpired : admin.firestore.FieldValue.delete() };
            return item.after.ref.update(update);
    }
    // Canceled (by creator) - after acceptance (OK)
    else if ((before.status === "accepted" || before.status === "started") && (after.status === "canceled")){
    if ( after.actionTaskStarted ) { // before status === "accepted"

            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskStarted });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskStarted : admin.firestore.FieldValue.delete() , actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
    } 
    else if( after.actionTaskReminder ) { // deal started (before status === "started")
            tasksClient.deleteTask({ name: after.actionTaskReminder });
            tasksClient.deleteTask({ name: after.actionTaskEnded });
            
            const update : InfoDocumentData = { actionTaskReminder : admin.firestore.FieldValue.delete(), actionTaskEnded : admin.firestore.FieldValue.delete() };
            await item.after.ref.update(update);
    }
    else if( after.actionTaskEnded ) { // deal reminded
      tasksClient.deleteTask({ name: after.actionTaskEnded });
      
      const update : InfoDocumentData = { actionTaskEnded : admin.firestore.FieldValue.delete() };
      await item.after.ref.update(update);
}

    if(before.createdBy){
    sendPushNotifications(before.createdBy,'single', undefined,'canceledCreator').then(() => console.log('Notifications sent')).catch((err) => console.log(err))
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
  
      if(before.createdBy){
      // ref to the device collection for the user
      sendPushNotifications(before.createdBy, 'single',undefined,'canceledResponder').then(() => console.log('Notifications sent')).catch((err) => console.log(err))
  
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
    
      const requestType = before.type === "request" ? `requestAccepted`:`offerAccepted`


      if(before.createdBy){
      // ref to the device collection for the user
      sendPushNotifications(before.createdBy, 'single',undefined, requestType).then(() => console.log('Notifications sent')).catch((err) => console.log(err)) 
  
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

async function sendPushNotifications(userId: string, type: string, itemId?: string, chanel?: string) {
//let titleEN = '', titleFR = '', titleAR = '', titleES = '';
//let bodyEN = '', bodyFR = '', bodyAR = '', bodyES= '';
let landing_page = '';
let headerEN = '', headerFR = '', headerAR = '', headerES = ''
let messageEN = '', messageFR = '', messageAR = '', messageES = '';

  switch (chanel) {    
    case "newRequestDeal" :
    landing_page = '/app/start-menu/deal'

    headerEN = 'New parking request'
    messageEN = 'Would you like to check if you can help ?'
        
    headerFR = 'Nouvelle demande de stationnement'
    messageFR = 'Voulez-vous vérifier si vous pouvez aider ?'

    headerAR = 'طلب موقف جديد'
    messageAR = 'هل ترغب في التحقق مما إذا كان بإمكانك المساعدة ؟'

    headerES = 'Nueva solicitud de estacionamiento'    
    messageES = 'Le gustaría comprobar si puede ayudar ?'
    
    break;
    
    case "newOfferDeal" :       
    landing_page = '/app/start-menu/deal'

    headerEN = 'New parking offer'
    messageEN = 'Would you like to check the offer ?'
    
    headerFR = 'Nouvelle offre de stationnement'
    messageFR = 'Voulez-vous vérifier l\'offre ?'
    
    headerAR = 'عرض موقف جديد'
    messageAR = 'هل ترغب في الاضطلاع على العرض ؟'
    
    headerES = 'Alguien está ofreciendo un estacionamiento'
    messageES = 'Quieres consultar la oferta ?'

    break;    
    case "reminderToLeave" : 

    landing_page = '/app/start-menu/deal'

    headerEN = 'Reminder'
    messageEN = 'Time to move your car!'
    
    headerFR = 'Rappel'
    messageFR = 'Il est temps de déplacer votre voiture !'
    
    headerAR = 'تذكير'
    messageAR = 'حان الوقت لتحريك سيارتك!'
    
    headerES = 'Recordatorio'
    messageES = 'Es hora de mover tu coche!'

    break;    
    case "canceledCreator" : 

    landing_page = '/app/start-menu/deal'

    headerEN = 'Deal is canceled'
    messageEN = 'Deal is canceled by creator!'
    
    headerFR = 'L\'accord est annulé'
    messageFR = 'L\'offre est annulée par le créateur !'
    
    headerAR = 'تم إلغاء الصفقة'
    messageAR = 'تم إلغاء الصفقة من قبل المنشئ!'
    
    headerES = 'La oferta está cancelada'
    messageES = 'El creador canceló la oferta.'

    break;    
  case "canceledResponder" : 

    landing_page = '/app/start-menu/deal'

    headerEN = 'Deal canceled'
    messageEN = 'Your deal is canceled by responder!'
    
    headerFR = 'Accord annulé'
    messageFR = 'L\'accord est annulé par le répondeur!'
    
    headerAR = 'صفقة ملغاة'
    messageAR = 'تم إلغاء الصفقة من قبل المجيب!'
    
    headerES = 'Acuerdo cancelado'
    messageES = 'El respondedor cancela la oferta!'

    break;    
  case "requestAccepted" : 

    landing_page = '/app/start-menu/deal'
    
    headerEN = 'Request accepted!'
    messageEN = 'Your request is accepted!'
    
    headerFR = 'Demande acceptée!'
    messageFR = 'Ta demande est acceptée!'
    
    headerAR = 'طلب مقبول'
    messageAR = 'تم قبول طلبك!'
    
    headerES = 'Petición aceptada!'
    messageES = 'Su solicitud es aceptada!'

    break;
  case "offerAccepted" : 

    landing_page = '/app/start-menu/deal'

    headerEN = 'Offer accepted'
    messageEN = 'Your offer is accepted!'
    
    headerFR = 'Offre acceptée'
    messageFR = 'Votre offre est acceptée'
    
    headerAR = 'غرض مقبول'
    messageAR = 'تم قبول عرضك'
    
    headerES = 'Oferta aceptada'
    messageES = 'Su oferta es aceptada'

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

  const payloadES = {
    notification: {
        title: headerES,
        body: messageES
    },
    data: {      
      landing_page: landing_page,
      header: headerES,
      message: messageES
    }
  }
  
  const tokensEN: string[] = [];
  const tokensFR: string[] = [];
  const tokensAR: string[] = [];
  const tokensES: string[] = [];
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
      else if(user.data()?.language === 'es'){        
          user.data()?.tokens.forEach((token: string) => {tokensES.push( token )})        
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

    if((user.data().language === 'en') && (user.id !== userId)){      
        user.data().tokens.forEach((token: string) => {tokensEN.push( token )})      
    }
   
    else if((user.data().language === 'fr') && (user.id !== userId)){     
        user.data().tokens.forEach((token: string) => {tokensFR.push( token )})    
    }
    
    else if((user.data().language === 'ar') && (user.id !== userId)){      
        user.data().tokens.forEach((token: string) => {tokensAR.push( token )})
      }
    
    else if((user.data().language === 'es') && (user.id !== userId)){      
        user.data().tokens.forEach((token: string) => {tokensES.push( token )})
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

    if (tokensES.length > 0){
    admin.messaging().sendToDevice(tokensES, payloadES).then((response) => {
      console.log('Successfully sent message ES:', response);
    })
    .catch((error) => {
      console.log('Error sending message ES:', error);
    });
  }    
  //throw new Error('Function not implemented.');
}