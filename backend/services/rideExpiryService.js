
const Ride = require("../models/Ride");

const EXPIRE_AFTER_MINUTES = 15;

const expireOldRides = async () => {
    const expiryTime = new Date(
        Date.now() - EXPIRE_AFTER_MINUTES * 60 * 1000
    );

    const result = await Ride.updateMany(
        {
            status: "searching",
            createdAt: { $lte: expiryTime }
        },
        {
            $set: {
                status: "expired"
            }
        }
    );

    if (result.modifiedCount > 0) {
        console.log(
            `Ride expiry: ${result.modifiedCount} old ride(s) expired.`
        );
    }

    return result.modifiedCount;
};

module.exports = { expireOldRides };
