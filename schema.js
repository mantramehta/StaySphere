const Joi = require("joi");

const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
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
  }).required(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comments: Joi.string().required(),
  }).required(),
});

const apiRegisterSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

const apiLoginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

module.exports = {
  listingSchema,
  reviewSchema,
  apiRegisterSchema,
  apiLoginSchema,
};
