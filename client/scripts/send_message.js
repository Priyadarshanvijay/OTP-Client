let contact;
let otp;
function processUser() {
    //capture from query string that whether we have to make a POST request or we have to display
    //response of post request made from click of send button
    const parameters = location.search.substring(1);
    if(parameters.split("=")[0] === 'success'){
        //we have to display response of post request made from click of send button
        const mainForm = document.getElementById('m_form');
        mainForm.classList.remove('loading'); //remove loading state from form
        document.getElementById('btn_validate').classList.add('disabled'); //disable the send button
        if(parameters.split("=")[1] === 'true'){
            //if OTP was sent successfully
            let prevClassValue = mainForm.getAttribute('class');
            prevClassValue += " success"; 
            mainForm.setAttribute('class', prevClassValue); //display success messagge
        }
        else{
            //if OTP was'nt sent successfully
            let prevClassValue = mainForm.getAttribute('class');
            prevClassValue += " error";
            mainForm.setAttribute('class', prevClassValue); //display error message
        }
        return; //message displayed, no need to propogate further
    }
    //we have to make a POST request to send OTP
    //so get contact id from query string
    let id = (parameters.split("=")[1]);
    let url = '/ShowContacts?id=';
    url += id;
    let data;
    fetch(url, {method:"GET"}) //fetch user data according to ID from JSON file
    .then(response => {
        if (response.status === 404) throw new Error('User not found'); //user not found and server sends back 404 code
        return response.text(); //user found, extracting response.text and sending to next .then statement
    })
    .then(response => {
        data = JSON.parse(response);
        contact = data;//storing contact info in global contact variable so that multiple functions can use that
        //Displaying name and phone number of the person to whom the otp is being sent
        document.getElementById('name').innerText += ' ' + data.first_name + ' ' + data.last_name;
        document.getElementById('phone_number').innerText += ' ' + data.mobile_number;
        //now that we have the contact details of the person, we generate otp from the server
        generateOTP();
    })
    .catch(e => {
        // Alas! :/ some error occoured
        console.log(e.message);
    });
}
//as soon as the document completes loading, run the first function, so we do not try to access elements which have not
//yet been rendered
window.onload = processUser();
async function generateOTP() {
    let url = '/getOTP';
    fetch(url, { method: "GET" }) //we request the server to generate otp
    .then(response => {
        if (response.status === 404) throw new Error('Unable to generate otp'); //server was'nt able to generate otp
        return response.text(); //we've received otp
    })
    .then(response => {
        const jsonDATA = JSON.parse(response);
        otp = jsonDATA.otp;
        document.getElementById('m_form').classList.remove('loading'); //make the textarea ready 
        document.getElementById('otp_message').value = `Hi. Your OTP is: ${otp} . Please do not share it with anybody else.`; //and show the otp
    })
    .catch(e => {
        console.log(e.message);
    })
}

const myForm = document.getElementById('m_form');
const btn = document.getElementById('btn_validate');

myForm.addEventListener('submit', (event) => {
    //what to do when send button is cliked? How to send the OTP?? This way!
    btn.classList.add('loading'); //set the send button to loading, so as to provide the user feel that some work is being done
    event.preventDefault();
    let otpSent = false; //sentinal value of otp sent status
    const message = document.getElementById('otp_message').value; //capture the message written in textarea
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({ //body of post request
        id: contact.id,
        otp: otp,
        message : message,
        mobile_number : contact.mobile_number,
        first_name : contact.first_name,
        last_name : contact.last_name,
        time_of_sending : new Date()
    });
    const requestOptions = {
        method: 'POST',
        headers : myHeaders,
        body: raw
    };
    const url = "/otpSent";
    fetch(url, requestOptions) //post request
    .then(response => response.json())
    .then(response => {
        otpSent =  response.success; //status of our otp being sent
        if (otpSent) { // yayyyy positive status, let's set the status to success!!
            window.location.replace("./send_message.html?success=true");
        }
        else{ // oh no! we were'nt able to send the otp, let's let the user know the request failed
            window.location.replace("./send_message.html?success=false");
        }
    })
    .catch(error => console.log(error));
})