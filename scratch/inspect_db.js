import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");
  const kitchensColl = db.collection("kitchens");

  const total = await menuItemsColl.countDocuments({ deletedAt: null });
  const masterCount = await menuItemsColl.countDocuments({ isGlobalMaster: true, deletedAt: null });
  const notMaster = await menuItemsColl.countDocuments({ isGlobalMaster: { $ne: true }, deletedAt: null });
  
  const kitchens = await kitchensColl.find({ status: "active", deletedAt: null }).toArray();

  console.log("Total menuitems in DB:", total);
  console.log("isGlobalMaster === true:", masterCount);
  console.log("isGlobalMaster !== true:", notMaster);
  console.log("Kitchens count:", kitchens.length);
  kitchens.forEach(k => console.log(`Kitchen: ${k.name} (id: ${k._id}, code: ${k.code})`));

  const samples = await menuItemsColl.find({ deletedAt: null }).limit(5).toArray();
  console.log("\nSample 5 items:");
  samples.forEach(s => {
    console.log(`- ${s.name} | isGlobalMaster: ${s.isGlobalMaster} | kitchenId: ${s.kitchenId} | isAvailable: ${s.isAvailable} | branchPricing: ${s.branchPricing?.length || 0} overrides`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
