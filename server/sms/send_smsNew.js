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
        apiKey: '00bbbb9e',
        apiSecret: 'Y089XltdJHt433k5',
    });
    */

    //Pablo
    const nexmo = new Nexmo({
        apiKey: '6bb5e10a',
        apiSecret: 'J6Qg8PChahKg6I7J',
    });

    const from = 'HireATeacher';
    //const to = '59899946874';
    const to = mobile;
    const text = 'Hello! Welcome to HireATeacher. Your OPT is' + otp_prefix + " " + otp_string;

    nexmo.message.sendSms(from, to, text);
}