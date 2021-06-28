const expressJwt = require('express-jwt');
const tk = require('../tk.json');
const express = require('express');
const app = express();

module.exports = jwt;

function jwt() {
    const secret = tk.secret;
    console.log('tk ' + secret);
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/teachers/authenticate',
            '/teachers/verification',
            '/teachers/register'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = app.use('/teachers', require('../teachers/teachers.controller'));

    // revoke token if user no longer exists
    if (!user) {
        return done(null, true);
    }

    done();
};