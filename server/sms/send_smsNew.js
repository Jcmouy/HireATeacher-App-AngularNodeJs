const url = require('url');

module.exports = send_smsNew;

function send_smsNew(mobile, otp) {

    const Nexmo = require('nexmo');

    let otp_string = otp.toString();
    let otp_prefix = ":";

    var regExp = /[+][0-9].*$/;

    if (regExp.test(mobile)) {
        console.log('entra en char');
        mobile = mobile.substring(1, 12);
    }


    let mobile_string = mobile.toString();

    console.log(mobile_string);

    /*JC
    const nexmo = new Nexmo({
        apiKey: 'xxxxxxxxxx',
        apiSecret: 'xxxxxxxxx',
    });
    */

    //Pablo
    const nexmo = new Nexmo({
        apiKey: 'xxxxxxxxxx',
        apiSecret: 'xxxxxxxxxxxx',
    });

    const from = 'HireATeacher';
    //const to = 'xxxxxxxxxxx';
    const to = mobile;
    const text = 'Hello! Welcome to HireATeacher. Your OPT is' + otp_prefix + " " + otp_string;

    nexmo.message.sendSms(from, to, text);
}
