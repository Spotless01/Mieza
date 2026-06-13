const express =
require("express");

const Order =
require("../models/Order");

const router =
express.Router();

router.get(
"/available",
async (req, res) => {

try {

const orders =
await Order.find({

status:
"ready_for_pickup",

acceptedByRider:
false

})
.sort({
createdAt: -1
});

res.json(
orders
);

}

catch(err) {

console.log(err);

res.status(500).json({

message:
"Server error"

});

}

}
);

module.exports =
router;