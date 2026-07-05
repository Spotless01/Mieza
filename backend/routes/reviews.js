const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Order = require("../models/Order");


// ======================================
// SUBMIT REVIEW
// ======================================

router.post("/", async (req, res) => {

  try {

    const {
      orderId,
      shopRating,
      riderRating,
      shopReview,
      riderReview
    } = req.body;

    const order =
      await Order.findById(orderId);

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    if (order.status !== "delivered") {

      return res.status(400).json({
        message:
          "Only delivered orders can be reviewed."
      });

    }

    const existing =
      await Review.findOne({
        orderId
      });

    if (existing) {

      return res.status(400).json({
        message:
          "You have already reviewed this order."
      });

    }

    const review =
      new Review({

        orderId,

        shopId:
          order.shopId,

        riderId:
          order.riderId,

        customerName:
          order.customerName,

        customerPhone:
          order.customerPhone,

        shopRating,

        riderRating,

        shopReview,

        riderReview

      });

    await review.save();

    res.json({

      success: true,

      message:
        "Review submitted successfully."

    });

  }

  catch(err){

    console.log(err);

    res.status(500).json({
      message:
        "Server error"
    });

  }

});


// ======================================
// SHOP REVIEWS
// ======================================

router.get(
"/shop/:shopId",

async(req,res)=>{

try{

const reviews =
await Review.find({

shopId:
req.params.shopId

})
.sort({
createdAt:-1
});

res.json(reviews);

}

catch(err){

res.status(500).json({
message:"Server error"
});

}

});


// ======================================
// RIDER REVIEWS
// ======================================

router.get(
"/rider/:riderId",

async(req,res)=>{

try{

const reviews =
await Review.find({

riderId:
req.params.riderId

})
.sort({
createdAt:-1
});

res.json(reviews);

}

catch(err){

res.status(500).json({
message:"Server error"
});

}

});


// ======================================
// SHOP RATING SUMMARY
// ======================================

router.get(
"/shop-rating/:shopId",

async(req,res)=>{

try{

const reviews =
await Review.find({

shopId:
req.params.shopId

});

const total =
reviews.length;

const average =
total
? (
reviews.reduce(

(sum,r)=>
sum+r.shopRating,

0

)/total

).toFixed(1)
:0;

res.json({

average,

total

});

}

catch(err){

res.status(500).json({
message:"Server error"
});

}

});


// ======================================
// RIDER RATING SUMMARY
// ======================================

router.get(
"/rider-rating/:riderId",

async(req,res)=>{

try{

const reviews =
await Review.find({

riderId:
req.params.riderId

});

const ratings =
reviews.filter(
r=>r.riderRating
);

const total =
ratings.length;

const average =
total
?(
ratings.reduce(

(sum,r)=>
sum+r.riderRating,

0

)/total

).toFixed(1)
:0;

res.json({

average,

total

});

}

catch(err){

res.status(500).json({
message:"Server error"
});

}

});

module.exports = router;