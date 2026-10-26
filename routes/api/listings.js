const express = require("express");
const wrapAsync = require("../../utils/wrapAsync.js");
const listingController = require("../../controllers/api/listings.js");

const router = express.Router();

router.get("/", wrapAsync(listingController.index));
router.get("/:id", wrapAsync(listingController.show));

module.exports = router;
