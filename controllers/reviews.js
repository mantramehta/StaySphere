const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  const addReview = new Review(req.body.review);
  addReview.author = req.user._id;
  listing.reviews.push(addReview);

  await addReview.save();
  await listing.save();

  console.log("New review saved");
  req.flash("success", "New Review Created!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
