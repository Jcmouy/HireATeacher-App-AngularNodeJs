const url = require('url');

module.exports = send_sms;

function send_sms(mobile, otp) {

    const accountSid = 'AC8ec5f9d8ec76e517ebf279f05b4bdeda';
    const authToken = 'c2678ebef0064591b7ad7c4c65feafd8';
    const client = require('twilio')(accountSid, authToken);

    var regExp = /^0[0-9].*$/;
    let otp_string = otp.toString();
    let otp_prefix = ":";

    console.log(mobile);
    console.log(otp_string);

    console.log(mobile.charAt(0));

    console.log(regExp.test(mobile));

    if (regExp.test(mobile)) {
        console.log('entra en char');
        mobile = mobile.substring(1, 9);
    }

    console.log(mobile);

    client.messages
        .create({
            body: 'Hello! Welcome to HireATeacher. Your OPT is' + otp_prefix + " " + otp_string,
            from: '+14253683292',
            to: '' + mobile + ''
        })
        .then(message => console.log(message.sid));

    /*
    //from: '+18566197912',


    let urlStr = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

    let otp_string = otp.toString();
    let otp_prefix = ":";

    console.log('mobile to send sms: ' + mobile);

    let quotes = "Hello! Welcome to HireATeacher. Your OPT is " + otp_prefix + " " + otp_string;

    rand.Seed(time.Now().Unix())

    msgData = url.Values {};
    msgData.Set("To", mobile);
    msgData.Set("From", "+18566197912");
    msgData.Set("Body", quotes);
    msgDataReader = * strings.NewReader(msgData.Encode())

    client: = & http.Client {}
    req, _: = http.NewRequest("POST", urlStr, & msgDataReader)
    req.SetBasicAuth(accountSid, authToken)
    req.Header.Add("Accept", "application/json")
    req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

    resp, _: = client.Do(req)
    if resp.StatusCode >= 200 && resp.StatusCode < 300 {
        var data map[string] interface {}
        decoder: = json.NewDecoder(resp.Body)
        err: = decoder.Decode( & data)
        if err == nil {
            fmt.Println(data["sid"])
        }
    } else {
        fmt.Println(resp.Status)
    }
    */
}