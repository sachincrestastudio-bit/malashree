import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const menuItemsColl = db.collection("menuitems");
  const categoriesColl = db.collection("categories");

  const categories = await categoriesColl.find({ deletedAt: null }).toArray();
  console.log("=== Existing Categories in DB ===");
  categories.forEach(c => console.log(`- ${c.name} (id: ${c._id})`));

  const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]));

  const allDishes = await menuItemsColl.find({ deletedAt: null }).toArray();
  console.log(`\n=== Total Dishes: ${allDishes.length} ===`);

  const categoryCounts = {};
  const uncategorized = [];

  allDishes.forEach(d => {
    const catId = d.category ? d.category.toString() : null;
    const catName = categoryMap.get(catId) || (typeof d.category === "string" ? d.category : "Uncategorized/Missing");
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    if (!categoryMap.has(catId)) {
      uncategorized.push({ name: d.name, rawCat: d.category });
    }
  });

  console.log("\nDishes per Category:", categoryCounts);
  if (uncategorized.length > 0) {
    console.log(`\nUncategorized or orphaned dishes (${uncategorized.length}):`, uncategorized.slice(0, 15));
  }

  await mongoose.disconnect();
}

main().catch(console.error);
