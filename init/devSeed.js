require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const REQUIRED_DATABASE = "staysphere_dev";

const devListings = [
  {
    title: "Dev Santorini Cliff House",
    description:
      "A development-only villa fixture with a terrace overlooking the Aegean Sea.",
    image: {
      url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=80",
      filename: "dev-seed/santorini-cliff-house",
    },
    price: 420,
    location: "Santorini",
    country: "Greece",
    category: "trending",
    geometry: { type: "Point", coordinates: [25.4615, 36.3932] },
  },
  {
    title: "Dev Kyoto Garden Room",
    description:
      "A development-only traditional room with tatami floors and a peaceful garden.",
    image: {
      url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1200&q=80",
      filename: "dev-seed/kyoto-garden-room",
    },
    price: 145,
    location: "Kyoto",
    country: "Japan",
    category: "rooms",
    geometry: { type: "Point", coordinates: [135.7681, 35.0116] },
  },
  {
    title: "Dev Alpine Mountain Cabin",
    description:
      "A development-only timber cabin surrounded by alpine trails and mountain views.",
    image: {
      url: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80",
      filename: "dev-seed/alpine-mountain-cabin",
    },
    price: 235,
    location: "Interlaken",
    country: "Switzerland",
    category: "mountains",
    geometry: { type: "Point", coordinates: [7.8632, 46.6863] },
  },
  {
    title: "Dev Loire Valley Castle",
    description:
      "A development-only historic castle stay near vineyards and riverside villages.",
    image: {
      url: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&w=1200&q=80",
      filename: "dev-seed/loire-valley-castle",
    },
    price: 510,
    location: "Loire Valley",
    country: "France",
    category: "castles",
    geometry: { type: "Point", coordinates: [1.5491, 47.5532] },
  },
  {
    title: "Dev Kerala Backwater Boat",
    description:
      "A development-only houseboat fixture for exploring Kerala's quiet backwaters.",
    image: {
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80",
      filename: "dev-seed/kerala-backwater-boat",
    },
    price: 180,
    location: "Alappuzha",
    country: "India",
    category: "boats",
    geometry: { type: "Point", coordinates: [76.3388, 9.4981] },
  },
];

function databaseNameFromConnectionString(connectionString) {
  const match = connectionString.match(
    /^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)(?:\?|$)/,
  );

  return match ? decodeURIComponent(match[1]) : null;
}

function validateEnvironment() {
  const connectionString = process.env.ATLASDB_URL;

  if (!connectionString) {
    throw new Error("ATLASDB_URL is missing from .env");
  }

  if (databaseNameFromConnectionString(connectionString) !== REQUIRED_DATABASE) {
    throw new Error(
      `Safety check failed: seed:dev only allows the ${REQUIRED_DATABASE} database.`,
    );
  }

  if (!process.env.DEV_SEED_PASSWORD) {
    throw new Error("DEV_SEED_PASSWORD is missing from .env");
  }

  return connectionString;
}

async function findOrCreateDevUser() {
  const username = "staysphere_dev_host";
  let user = await User.findOne({ username });

  if (!user) {
    user = new User({
      username,
      email: "dev.host@staysphere.example",
    });
    user = await User.register(user, process.env.DEV_SEED_PASSWORD);
  }

  return user;
}

async function seedDevelopmentDatabase() {
  const connectionString = validateEnvironment();

  await mongoose.connect(connectionString);

  if (mongoose.connection.name !== REQUIRED_DATABASE) {
    throw new Error("Connected database failed the post-connection safety check.");
  }

  const owner = await findOrCreateDevUser();

  for (const listing of devListings) {
    await Listing.updateOne(
      { title: listing.title },
      { $set: { ...listing, owner: owner._id } },
      { upsert: true, runValidators: true },
    );
  }

  console.log(`Development seed complete: ${devListings.length} listings ready.`);
}

seedDevelopmentDatabase()
  .catch((error) => {
    console.error("Development seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
