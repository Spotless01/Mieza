const axios = require("axios");
const { getPaystackCredentials } = require("./paystackCredentials");

async function createPaystackSubaccount(shop) {

  try {

    if (shop.paystackRegistered) {
      return shop;
    }

    const credentials = await getPaystackCredentials();
    if (!credentials.configured) throw new Error(`Paystack ${credentials.environment} secret key is not configured.`);

    const percentage =
      shop.paystackSplitPercentage || 90;

    const response =
      await axios.post(

        "https://api.paystack.co/subaccount",

        {
          business_name: shop.shopName,

          settlement_bank:
            shop.bankCode ||
            shop.momoBankCode,

          account_number:
            shop.payoutMethod === "bank"
              ? shop.accountNumber
              : shop.momoNumber,

          percentage_charge:
            100 - percentage,

          primary_contact_name:
            shop.ownerName,

          primary_contact_email:
            shop.email,

          primary_contact_phone:
            shop.phone
        },

        {
          headers: {
            Authorization:
              `Bearer ${credentials.secretKey}`
          }
        }

      );

    shop.paystackSubaccountCode =
      response.data.data.subaccount_code;

    shop.paystackRegistered = true;

    await shop.save();

    console.log(
      `Paystack subaccount created for ${shop.shopName}`
    );

  } catch (err) {

    console.log(
      "Paystack Subaccount Error:"
    );

    console.log(
      err.response?.data || err.message
    );

  }

}

module.exports =
  createPaystackSubaccount;