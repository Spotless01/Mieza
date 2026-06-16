const africastalking =
require("africastalking");

const client =
africastalking({

  apiKey:
    process.env.AFRICASTALKING_API_KEY,

  username:
    process.env.AFRICASTALKING_USERNAME

});

const sms =
client.SMS;

async function sendSMS(
  phone,
  message
) {

  try {

    if (!phone || !message) return;

    const formattedPhone =
      phone.startsWith("+")
        ? phone
        : phone.startsWith("0")
          ? `+233${phone.slice(1)}`
          : phone;

          console.log(
  "Original Phone:",
  phone
);

console.log(
  "Formatted Phone:",
  formattedPhone
);

    const result =
      await sms.send({
        to: [formattedPhone],
        message
      });

    console.log(
      "SMS sent:",
      result
    );

    return result;

  } catch (err) {

    console.log(
      "SMS failed:",
      err
    );

  }

}

module.exports =
sendSMS;