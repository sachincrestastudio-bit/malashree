import mongoose from "mongoose";
import { connectToDatabase } from "../src/database/mongoose.js";
import { MenuService } from "../src/services/MenuService.js";

async function main() {
  await connectToDatabase();
  const items = await MenuService.getMenuByKitchen("pimple-saudagar");
  console.log(`MenuService returned ${items.length} items for pimple-saudagar!`);
  
  const categories = {};
  items.forEach(i => {
    categories[i.category] = (categories[i.category] || 0) + 1;
  });
  console.log("Categories Breakdown:", categories);
  process.exit(0);
}

main().catch(console.error);
