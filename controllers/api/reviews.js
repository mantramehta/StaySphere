const mongoose = require("mongoose");
const Listing = require("../../models/listing.js");
const Review = require("../../models/review.js");
const ApiError = require("../../utils/ApiError.js");

module.exports.create = async (req, res) => {
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

  const review = new Review({
    ...req.body,
    author: req.user._id,
  });

  await review.save();

  try {
    listing.reviews.push(review._id);
    await listing.save();
  } catch (error) {
    await Review.findByIdAndDelete(review._id);
    throw error;
  }

  await review.populate("author", "username");
  res.status(201).json({ data: review });
};

module.exports.destroy = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.status(200).json({
    data: {
      id: reviewId,
      deleted: true,
    },
  });
};
