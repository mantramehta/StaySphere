const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ApiError = require("./utils/ApiError.js");

module.exports.isApiLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(
      new ApiError(401, "AUTHENTICATION_REQUIRED", "You must be logged in."),
    );
  }

  next();
};

module.exports.validateApiListing = (schema, options = {}) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError(400, "VALIDATION_ERROR", message));
    }

    if (options.imageRequired && !req.file) {
      return next(
        new ApiError(400, "IMAGE_REQUIRED", "A listing image is required."),
      );
    }

    req.body = value;
    next();
  };
};

module.exports.isApiListingOwner = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "INVALID_LISTING_ID", "The listing ID is invalid.");
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    throw new ApiError(
      404,
      "LISTING_NOT_FOUND",
      "The requested listing was not found.",
    );
  }

  if (!listing.owner?.equals(req.user._id)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only the listing owner can perform this action.",
    );
  }

  req.listing = listing;
  next();
};

module.exports.validateApiBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");
      return next(new ApiError(400, "VALIDATION_ERROR", message));
    }

    req.body = value;
    next();
  };
};

module.exports.isApiReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(reviewId)) {
    throw new ApiError(400, "INVALID_REVIEW_ID", "The review ID is invalid.");
  }

  const review = await Review.findById(reviewId);
  const belongsToListing = await Listing.exists({
    _id: id,
    reviews: reviewId,
  });

  if (!review || !belongsToListing) {
    throw new ApiError(404, "REVIEW_NOT_FOUND", "The review was not found.");
  }

  if (!review.author?.equals(req.user._id)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Only the review author can delete this review.",
    );
  }

  req.review = review;
  next();
};
