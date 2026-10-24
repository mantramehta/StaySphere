require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const demoUsers = [
  {
    username: "aatiya_sharma",
    email: "aatiya.sharma@staysphere.demo",
    password: "Aatiya@Stay2026!",
  },
  {
    username: "olivia_bennett",
    email: "olivia.bennett@staysphere.demo",
    password: "Olivia#Voyage2026",
  },
  {
    username: "ethan_clarke",
    email: "ethan.clarke@staysphere.demo",
    password: "Ethan!Explore2026",
  },
  {
    username: "mateo_rivera",
    email: "mateo.rivera@staysphere.demo",
    password: "Mateo$Journey2026",
  },
];

async function seedDatabase() {
  if (!process.env.ATLASDB_URL) {
    throw new Error("ATLASDB_URL is missing from .env");
  }

  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("Connected to Atlas");

  await Review.deleteMany({});
  await Listing.deleteMany({});
  await User.deleteMany({});

  const users = [];
  for (const account of demoUsers) {
    const user = new User({
      username: account.username,
      email: account.email,
    });
    users.push(await User.register(user, account.password));
  }

  const listings = initData.data.map((listing, index) => ({
    ...listing,
    owner: users[index % users.length]._id,
  }));

  await Listing.insertMany(listings);

  console.log(`Created ${users.length} users`);
  console.log(`Created ${listings.length} listings`);
  console.log("Database initialization complete");
}

seedDatabase()
  .catch((error) => {
    console.error("Initialization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
