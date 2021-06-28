const sendGrid = require('sendgrid').mail;
const emailTK = require('../emailTk.json');

module.exports = sendVerificationEmail;

function sendVerificationEmail(to, token) {
    const sg = require('sendgrid')(emailTK.emailTK_Api);
    const hostUrl = 'http://localhost:4200';
    const request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: {
            personalizations: [{
                to: [{
                    email: to
                }],
                subject: "Verify Your Email"
            }],
            from: {
                email: "javier.coronel@estudiantes.utec.edu.uy"
            },
            content: [{
                type: 'text/plain',
                value: `Click on this link to verify your email ${hostUrl}/verification?token=${token}&email=${to}`
            }]
        }
    });
    sg.API(request, function(error, response) {
        if (error) {
            console.log('Error response received');
        }
        console.log(response.statusCode);
        console.log(response.body);
        console.log(response.headers);
    });
}