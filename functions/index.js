const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com ',
    port: 465,
    auth: {
        user: 'xxxxxxxxxxxxx',
        pass: 'xxxxxxxxxxxxx'
    }
});


/*
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);
*/

exports.sendContactMessage = functions.database.ref('/messages/{pushKey}').onWrite((change, context) => {
    const snapshot = change.before;

    // Only send email for new messages.
    if (snapshot.val() || !change.after.val().name) {
        return;
    }

    const val = change.after.val();

    const mailOptions = {
        to: 'jcmouy@gmail.com',
        from: val.email,
        subject: `Information Request from ${val.name}`,
        html: val.html
    };
    /*
    return mailTransport.sendMail(mailOptions).then(() => {
        return console.log('Mail sent to: jcmouy@gmail.com');
    });
    */
    return transporter.sendMail(mailOptions).then(() => {
        return console.log('Mail sent to: jcmouy@gmail.com');
    });
});
