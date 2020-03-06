let id;
function processUser() {
    //parsing the query string to see that for which user do we have to show details
    const parameters = location.search.substring(1);
    id = (parameters.split("=")[1]);
    (async () => {
        try {
            let url = '/ShowContacts?id=';
            url += id;
            const response = await fetch(url, { method: "GET" }); //make the fetch request, this is another way of making fetch request
            if (response.status === 404) throw new Error('User not found'); //no user found
            const data = await response.text();
            const jsonDATA = JSON.parse(data); //parse response into JSON
            //populate the fields with users details
            document.getElementById('name').innerText += ' ' + jsonDATA.first_name + ' ' + jsonDATA.last_name;
            document.getElementById('phone_number').innerText += ' ' + jsonDATA.mobile_number;
            document.getElementById('email_id').innerText += ' ' + jsonDATA.email;
        } catch (e) {
            console.log(e.message)
        }
    }
    )();
}

window.onload = () => {
    //when the window completes loading
    processUser(); //get user details
    document.getElementById('send_message').addEventListener('click', () => { //add on click behaviour to send message button
        location.href = "./send_message.html?userid="+id; //give the id of current user as query param
    });
}