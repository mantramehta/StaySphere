const Listing = require("../../models/listing.js");
const { extractPreferences } = require("../../utils/aiService.js");
const {
  buildRecommendationFilter,
  rankListings,
} = require("../../utils/recommendationService.js");

module.exports.recommend = async (req, res) => {
  const preferences = await extractPreferences(req.body.prompt);

  const listings = await Listing.find(buildRecommendationFilter(preferences))
    .select("title description image price location country category")
    .lean();

  const results = rankListings(listings, preferences);
  const { destination, minPrice, maxPrice, categories, keywords, unsupported } =
    preferences;

  res.status(200).json({
    data: results,
    meta: {
      count: results.length,
      preferences: { destination, minPrice, maxPrice, categories, keywords },
      unsupported,
    },
  });
};
