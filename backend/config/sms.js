const axios =
  require("axios");

async function sendSMS(
  phone,
  message
) {

  if (!phone || !message) {
    throw new Error(
      "Phone number and message are required"
    );
  }

  try {

    const cleanPhone =
      String(phone)
        .trim()
        .replace(/\s+/g, "")
        .replace(/-/g, "");

    let formattedPhone;

    if (
      cleanPhone.startsWith("+")
    ) {

      formattedPhone =
        cleanPhone;

    } else if (
      cleanPhone.startsWith("0")
    ) {

      formattedPhone =
        `+233${cleanPhone.slice(1)}`;

    } else if (
      cleanPhone.startsWith("233")
    ) {

      formattedPhone =
        `+${cleanPhone}`;

    } else {

      formattedPhone =
        `+${cleanPhone}`;

    }

    console.log(
      "Sending SMS to:",
      formattedPhone
    );

    const response =
      await axios.post(
        "https://sms.arkesel.com/api/v2/sms/send",
        {
          sender:
            "MIEZA",

          message,

          recipients: [
            formattedPhone
          ]
        },
        {
          headers: {
            "api-key":
              process.env.ARKESEL_API_KEY,

            "Content-Type":
              "application/json"
          }
        }
      );

    console.log(
      "SMS SUCCESS:",
      response.data
    );

    return response.data;

  } catch (err) {

    console.log(
      "SMS FAILED:",
      err.response?.data ||
      err.message
    );

    throw err;

  }

}

module.exports =
  sendSMS;