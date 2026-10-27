const express = require("express");
const wrapAsync = require("../../utils/wrapAsync.js");
const listingController = require("../../controllers/api/listings.js");
const reviewRouter = require("./reviews.js");
const {
  isApiLoggedIn,
  isApiListingOwner,
  validateApiListing,
} = require("../../middleware.js");
const { apiListingSchema } = require("../../schema.js");
const ApiError = require("../../utils/ApiError.js");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(
        new ApiError(400, "INVALID_IMAGE", "Only image files are allowed."),
      );
    }
    callback(null, true);
  },
});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isApiLoggedIn,
    upload.single("image"),
    validateApiListing(apiListingSchema, { imageRequired: true }),
    wrapAsync(listingController.create),
  );

router.use("/:id/reviews", reviewRouter);

router
  .route("/:id")
  .get(wrapAsync(listingController.show))
  .patch(
    isApiLoggedIn,
    wrapAsync(isApiListingOwner),
    upload.single("image"),
    validateApiListing(apiListingSchema),
    wrapAsync(listingController.update),
  )
  .delete(
    isApiLoggedIn,
    wrapAsync(isApiListingOwner),
    wrapAsync(listingController.destroy),
  );

module.exports = router;
