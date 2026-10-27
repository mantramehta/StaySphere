require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");

const REQUIRED_DATABASE = "staysphere_dev";

const devUsers = {
  owner: {
    username: "staysphere_dev_host",
    email: "dev.host@staysphere.example",
  },
  guestOne: {
    username: "maya_dev_guest",
    email: "maya.guest@staysphere.example",
  },
  guestTwo: {
    username: "liam_dev_guest",
    email: "liam.guest@staysphere.example",
  },
};

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

const devReviews = [
  {
    listingTitle: "Dev Santorini Cliff House",
    author: "guestOne",
    rating: 5,
    comments: "The terrace view was unforgettable and the home felt peaceful from sunrise to sunset.",
    createdAt: new Date("2026-05-18T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Santorini Cliff House",
    author: "guestTwo",
    rating: 4,
    comments: "Beautiful location, comfortable rooms, and an easy walk to nearby cafés.",
    createdAt: new Date("2026-06-09T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Kyoto Garden Room",
    author: "guestOne",
    rating: 5,
    comments: "Quiet, thoughtful, and close to everything we wanted to explore in Kyoto.",
    createdAt: new Date("2026-04-22T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Kyoto Garden Room",
    author: "guestTwo",
    rating: 5,
    comments: "The garden was calming and the room had so many beautiful traditional details.",
    createdAt: new Date("2026-07-02T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Alpine Mountain Cabin",
    author: "guestTwo",
    rating: 4,
    comments: "A cozy base for hiking with wonderful mountain views in every direction.",
    createdAt: new Date("2026-03-14T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Loire Valley Castle",
    author: "guestOne",
    rating: 5,
    comments: "It felt historic without sacrificing comfort, and the surrounding countryside was lovely.",
    createdAt: new Date("2026-08-11T12:00:00.000Z"),
  },
  {
    listingTitle: "Dev Kerala Backwater Boat",
    author: "guestTwo",
    rating: 5,
    comments: "A relaxing stay with gorgeous water views and a genuinely memorable atmosphere.",
    createdAt: new Date("2026-09-06T12:00:00.000Z"),
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

async function findOrCreateDevUser(account) {
  let user = await User.findOne({ username: account.username });

  if (!user) {
    user = new User({
      username: account.username,
      email: account.email,
    });
    user = await User.register(user, process.env.DEV_SEED_PASSWORD);
  }

  return user;
}

async function seedDevelopmentReviews(users) {
  for (const reviewData of devReviews) {
    const listing = await Listing.findOne({ title: reviewData.listingTitle });

    if (!listing) {
      throw new Error(`Development listing not found: ${reviewData.listingTitle}`);
    }

    const author = users[reviewData.author];
    const review = await Review.findOneAndUpdate(
      {
        author: author._id,
        comments: reviewData.comments,
      },
      {
        $set: {
          rating: reviewData.rating,
          createdAt: reviewData.createdAt,
        },
        $setOnInsert: {
          author: author._id,
          comments: reviewData.comments,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    await Listing.updateOne(
      { _id: listing._id },
      { $addToSet: { reviews: review._id } },
    );
  }
}

async function seedDevelopmentDatabase() {
  const connectionString = validateEnvironment();

  await mongoose.connect(connectionString);

  if (mongoose.connection.name !== REQUIRED_DATABASE) {
    throw new Error("Connected database failed the post-connection safety check.");
  }

  const users = {
    owner: await findOrCreateDevUser(devUsers.owner),
    guestOne: await findOrCreateDevUser(devUsers.guestOne),
    guestTwo: await findOrCreateDevUser(devUsers.guestTwo),
  };

  for (const listing of devListings) {
    await Listing.updateOne(
      { title: listing.title },
      { $set: { ...listing, owner: users.owner._id } },
      { upsert: true, runValidators: true },
    );
  }

  await seedDevelopmentReviews(users);

  console.log(`Development seed complete: ${devListings.length} listings ready.`);
  console.log(`Development seed complete: ${devReviews.length} reviews ready.`);
}

seedDevelopmentDatabase()
  .catch((error) => {
    console.error("Development seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
