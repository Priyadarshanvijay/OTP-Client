const express = require('express');
const fsO = require('fs');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.Server(app);
require('dotenv').config()
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

app.use(express.json());
app.use(express.static('client'));
app.use(cors());


app.get('/ShowContacts', async (req, res) => {
    try {
        const contactToShow = await getContactDetails(req.query.id);
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(contactToShow);
    }
    catch (e) {
        console.log(e.message);
        res.status(404);
        res.setHeader("content-type", "application/json");
        res.json({
            error_code: 1,
            error: 'Data not found'
        });
    }
});

app.get('/getOTP', async (req, res) => {
    try {
        const otp = await getOTP();
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(otp);
    }
    catch (e) {
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
    try {
        console.log(req.body.mobile_number)
        let otpSent = false;
        await client.messages
            .create({
                body: req.body.message,
                from: '+12055707827',
                to: `${req.body.mobile_number}`
            }).then(message => {
                otpSent = true;
                console.log(message.sid);
                let otpLogged;
                if (otpSent) {
                    //log into file function
                    // console.log(req.body);
                    otpLogged = logOTPToFile(req.body);
                }
                if (!otpLogged) {
                    throw new Error('Unable to log otp');
                }
                res.status(200);
                res.setHeader("content-type", "application/json");
                res.send({
                    success: true
                });
            })
            .catch(e => {
                console.log(e.message);
            })
        if(!otpSent) throw new Error('Unable to send OTP');
    }
    catch (e) {
        console.log('Fail');
        res.status(400);
        res.setHeader("content-type", "application/json");
        res.json({
            success: false,
            reason: e.message
        });
    }
});

app.get('/getMessages', async (req, res) => {
    try {
        const dataToSend = await readOTP();
        if (!dataToSend) throw new Error('Data not found');
        res.status(200);
        res.setHeader('content-type', 'application/json');
        res.send(dataToSend);
    }
    catch (e) {
        res.status(400);
        res.setHeader("content-type", "application/json");
        res.json({
            success: false,
            reason: e.message
        });
    }
});

async function readOTP() {
    const path = './Data/otp_sent.json';
    const dataBuffer = await fs.readFile(path);
    let data = dataBuffer.toString();
    if (data === '') throw new Error('no otp sent');
    data = JSON.parse(data);
    return data;
}

async function logOTPToFile(logObject) {
    let logged;
    try {
        const path = './Data/otp_sent.json';
        const dataBuffer = await fs.readFile(path);
        let data = dataBuffer.toString();
        if (data != '') {
            data = JSON.parse(data);
        }
        else {
            data = [];
        }
        data.push(logObject);
        fsO.writeFileSync(path, JSON.stringify(data));
        logged = true;
    }
    catch (e) {
        console.log(e.message);
        logged = false;
    }
    return logged;
}

async function getOTP(id) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return {
        otp: otp
    };
}

async function getContactDetails(id) {
    const dataPath = './Data/MOCK_DATA.json';
    const dataToSendBuffer = await fs.readFile(dataPath);
    let dataToSend = dataToSendBuffer.toString();
    if (id) {
        dataToSend = JSON.parse(dataToSend);
        if (id > dataToSend.length) throw new Error('Data not found');
        dataToSend = dataToSend[id - 1];
    }
    return dataToSend;
};
const port = process.env.PORT;
server.listen(port, () => console.log(`Server listning on port ${port}`));