function createCard(cardData) {
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
  const time_of_sending = new Date(cardData.time_of_sending);
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

let cards = $();
let otp = $();

(async () => {
  try {
    const response = await fetch('http://localhost:3030/ShowContacts', { method: "GET" });
    const data = await response.text();
    const jsonDATA = JSON.parse(data);
    jsonDATA.forEach(function (item, i) {
      cards = cards.add(createCard(item));
    });
    $('#contactgrid').append(cards);
  } catch (e) {
    console.log(e.message)
  }
}
)();

(async () => {
  try {
    const response = await fetch('http://localhost:3030/getMessages', { method: "GET" });
    const data = await response.text();
    const jsonDATA = JSON.parse(data);
    const noOfMessages = jsonDATA.length;
    for(let i = noOfMessages-1 ; i >= 0 ; --i){
      otp = otp.add(createOTPCard(jsonDATA[i]));
    }
    $('#otpGrid').append(otp);
  } catch (e) {
    console.log(e.message)
  }
}
)();

$('.menu .item')
  .tab()
;