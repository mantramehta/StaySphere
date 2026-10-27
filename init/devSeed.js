require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const { data: devListings } = require("./data.js");

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

const devReviews = [
  {
    listingTitle: "Santorini Sunset Villa",
    author: "guestOne",
    rating: 5,
    comments: "The terrace view was unforgettable and the home felt peaceful from sunrise to sunset.",
  },
  {
    listingTitle: "Santorini Sunset Villa",
    author: "guestTwo",
    rating: 4,
    comments: "Beautiful location, comfortable rooms, and an easy walk to nearby cafes.",
  },
  {
    listingTitle: "Kyoto Tatami Room",
    author: "guestOne",
    rating: 5,
    comments: "Quiet, thoughtful, and close to everything we wanted to explore in Kyoto.",
  },
  {
    listingTitle: "Kyoto Tatami Room",
    author: "guestTwo",
    rating: 5,
    comments: "The garden was calming and the room had many beautiful traditional details.",
  },
  {
    listingTitle: "Swiss Alps Chalet",
    author: "guestTwo",
    rating: 4,
    comments: "A cozy base for hiking with wonderful mountain views in every direction.",
  },
  {
    listingTitle: "Loire Valley Chateau",
    author: "guestOne",
    rating: 5,
    comments: "It felt historic without sacrificing comfort, and the countryside was lovely.",
  },
  {
    listingTitle: "Kerala Backwater Houseboat",
    author: "guestTwo",
    rating: 5,
    comments: "A relaxing stay with gorgeous water views and a memorable atmosphere.",
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
    user = new User({ username: account.username, email: account.email });
    user = await User.register(user, process.env.DEV_SEED_PASSWORD);
  }

  return user;
}

async function removeOldDevelopmentFixtures() {
  const oldListings = await Listing.find({ title: /^Dev / }).select("_id");

  for (const listing of oldListings) {
    await Listing.findByIdAndDelete(listing._id);
  }
}

async function seedDevelopmentReviews(users) {
  for (const reviewData of devReviews) {
    const listing = await Listing.findOne({ title: reviewData.listingTitle });

    if (!listing) {
      throw new Error(`Development listing not found: ${reviewData.listingTitle}`);
    }

    const author = users[reviewData.author];
    const review = await Review.findOneAndUpdate(
      { author: author._id, comments: reviewData.comments },
      {
        $set: { rating: reviewData.rating },
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

  await removeOldDevelopmentFixtures();

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
