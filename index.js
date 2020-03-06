const express = require('express');
const fsO = require('fs');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const cors = require('cors'); 
const http = require('http');
const server = http.Server(app);
require('dotenv').config() //configuring environment file
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN); //initialising twilio client for sending sms

app.use(express.json());
app.use(express.static('client')); //serving static pages
app.use(cors()); //for CORS


app.get('/ShowContacts', async (req, res) => {
    try {
        //pass query parameter id, if given, else would return all the user details
        const contactToShow = await getContactDetails(req.query.id);
        //successfully procssed request, send response to client
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(contactToShow);
    }
    catch (e) {
        //error occoured, send 404 to client
        console.log(e.message); //we can also use winston logging here
        res.status(404);
        res.setHeader("content-type", "application/json");
        res.json({
            error_code: 1,
            error: 'Data not found'
        });
    }
});

app.get('/getOTP', async (req, res) => {
    //generate otp to send to client
    try {
        const otp = await getOTP();
        //otp generated!
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(otp);
    }
    catch (e) {
        //unable to generate otp
        console.log(e.message);
        res.status(404);
        res.setHeader("content-type", "application/json");
        res.json({
            error_code: 2,
            error: 'Unable to generate otp'
        });
    }
});

app.post('/otpSent', async (req, res) => {
    //now sending the otp/ any other message in that sense to the intended receipient 
    try {
        console.log(req.body.mobile_number) //log the phone number to which we are sending
        let otpSent = false; //current status is that we have'nt sent otp
        await client.messages //the method provided by twilio, we wait for it to complete
            .create({
                body: req.body.message, //sms to be sent
                from: '+12055707827', //source mobile no, provided by twilio
                to: `${req.body.mobile_number}` //destination mobilw no is the format +YYXXXXXXXXXX
            }).then(message => { //otp sent successfully
                otpSent = true; //current status is that we have sent otp
                console.log(message.sid); //log the unique sid provided by twilio
                let otpLogged;//status of sent message details logged to our local file
                if (otpSent) {
                    //log into file function
                    // console.log(req.body);
                    otpLogged = logOTPToFile(req.body);
                }
                if (!otpLogged) {
                    //unable to log message to local file
                    throw new Error('Unable to log otp');
                }
                res.status(200);
                res.setHeader("content-type", "application/json");
                res.send({
                    success: true //send success status back to client
                });
            })
            .catch(e => {
                console.log(e.message);
            })
        if(!otpSent) throw new Error('Unable to send OTP');// otp is not sent, send error to client
    }
    catch (e) {
        console.log('Fail');
        res.status(400);
        res.setHeader("content-type", "application/json");
        //send failure response and reason to client
        res.json({
            success: false,
            reason: e.message
        });
    }
});

app.get('/getMessages', async (req, res) => {
    //read all sent message logs to client
    try {
        const dataToSend = await readOTP(); //call function that will give us the rquired data
        if (!dataToSend) throw new Error('Data not found'); //data not found, send user 400 status code
        res.status(200); //data successflly found, send user OK response with data
        res.setHeader('content-type', 'application/json');
        res.send(dataToSend);
    }
    catch (e) {
        //dat not found or some error occoured
        res.status(400);
        res.setHeader("content-type", "application/json");
        //send failure response and reason to client
        res.json({
            success: false,
            reason: e.message
        });
    }
});

async function readOTP() {
    const path = './Data/otp_sent.json'; //file in which sent message log is being maintained
    const dataBuffer = await fs.readFile(path); //read the file bufferdata
    let data = dataBuffer.toString(); //convert the buffer to data
    if (data === '') throw new Error('no otp sent'); //no messages sent till now
    data = JSON.parse(data); //found sent messages
    return data; //return them
}

async function logOTPToFile(logObject) {
    //logging each message being sent to a JSON file
    let logged;// not yet logged the message
    try {
        const path = './Data/otp_sent.json'; //file in which logging is to be done
        const dataBuffer = await fs.readFile(path); //first retrieve previous messages 
        let data = dataBuffer.toString();
        if (data != '') { //there were messages present
            data = JSON.parse(data);
        }
        else { //no messages were sent till now
            data = [];
        }
        data.push(logObject); // push the current message log into array to be written into file
        fsO.writeFileSync(path, JSON.stringify(data)); //write that array to file
        logged = true; //message which was sent successfully logged
    }
    catch (e) {
        console.log(e.message);
        logged = false; //unable to log message
    }
    return logged; // return the status of message logging
}

async function getOTP(id) {
    //simple 6 digit otp generation function in which otp doesn't starts with 0
    const otp = Math.floor(100000 + Math.random() * 900000);
    return {
        otp: otp
    };
}

async function getContactDetails(id) {
    //get contact details from this file
    const dataPath = './Data/MOCK_DATA.json';
    const dataToSendBuffer = await fs.readFile(dataPath);
    let dataToSend = dataToSendBuffer.toString();
    if (id) { //either a single contact detail
        dataToSend = JSON.parse(dataToSend);
        if (id > dataToSend.length) throw new Error('Data not found');
        dataToSend = dataToSend[id - 1];
    } // or maybe all
    return dataToSend;
};
const port = process.env.PORT || 3030;
server.listen(port, () => console.log(`Server listning on port ${port}`)); //starting the server