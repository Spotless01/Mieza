const axios = require("axios");

async function createPaystackSubaccount(shop) {

  try {

    if (shop.paystackRegistered) {
      return shop;
    }

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
              `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
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