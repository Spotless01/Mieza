const Shop = require("../models/Shop");
const Notification =
require("../models/Notification");


const Settings =
require("../models/Settings");

// REGISTER SHOP (Paystack verified)
exports.registerShop = async (req, res) => {
  try {
    const {
shopName,
ownerName,
email,
phone,
password,
shopLocation,
  latitude,
  longitude,
  openingTime,
closingTime,
paymentReference,

payoutMethod,

momoNumber,
momoName,
momoNetwork,
momoBankCode,
bankName,
bankCode,
accountName,
accountNumber

} = req.body;

const thumbnail =
  req.file
    ? req.file.path
    : req.body.thumbnailUrl || "";


    // ✅ Validate correctly
    if (!shopName || !ownerName || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Shop.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Shop already exists" });
    }

    const settings =
  await Settings.findOne();

const shopRegistrationFee =
  settings?.shopRegistrationFee ?? 200;

const shopPaymentRequired =
  settings?.shopRegistrationPaymentRequired ?? true;

if (
  shopPaymentRequired &&
  !paymentReference
) {

  return res.status(400).json({
    message:
      "Registration payment is required"
  });

}

  const shop = new Shop({

shopName,
ownerName,

email:
email.trim().toLowerCase(),

phone,
shopLocation,

latitude,

longitude,

thumbnail,

openingHours: {
  open: openingTime || "08:00",
  close: closingTime || "22:00"
},

password,

paystackReference:
paymentReference || `FREE_SHOP_${Date.now()}_${Math.floor(Math.random() * 100000)}`,

registrationFee:
  shopPaymentRequired
    ? shopRegistrationFee
    : 0,

isApproved: false,

payoutMethod,

momoNumber,
momoName,
momoNetwork,
momoBankCode,
bankName,
bankCode,
accountName,
accountNumber

});


    await shop.save();

    await Notification.create({

  shopId: null,

  title: "New Vendor Registration",

  message:
    `${shop.shopName}
     is awaiting approval`

});

    res.status(201).json(shop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET APPROVED SHOPS
exports.getApprovedShops = async (req, res) => {
  try {
    const shops = await Shop.find({
      isApproved: true,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(shops);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// APPROVE SHOP (ADMIN)
exports.approveShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json({ message: "Shop approved", shop });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
