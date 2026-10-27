const express = require("express");
const wrapAsync = require("../../utils/wrapAsync.js");
const reviewController = require("../../controllers/api/reviews.js");
const {
  isApiLoggedIn,
  isApiReviewAuthor,
  validateApiBody,
} = require("../../middleware.js");
const { apiReviewSchema } = require("../../schema.js");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  isApiLoggedIn,
  validateApiBody(apiReviewSchema),
  wrapAsync(reviewController.create),
);

router.delete(
  "/:reviewId",
  isApiLoggedIn,
  wrapAsync(isApiReviewAuthor),
  wrapAsync(reviewController.destroy),
);

module.exports = router;
