import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");

  const allDishes = await menuItemsColl.find({ deletedAt: null }).sort({ createdAt: 1 }).toArray();
  console.log(`Total dishes in DB: ${allDishes.length}`);

  // Let's see some samples
  console.log("\nFirst 10 dishes created:");
  allDishes.slice(0, 10).forEach(d => console.log(`- ${d.name} (₹${d.price}) [Created: ${d.createdAt}]`));

  console.log("\nLast 10 dishes created:");
  allDishes.slice(-10).forEach(d => console.log(`- ${d.name} (₹${d.price}) [Created: ${d.createdAt}]`));

  await mongoose.disconnect();
}

main().catch(console.error);
