const mongoose = require("mongoose");

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

const KitchenSchema = new mongoose.Schema({}, { strict: false });
const Kitchen = mongoose.model("Kitchen", KitchenSchema);

async function run() {
  await mongoose.connect(MONGODB_URI);
  const kitchens = await Kitchen.find({}).lean();
  console.log("Kitchens in DB:");
  kitchens.forEach(k => {
    console.log(`- ${k.name} (Code: ${k.code}, ID: ${k._id})`);
  });
  mongoose.disconnect();
}
run();
