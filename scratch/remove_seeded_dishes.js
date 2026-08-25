import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");

  // Remove the 30 mock/seed items inserted by seed.ts on Aug 24
  const res = await menuItemsColl.deleteMany({
    createdAt: { $gte: new Date("2026-08-24T00:00:00.000Z") }
  });

  console.log(`Deleted ${res.deletedCount} seed/template items from DB.`);

  const remaining = await menuItemsColl.find({ deletedAt: null }).toArray();
  console.log(`Remaining authentic dishes in DB: ${remaining.length}`);

  await mongoose.disconnect();
}

main().catch(console.error);
