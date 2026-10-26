const mongoose = require("mongoose");
const Listing = require("../../models/listing.js");
const ApiError = require("../../utils/ApiError.js");
const buildListingFilter = require("../../utils/buildListingFilter.js");

module.exports.index = async (req, res) => {
  const { filter, category, searchTerm } = buildListingFilter(req.query);

  const listings = await Listing.find(filter)
    .select("title description image price location country category")
    .lean();

  res.status(200).json({
    data: listings,
    meta: {
      count: listings.length,
      filters: {
        category: category || null,
        search: searchTerm,
      },
    },
  });
};

module.exports.show = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(
      400,
      "INVALID_LISTING_ID",
      "The listing ID is invalid.",
    );
  }

  const listing = await Listing.findById(id)
    .select(
      "title description image price location country category geometry owner reviews",
    )
    .populate("owner", "username")
    .populate({
      path: "reviews",
      select: "comments rating createdAt author",
      populate: {
        path: "author",
        select: "username",
      },
    })
    .lean();

  if (!listing) {
    throw new ApiError(
      404,
      "LISTING_NOT_FOUND",
      "The requested listing was not found.",
    );
  }

  res.status(200).json({ data: listing });
};
