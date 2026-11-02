/*
 * One-time migration for products that existed before vendor category selection.
 * Dry-run by default. Run with --execute only after taking a MongoDB backup.
 * Existing product fields and embedded _id values are preserved.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing from backend/.env');
  await mongoose.connect(process.env.MONGO_URI);
  const shops = await Shop.find({ 'products.0': { $exists: true } }).select('_id shopName products').lean();
  let total = 0;
  let alreadyAll = 0;
  for (const shop of shops) {
    for (const product of (shop.products || [])) {
      total++;
      if (String(product.category || '').trim() === 'All') alreadyAll++;
    }
  }
  const needsUpdate = total - alreadyAll;
  console.log(`Shops with products: ${shops.length}`);
  console.log(`Products found: ${total}`);
  console.log(`Already classified as All: ${alreadyAll}`);
  console.log(`Products to update to All: ${needsUpdate}`);
  if (!process.argv.includes('--execute')) {
    console.log('DRY RUN ONLY. Back up MongoDB, then rerun with --execute to apply.');
    return;
  }
  const result = await Shop.updateMany(
    { 'products.0': { $exists: true } },
    { $set: { 'products.$[legacy].category': 'All' } },
    { arrayFilters: [{ 'legacy.category': { $nin: ['All'] } }] }
  );
  console.log(`Migration completed. Matched shops: ${result.matchedCount}; modified shops: ${result.modifiedCount}.`);
}

main().catch(error => { console.error('Migration failed:', error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect().catch(() => {}); });
