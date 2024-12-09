const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { beforeUserCreated, HttpsError: HttpsErrorIdentity } = require("firebase-functions/v2/identity");
const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions/v2");

const nodemailer = require("nodemailer");
const _ = require("lodash");
const __ = require("firebase-functions/logger/compat");
admin.initializeApp();

const firestore = admin.firestore();
setGlobalOptions({ region: "us-central1" })

exports.deleteUserById = onCall({ cors: true }, async (request) => {
  console.log('request', request);
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated users can delete users."
    );
  }

  // Extract the ID of the user to delete from the request data
  const userId = request.data.userId;
  console.log(userId);

  if (!userId) {
    throw new HttpsError(
      "invalid-argument",
      "User ID must be provided."
    );
  }

  try {
    await admin.auth().deleteUser(userId);

    const userDoc = await firestore.collection("Users").doc(userId).get();
    if (userDoc.exists) {
      await firestore.collection("Users").doc(userId).delete();
    }

    const offersRef = firestore.collection('Offers');
    const offers = await offersRef.where('userId', '==', userId).get();
    if (offers && offers.size > 0) {
      offers.forEach(async offer => {
        await offersRef.doc(offer.id).delete();
      });
    }

    return { message: `User with ID ${userId} successfully deleted.` };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new HttpsError("internal", "Error deleting user.");
  }
});

exports.sendEmail = onCall({ cors: true }, async (data, context) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    auth: {
      user: `support@nxt.one`,
      pass: `iwkqlxijtpxrpigy`,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const results = [];
  let pdfResponse;
  if (data.contacts.some((c) => c.prospectSheet)) {
    pdfResponse = await admin.storage().bucket().file(data.pdf).download();
  }

  for (const {
    from,
    to,
    cc,
    html,
    subject,
    prospectSheet,
    pdfName,
  } of data.contacts) {
    try {
      let attachments = [];
      if (prospectSheet) {
        attachments = [
          ...attachments,
          {
            filename: pdfName,
            content: pdfResponse[0],
          },
        ];
      }
      const sendData = {
        from,
        to,
        cc,
        subject,
        html,
        attachments,
      };

      await transporter.sendMail(sendData);
      results.push({ to, status: "success" });
    } catch (error) {
      console.error(`Failed to send email to ${to}: ${error}`);
      results.push({ to, status: "error", error });
    }
  }

  // Delete the file from Firebase Cloud Storage
  try {
    await admin.storage().bucket().file(data.pdf).delete();
    console.log("File deleted successfully");
  } catch (err) {
    console.error("Error deleting file:", err);
  }

  return { results };
});

exports.sendOffersPushNotifications = onDocumentWritten('Offers/{offerId}', (event) => {

  const offerData = event.data.after.exists ? event.data.after.data() : null;

  if (offerData && offerData.share) {
    console.log(offerData);
    const allPushNotifications = [];
    const excludedUserId = offerData.userId;
    const usersRef = admin.firestore().collection('Users');
    return usersRef.where('fcmToken', '!=', null).where('pushNotifications', '==', true).get()
      .then(querySnapshot => {
        querySnapshot.forEach((userDoc) => {
          const userId = userDoc.id;

          if (userId !== excludedUserId) {
            const userData = userDoc.data();
            const fcmToken = userData.fcmToken;
            const message = `${offerData.name} ${offerData.message}`;
            const deepLink = "app.nxt1sports.com/offers";
            allPushNotifications.push(sendPushNotification(fcmToken, { body: message, deepLink }));
          }
        });
        return Promise.all(allPushNotifications);
      }).catch(error => {
        console.error('Error while sending push:', error)
      });
  }
  return Promise.resolve();
}
);

async function sendPushNotification(fcmToken, { title, body, deepLink }) {
  const message = {
    token: fcmToken,
    notification: {
      body,
    },
    android: {
      notification: {
        click_action: deepLink
      }
    },
    webpush: {
      fcmOptions: {
        link: deepLink
      }
    },
  };

  // Send the message using the FCM send API
  return admin.messaging().send(message)
    .then((response) => {
      console.log('Push notification sent successfully:', response);
    })
    .catch((error) => {
      console.error('Error sending push notification:', error);
    });
}

exports.subscribeToTopic = onCall({ cors: { origin: true } }, async (request) => {
  await admin.messaging().subscribeToTopic(request.data.token, request.data.topic);
  return `subscribed to ${request.data.topic}`
});

exports.unsubscribeFromTopic = onCall({ cors: { origin: true } }, async (request) => {
  await admin.messaging().unsubscribeFromTopic(request.data.token, request.data.topic);
  return `unsubscribed from ${request.data.topic}`
});

exports.beforeCreate = beforeUserCreated(async (event) => {
  console.log(event);

  const user = event.data;
  if (!event.credential) {
    return Promise.resolve();
  }

  const email = user.providerData[0].email;
  const users = await firestore.collection("Users").where('email', '==', email).limit(1).get();
  if (users && users.size > 0) {
    throw new HttpsErrorIdentity('already-exists', 'User already exists!');
  }

  if (event.credential &&
    event.credential.providerId === 'google.com') {
    const refreshToken = event.credential.refreshToken;
    const uid = user.uid;
    const hasSendEmailPermission = event.additionalUserInfo.profile.granted_scopes.includes('gmail.send');
    const newUser = {
      uid: uid,
      email: email,
      createdAt: new Date(),
      credits: 3,
      lastActivatedPlan: 'trial',
    }
    if (hasSendEmailPermission) {
      newUser.connectedEmail = email;
      newUser.connectedGmailToken = refreshToken;
    }

    return firestore.collection("Users").doc(uid).set(newUser).then(_ => {
      console.log('user google.com');
    }).catch((error) => {
      console.error("Error", error);
    });
  }

  if (event.credential &&
    event.credential.providerId === 'microsoft.com') {
    const refreshToken = event.credential.refreshToken;
    const uid = user.uid;
    return firestore.collection("Users").doc(uid).set({
      uid: uid,
      email: email,
      connectedEmail: email,
      connectedMicrosoftToken: refreshToken,
      createdAt: new Date(),
      credits: 3,
      lastActivatedPlan: 'trial',
    }).then(_ => {
      console.log('user microsoft.com');
    }).catch((error) => {
      console.error("Error", error);
    });
  }

  return Promise.resolve();
});
