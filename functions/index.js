//
// https://firebase.google.com/docs/firestore/quickstart
//

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Initialize express
const app = express();
// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Initialize Firestore
admin.initializeApp(functions.config().firebase);
let db = admin.firestore();

// express routes
// /app/v1/uml/xexSn6rPC0StrI3uUZEY/EqV2TFjWApYkF2DUQ1ZK/TzwFK8y5MKJaXHHNO5go
app.get('/v1/uml/:groupId/:repositoryId/:documentId',
  (req, res) => {
    let docRef = db.collection('groups').doc(req.params.groupId)
                   .collection('repositories').doc(req.params.repositoryId)
                   .collection('documents').doc(req.params.documentId);
    docRef.get()
      .then(doc => {
        if (!doc.exists) {
          return res.sendStatus(404);
        // TODO Authentication
        // https://firebase.google.com/docs/auth/admin/manage-sessions
        // https://stackoverflow.com/questions/42751074/how-to-protect-firebase-cloud-function-http-endpoint-to-allow-only-firebase-auth/42752550
        // } else if (admin.auth() === null && doc.data().visibility !== 'public') {
        //   return res.sendStatus(403);
        } else {
          return res.send(doc.data().body);
        }
      })
      .catch((err) => {
        console.error(err);
        return res.sendStatus(500);
      });
  });

exports.app = functions.https.onRequest(app);
