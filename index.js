const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/ShowContacts', async (req,res) => {
    try{
        const contactToShow = await getContactDetails();
        res.status(200);
        res.setHeader("content-type", "application/json");
        res.send(contactToShow);
    }
    catch(e){
        console.log(e.message);
        res.status(404);
        res.send(JSON.stringify('Data Not Found'));
    }
});

async function getContactDetails(){
    const dataPath = './Data/MOCK_DATA.json';
    const dataToSend = await fs.readFile(dataPath);
    return dataToSend.toString();
};

app.listen(3030, () => console.log('Server listning on port 3000'));