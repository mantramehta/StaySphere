const mongoose = require("mongoose");
const Listing = require("../../models/listing.js");
const ApiError = require("../../utils/ApiError.js");
const buildListingFilter = require("../../utils/buildListingFilter.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const { cloudinary } = require("../../cloudConfig.js");

const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });

async function findGeometry(location, country) {
  const response = await geocodingClient
    .forwardGeocode({
      query: `${location}, ${country}`,
      limit: 1,
    })
    .send();

  const geometry = response.body.features[0]?.geometry;

  if (!geometry) {
    throw new ApiError(
      422,
      "LOCATION_NOT_FOUND",
      "That location could not be found.",
    );
  }

  return geometry;
}

async function removeCloudinaryImage(filename) {
  if (!filename) return;

  try {
    await cloudinary.uploader.destroy(filename);
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error.message);
  }
}

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

module.exports.create = async (req, res) => {
  let listingSaved = false;

  try {
    const geometry = await findGeometry(req.body.location, req.body.country);

    const listing = new Listing({
      ...req.body,
      image: {
        url: req.file.path,
        filename: req.file.filename,
      },
      geometry,
      owner: req.user._id,
    });

    await listing.save();
    listingSaved = true;
    await listing.populate("owner", "username");

    res.status(201).json({ data: listing });
  } catch (error) {
    if (!listingSaved) {
      await removeCloudinaryImage(req.file?.filename);
    }
    throw error;
  }
};

module.exports.update = async (req, res) => {
  const listing = req.listing;
  const previousImageFilename = listing.image?.filename;
  let listingSaved = false;

  try {
    const locationChanged =
      listing.location !== req.body.location ||
      listing.country !== req.body.country;

    if (locationChanged) {
      listing.geometry = await findGeometry(
        req.body.location,
        req.body.country,
      );
    }

    listing.set(req.body);

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();
    listingSaved = true;

    if (req.file && previousImageFilename !== req.file.filename) {
      await removeCloudinaryImage(previousImageFilename);
    }

    await listing.populate("owner", "username");
    await listing.populate({
      path: "reviews",
      select: "comments rating createdAt author",
      populate: { path: "author", select: "username" },
    });

    res.status(200).json({ data: listing });
  } catch (error) {
    if (!listingSaved) {
      await removeCloudinaryImage(req.file?.filename);
    }
    throw error;
  }
};

module.exports.destroy = async (req, res) => {
  const listing = req.listing;
  const imageFilename = listing.image?.filename;

  await Listing.findByIdAndDelete(listing._id);
  await removeCloudinaryImage(imageFilename);

  res.status(200).json({
    data: {
      id: listing._id.toString(),
      deleted: true,
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
