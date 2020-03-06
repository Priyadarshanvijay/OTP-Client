let contact;
let otp;
function processUser() {
    const parameters = location.search.substring(1);
    if(parameters.split("=")[0] === 'success'){
        const mainForm = document.getElementById('m_form');
        mainForm.classList.remove('loading');
        document.getElementById('btn_validate').classList.add('disabled');
        if(parameters.split("=")[1] === 'true'){
            let prevClassValue = mainForm.getAttribute('class');
            prevClassValue += " success";
            mainForm.setAttribute('class', prevClassValue);
        }
        else{
            let prevClassValue = mainForm.getAttribute('class');
            prevClassValue += " error";
            mainForm.setAttribute('class', prevClassValue);
        }
        return;
    }
    let id = (parameters.split("=")[1]);
    let url = '/ShowContacts?id=';
    url += id;
    let data;
    fetch(url, {method:"GET"})
    .then(response => {
        if (response.status === 404) throw new Error('User not found');
        return response.text();
    })
    .then(response => {
        data = JSON.parse(response);
        contact = data;
        document.getElementById('name').innerText += ' ' + data.first_name + ' ' + data.last_name;
        document.getElementById('phone_number').innerText += ' ' + data.mobile_number;
        generateOTP();
    })
    .catch(e => {
        console.log(e.message);
    });
}
window.onload = processUser();
async function generateOTP() {
    let url = '/getOTP';
    fetch(url, { method: "GET" })
    .then(response => {
        if (response.status === 404) throw new Error('Unable to generate otp');
        return response.text();
    })
    .then(response => {
        const jsonDATA = JSON.parse(response);
        otp = jsonDATA.otp;
        document.getElementById('m_form').classList.remove('loading');
        document.getElementById('otp_message').value = `Hi. Your OTP is: ${otp} . Please do not share it with anybody else.`;
    })
    .catch(e => {
        console.log(e.message);
    })
}

const myForm = document.getElementById('m_form');
const btn = document.getElementById('btn_validate');

myForm.addEventListener('submit', (event) => {
    btn.classList.add('loading');
    event.preventDefault();
    let otpSent = false;
    const message = document.getElementById('otp_message').value;
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const raw = JSON.stringify({
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
    fetch(url, requestOptions)
    .then(response => response.json())
    .then(response => {
        otpSent =  response.success;
        if (otpSent) {
            window.location.replace("./send_message.html?success=true");
        }
        else{
            window.location.replace("./send_message.html?success=false");
        }
    })
    .catch(error => console.log(error));
})