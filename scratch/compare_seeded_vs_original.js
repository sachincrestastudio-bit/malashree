import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");

  const aug24Dishes = await menuItemsColl.find({
    deletedAt: null,
    createdAt: { $gte: new Date("2026-08-24T00:00:00.000Z") }
  }).toArray();

  console.log(`Dishes created on Aug 24 (Seed script): ${aug24Dishes.length}`);
  aug24Dishes.forEach(d => {
    console.log(`- ${d.name} (₹${d.price}) [id: ${d._id}]`);
  });

  const aug21Dishes = await menuItemsColl.find({
    deletedAt: null,
    createdAt: { $lt: new Date("2026-08-24T00:00:00.000Z") }
  }).toArray();

  console.log(`\nDishes created on Aug 21 (Original Chinchwad Menu): ${aug21Dishes.length}`);

  await mongoose.disconnect();
}

main().catch(console.error);
