import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");
  const kitchensColl = db.collection("kitchens");

  const kitchens = await kitchensColl.find({ status: "active", deletedAt: null }).toArray();
  console.log(`Found ${kitchens.length} active kitchens.`);

  // Update all 260 dishes to be isGlobalMaster: true
  const res = await menuItemsColl.updateMany(
    { deletedAt: null },
    {
      $set: {
        isGlobalMaster: true,
        isAvailable: true,
      }
    }
  );

  console.log(`Updated ${res.modifiedCount} dishes to isGlobalMaster: true.`);

  const masterCount = await menuItemsColl.countDocuments({ isGlobalMaster: true, deletedAt: null });
  console.log(`Total universal master dishes now: ${masterCount}`);

  await mongoose.disconnect();
}

main().catch(console.error);
