//File with queries

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('./_helpers/jwt');
const errorHandler = require('./_helpers/error-handler');

var fs = require('fs');
var https = require('https');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT auth to secure the api
//app.use(jwt());

//Port to employ
const port = 3000;

/*HTTPS
https.createServer({
    key: fs.readFileSync('f:\\AngularCertificate\\localhost.key'),
    cert: fs.readFileSync('f:\\AngularCertificate\\localhost.crt')
}, app).listen(port, function() {
    console.log("My https server listening on port " + port + "...");
});
*/

app.use('/teachers', require('./teachers/teachers.controller'));
app.use('/students', require('./students/students.controller'));

// global error handler
app.use(errorHandler);


const server = app.listen(port, function() {
    console.log('Server listening on port ' + port);
});