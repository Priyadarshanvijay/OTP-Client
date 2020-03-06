let id;
function processUser() {
    const parameters = location.search.substring(1);
    id = (parameters.split("=")[1]);
    (async () => {
        try {
            let url = 'http://localhost:3030/ShowContacts?id=';
            url += id;
            const response = await fetch(url, { method: "GET" });
            if (response.status === 404) throw new Error('User not found');
            const data = await response.text();
            const jsonDATA = JSON.parse(data);
            document.getElementById('name').innerText += ' ' + jsonDATA.first_name + ' ' + jsonDATA.last_name;
            document.getElementById('phone_number').innerText += ' ' + jsonDATA.mobile_number;
            document.getElementById('email_id').innerText += ' ' + jsonDATA.email;
        } catch (e) {
            console.log(e.message)
        }
    }
    )();
}
processUser();

window.onload = () => {
    document.getElementById('send_message').addEventListener('click', () => {
        location.href = "./send_message.html?userid="+id;
    });
}