const Joi = require("joi");
const Listing = require("./models/listing.js");

// "trending" is an editorial label, not something a guest asks for.
const aiSearchCategories = Listing.schema
  .path("category")
  .enumValues.filter((category) => category !== "trending");

const apiRegisterSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const apiLoginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const apiListingSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  price: Joi.number().min(0).required(),
  location: Joi.string().trim().min(2).max(100).required(),
  country: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string()
    .valid(
      "trending",
      "rooms",
      "iconic-cities",
      "mountains",
      "castles",
      "amazing-pools",
      "camping",
      "farms",
      "arctic",
      "domes",
      "boats",
    )
    .required(),
});

const apiReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comments: Joi.string().trim().min(3).max(1000).required(),
});

const aiRecommendationRequestSchema = Joi.object({
  prompt: Joi.string().trim().min(3).max(300).required(),
});

const aiPreferencesSchema = Joi.object({
  isTravelRequest: Joi.boolean().required(),
  destination: Joi.string()
    .trim()
    .max(60)
    .pattern(/^[\p{L}\s.,'-]+$/u)
    .allow(null)
    .empty("")
    .default(null),
  minPrice: Joi.number().min(0).max(100000).allow(null).default(null),
  maxPrice: Joi.number().min(0).max(100000).allow(null).default(null),
  categories: Joi.array()
    .items(Joi.string().valid(...aiSearchCategories))
    .max(3)
    .unique()
    .default([]),
  keywords: Joi.array()
    .items(Joi.string().trim().lowercase().pattern(/^[a-z-]{2,30}$/))
    .max(5)
    .unique()
    .default([]),
  unsupported: Joi.array().items(Joi.string().trim().max(80)).max(5).default([]),
}).custom((preferences, helpers) => {
  const { minPrice, maxPrice } = preferences;

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    return helpers.message("minPrice cannot be greater than maxPrice");
  }

  return preferences;
});

module.exports = {
  apiRegisterSchema,
  apiLoginSchema,
  apiListingSchema,
  apiReviewSchema,
  aiSearchCategories,
  aiRecommendationRequestSchema,
  aiPreferencesSchema,
};
