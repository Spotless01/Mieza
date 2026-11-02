const Settings = require("../models/Settings");

/** Resolve credentials from the environment selected in Admin Settings.
 * Live mode never falls back to a test key. Legacy PAYSTACK_SECRET_KEY is
 * accepted only when neither environment-specific key is configured.
 */
async function getPaystackCredentials() {
  const settings = await Settings.findOne().lean();
  const environment = settings?.paystackEnvironment || "test";
  const testKey = process.env.PAYSTACK_TEST_SECRET_KEY;
  const liveKey = process.env.PAYSTACK_LIVE_SECRET_KEY;
  const hasEnvironmentKeys = Boolean(testKey || liveKey);
  const secretKey = environment === "live"
    ? liveKey
    : (testKey || (!hasEnvironmentKeys ? process.env.PAYSTACK_SECRET_KEY : ""));

  return {
    environment,
    secretKey: typeof secretKey === "string" ? secretKey.trim() : "",
    configured: typeof secretKey === "string" && secretKey.trim().length > 0
  };
}

module.exports = { getPaystackCredentials };
