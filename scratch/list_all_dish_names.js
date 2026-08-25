import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");

  const allDishes = await menuItemsColl.find({ deletedAt: null }).sort({ name: 1 }).toArray();
  console.log(`Total dishes: ${allDishes.length}`);
  allDishes.forEach((d, idx) => {
    console.log(`${idx + 1}. ${d.name} (Price: ₹${d.price})`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
