import mongoose from 'mongoose';

const MONGODB_URI = "mongodb://pariharsachin5002_db_user:Aiu18rKvCOoBUK3D@ac-bkzpfb6-shard-00-00.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-01.x91pcbg.mongodb.net:27017,ac-bkzpfb6-shard-00-02.x91pcbg.mongodb.net:27017/malashree?ssl=true&replicaSet=atlas-bst2yy-shard-0&authSource=admin&retryWrites=true&w=majority";

async function makeAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const latestUser = await usersCollection.findOne({}, { sort: { createdAt: -1 } });

    if (!latestUser) {
      console.log('No users found in the database. Please register first.');
      process.exit(0);
    }

    await usersCollection.updateOne(
      { _id: latestUser._id },
      { $set: { role: 'admin' } }
    );

    console.log(`Successfully promoted ${latestUser.email} to ADMIN!`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeAdmin();
