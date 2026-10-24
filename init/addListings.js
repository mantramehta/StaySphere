require("dotenv").config();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const NEW_LISTING_COUNT = 11;

async function addListings() {
  if (!process.env.ATLASDB_URL) {
    throw new Error("ATLASDB_URL is missing from .env");
  }

  await mongoose.connect(process.env.ATLASDB_URL);
  console.log("Connected to Atlas");

  const users = await User.find({});
  if (users.length === 0) {
    throw new Error("No users found to assign as listing owners");
  }

  const newListings = initData.data.slice(-NEW_LISTING_COUNT);
  let insertedCount = 0;

  for (let index = 0; index < newListings.length; index++) {
    const listing = newListings[index];
    const result = await Listing.updateOne(
      { title: listing.title },
      {
        $setOnInsert: {
          ...listing,
          owner: users[index % users.length]._id,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount === 1) {
      insertedCount++;
    }
  }

  console.log(`Added ${insertedCount} new listings`);
  console.log(`${newListings.length - insertedCount} listings already existed`);
}

addListings()
  .catch((error) => {
    console.error("Could not add listings:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
