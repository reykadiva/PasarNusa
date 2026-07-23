const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const { MongoClient } = require("mongodb");
const mockData = require("../server/mockDatabase.json");

const uri = "mongodb+srv://user-nusa:reykaNusa123@cluster0.vgjqp65.mongodb.net/pasarnusa?retryWrites=true&w=majority";

async function seedAtlas() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  });

  try {
    console.log("Connecting to MongoDB Atlas Cloud...");
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");

    const db = client.db("pasarnusa");

    // Seed desas
    if (mockData.desas && mockData.desas.length > 0) {
      await db.collection("desas").deleteMany({});
      await db.collection("desas").insertMany(mockData.desas);
      console.log(`Seeded ${mockData.desas.length} desas into MongoDB Atlas!`);
    }

    // Seed umkms
    if (mockData.umkms && mockData.umkms.length > 0) {
      await db.collection("umkms").deleteMany({});
      await db.collection("umkms").insertMany(mockData.umkms);
      console.log(`Seeded ${mockData.umkms.length} umkms into MongoDB Atlas!`);
    }

    // Seed produks
    if (mockData.produks && mockData.produks.length > 0) {
      await db.collection("produks").deleteMany({});
      await db.collection("produks").insertMany(mockData.produks);
      console.log(`Seeded ${mockData.produks.length} produks into MongoDB Atlas!`);
    }

    console.log("\nALL DATA SUCCESSFULLY SEEDED TO YOUR MONGODB ATLAS CLUSTER!");
  } catch (err) {
    console.error("Error connecting/seeding to MongoDB Atlas:", err.message);
  } finally {
    await client.close();
  }
}

seedAtlas();
