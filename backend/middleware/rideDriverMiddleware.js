const jwt = require("jsonwebtoken");
const RideDriver = require("../models/RideDriver");

module.exports = async (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }

        const token =
            authHeader.split(" ")[1];

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (!decoded.rideDriverId) {
            return res.status(401).json({
                message: "Invalid driver token."
            });
        }

        const driver =
            await RideDriver
                .findById(decoded.rideDriverId)
                .select("-password");

        if (!driver) {
            return res.status(401).json({
                message: "Driver account not found."
            });
        }

        if (!driver.isApproved) {
            return res.status(403).json({
                message: "Driver account is not approved."
            });
        }

        if (!driver.isActive) {
            return res.status(403).json({
                message: "Driver account is inactive."
            });
        }

        req.driverId = driver._id;
        req.rideDriver = driver;

        next();

    } catch (error) {

        console.error(
            "Ride Driver Authentication Error:",
            error.message
        );

        return res.status(401).json({
            message:
                "Invalid or expired driver authentication token."
        });
    }
};