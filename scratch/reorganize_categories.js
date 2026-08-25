import mongoose from "mongoose";

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

const STANDARD_CATEGORIES = [
  { name: "Royal Thalis", description: "Grand authentic pure ghee thalis and meal platters" },
  { name: "Main Course (Paneer)", description: "Rich, creamy cottage cheese gravies and curries" },
  { name: "Main Course (Veg & Mushroom)", description: "Handi, Kolhapuri, Kaju and seasonal vegetable curries" },
  { name: "Dal & Curries", description: "Slow-cooked Dal Makhani, double tadka dal and lentils" },
  { name: "Biryani & Rice", description: "Dum biryanis, royal pulaos, khichdi and aromatic basmati rice" },
  { name: "Starters & Snacks", description: "Tandoori tikkas, soya chaap, kebabs, crispy bites and snacks" },
  { name: "Breads & Parathas", description: "Butter naan, garlic naan, tandoori rotis, stuffed parathas" },
  { name: "Chinese & Noodles", description: "Hakka noodles, Schezwan fried rice, Manchurian and wok bowls" },
  { name: "Soups", description: "Hot, comforting tomato, manchow, and creamy vegetable soups" },
  { name: "Desserts & Beverages", description: "Gulab jamun, lassi, masala chai, raitas and drinks" },
  { name: "Combos & Quick Meals", description: "Chole bhature, rajma chawal combos and fast bites" },
];

function determineCategory(name) {
  const n = name.toLowerCase().trim();

  // 1. Soups
  if (n.includes("soup")) {
    return "Soups";
  }

  // 2. Thalis
  if (n.includes("thali")) {
    return "Royal Thalis";
  }

  // 3. Combos & Quick Meals
  if (
    n.includes("combo") ||
    n.includes("chole bhature") ||
    n.includes("maggi") ||
    n.includes("honey chilli potato")
  ) {
    return "Combos & Quick Meals";
  }

  // 4. Breads & Parathas
  if (
    n.includes("roti") ||
    n.includes("naan") ||
    n.includes("kulcha") ||
    n.includes("paratha") ||
    n.includes("bhature")
  ) {
    return "Breads & Parathas";
  }

  // 5. Chinese & Noodles
  if (
    n.includes("noodles") ||
    n.includes("hakka") ||
    n.includes("schezwan noodles") ||
    n.includes("fried rice") ||
    n.includes("schezwan rice") ||
    n.includes("triple schezwan") ||
    n.includes("combination rice") ||
    n.includes("manchurian rice")
  ) {
    return "Chinese & Noodles";
  }

  // 6. Dal & Curries
  if (n.startsWith("dal ") || n === "dal" || n.includes("dal makhani") || n.includes("dal tadka") || n.includes("dal fry") || n.includes("dal kolhapuri") || n.includes("dal palak")) {
    return "Dal & Curries";
  }

  // 7. Biryani & Rice
  if (
    n.includes("biryani") ||
    n.includes("pulao") ||
    n.includes("khichdi") ||
    n.includes("rice") ||
    n.includes("dum biryani")
  ) {
    return "Biryani & Rice";
  }

  // 8. Desserts & Beverages
  if (
    n.includes("jamun") ||
    n.includes("lassi") ||
    n.includes("chai") ||
    n.includes("water") ||
    n.includes("curd") ||
    n.includes("raita") ||
    n.includes("papad") ||
    n.includes("halwa") ||
    n.includes("rasgulla") ||
    n.includes("beverage") ||
    n.includes("coffee")
  ) {
    return "Desserts & Beverages";
  }

  // 9. Starters & Snacks
  if (
    n.includes("tikka dry") ||
    n.includes("kebab") ||
    n.includes("kabab") ||
    n.includes("crispy") ||
    n.includes("65") ||
    n.includes("chilli") ||
    n.includes("manchurian") ||
    n.includes("lollypop") ||
    n.includes("soya chap") ||
    n.includes("soya chaap") ||
    n.includes("chap") ||
    n.includes("stuff mushroom") ||
    n.includes("shole") ||
    n.includes("tandoori paneer tikka")
  ) {
    return "Starters & Snacks";
  }

  // 10. Main Course (Paneer)
  if (
    n.includes("paneer") ||
    n.includes("kofta")
  ) {
    return "Main Course (Paneer)";
  }

  // 11. Main Course (Veg & Mushroom)
  return "Main Course (Veg & Mushroom)";
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const categoriesColl = db.collection("categories");
  const menuItemsColl = db.collection("menuitems");

  console.log("Creating / ensuring standard categories...");
  const catDocMap = new Map();

  for (const cat of STANDARD_CATEGORIES) {
    let existing = await categoriesColl.findOne({ name: cat.name, deletedAt: null });
    if (!existing) {
      const res = await categoriesColl.insertOne({
        name: cat.name,
        description: cat.description,
        isGlobalMaster: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      existing = { _id: res.insertedId, name: cat.name };
      console.log(`+ Created Category: ${cat.name}`);
    } else {
      console.log(`✓ Existing Category: ${cat.name}`);
    }
    catDocMap.set(cat.name, existing._id);
  }

  const allDishes = await menuItemsColl.find({ deletedAt: null }).toArray();
  console.log(`\nRe-categorizing ${allDishes.length} dishes...`);

  const categoryDistribution = {};

  for (const dish of allDishes) {
    const targetCatName = determineCategory(dish.name);
    const targetCatId = catDocMap.get(targetCatName);

    categoryDistribution[targetCatName] = (categoryDistribution[targetCatName] || 0) + 1;

    await menuItemsColl.updateOne(
      { _id: dish._id },
      {
        $set: {
          category: targetCatId,
          isGlobalMaster: true,
        },
      }
    );
  }

  console.log("\n=== New Accurate Category Distribution ===");
  Object.entries(categoryDistribution).forEach(([cat, count]) => {
    console.log(`- ${cat}: ${count} dishes`);
  });

  // Soft delete unused empty legacy categories
  const activeCatIds = Array.from(catDocMap.values());
  const deletedLegacy = await categoriesColl.updateMany(
    { _id: { $nin: activeCatIds }, deletedAt: null },
    { $set: { deletedAt: new Date() } }
  );
  console.log(`\nCleaned up ${deletedLegacy.modifiedCount} old unused legacy categories.`);

  await mongoose.disconnect();
  console.log("Migration complete!");
}

main().catch(console.error);
