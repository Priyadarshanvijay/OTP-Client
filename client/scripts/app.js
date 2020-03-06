function createCard(cardData) { //function to create contact first name and last name card from data received from json file that
  //links to specific id of each contact
  const cardTemplate = [
    `<div class="ui column sixteen wide fluid">
      <a class="ui link raised card fluid" href='./contact_info.html?userid=${cardData.id}'>
        <div class="content">
          ${cardData.first_name} ${cardData.last_name}
        </div>
      </a>
    </div>`
  ];
  return $(cardTemplate.join(''));
}

function createOTPCard(cardData){
  //function to create sent otp detail card from data received from json file
  const time_of_sending = new Date(cardData.time_of_sending); //parsing the time on which message was sent
  const OTPcardTemplate = [
    `<div class="ui column sixteen wide fluid">
    <div class="ui link raised card fluid">
      <div class="content">
          <div class="header">
              ${cardData.first_name} ${cardData.last_name}
          </div>
          <div class="meta">
             Time: ${time_of_sending.toLocaleTimeString()}  
          </div>
          <div class="meta">
             Date: ${time_of_sending.toLocaleDateString()}
          </div>
          <div class="meta">
              Mobile Number: ${cardData.mobile_number}
          </div>
          OTP SENT : ${cardData.otp}
      </div>
    </div>
  </div>`
  ]
  return $(OTPcardTemplate.join(''));
}

let cards = $(); //contact info cards
let otp = $(); //sent message info cards

(async () => {
  // async function to get all the contact details
  try {
    const response = await fetch('/ShowContacts', { method: "GET" });
    const data = await response.text();
    const jsonDATA = JSON.parse(data); //received arary of all the contact details / objects
    jsonDATA.forEach(function (item, i) {
      cards = cards.add(createCard(item)); //creating separate clickable cards for all of them
    });
    $('#contactgrid').append(cards); // appending those cards to contacts tab
  } catch (e) {
    console.log(e.message)
  }
}
)();

(async () => {
  // async function to get all the sent message details
  try {
    const response = await fetch('/getMessages', { method: "GET" });
    const data = await response.text();
    const jsonDATA = JSON.parse(data); //received arary of all the sent message details / objects
    if(response.status === 400){
      throw new Error(jsonDATA.reason); // no otp sent till now
    }
    const noOfMessages = jsonDATA.length;
    for(let i = noOfMessages-1 ; i >= 0 ; --i){
      otp = otp.add(createOTPCard(jsonDATA[i])); // creating cards according to time when sent the message, newest otp would be on top
    }
    $('#otpGrid').append(otp); // appending those cards to otp tab
  } catch (e) {
    if(e.message === 'no otp sent'){  //no otp sent till now, informing the user
      $('#otpGrid').append(`
        <div class="ui column sixteen wide fluid">
          <div class="ui raised segment fluid">
            NO OTP SENT YET
          </div>
        </div>
      `);
    }
  }
}
)();

$('.menu .item') //making the menu tabs functional, provided by semantic ui
  .tab()
;