const MAX_RESULTS = 12;

const POINTS = {
  category: 3,
  titleKeyword: 2,
  descriptionKeyword: 1,
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatCategory(category) {
  return category.replaceAll("-", " ");
}

// Price and destination are hard limits, so they go into the database query.
function buildRecommendationFilter({ destination, minPrice, maxPrice }) {
  const filter = {};

  if (minPrice !== null || maxPrice !== null) {
    filter.price = {};
    if (minPrice !== null) filter.price.$gte = minPrice;
    if (maxPrice !== null) filter.price.$lte = maxPrice;
  }

  if (destination) {
    const pattern = new RegExp(escapeRegex(destination), "i");
    filter.$or = [{ location: pattern }, { country: pattern }, { title: pattern }];
  }

  return filter;
}

function describePrice(price, { minPrice, maxPrice }) {
  if (minPrice !== null && maxPrice !== null) {
    return `$${price}/night, within your $${minPrice}–$${maxPrice} range`;
  }
  if (maxPrice !== null) {
    return `$${price}/night, within your $${maxPrice} budget`;
  }
  if (minPrice !== null) {
    return `$${price}/night, above your $${minPrice} minimum`;
  }
  return null;
}

// Categories and keywords are preferences, so they raise a listing's score
// instead of excluding it.
function scoreListing(listing, preferences) {
  const title = (listing.title || "").toLowerCase();
  const description = (listing.description || "").toLowerCase();
  const reasons = [];
  let score = 0;

  if (preferences.destination) {
    reasons.push(`Located in ${listing.location}, ${listing.country}`);
  }

  if (preferences.categories.includes(listing.category)) {
    score += POINTS.category;
    reasons.push(`Matches your ${formatCategory(listing.category)} preference`);
  }

  for (const keyword of preferences.keywords) {
    if (title.includes(keyword)) {
      score += POINTS.titleKeyword;
      reasons.push(`Title mentions "${keyword}"`);
    } else if (description.includes(keyword)) {
      score += POINTS.descriptionKeyword;
      reasons.push(`Description mentions "${keyword}"`);
    }
  }

  const priceReason = describePrice(listing.price, preferences);
  if (priceReason) reasons.push(priceReason);

  return { score, reasons };
}

function rankListings(listings, preferences) {
  const hasSoftPreferences =
    preferences.categories.length > 0 || preferences.keywords.length > 0;

  return listings
    .map((listing) => ({ listing, ...scoreListing(listing, preferences) }))
    .filter((result) => !hasSoftPreferences || result.score > 0)
    .sort((a, b) => b.score - a.score || a.listing.price - b.listing.price)
    .slice(0, MAX_RESULTS);
}

module.exports = { buildRecommendationFilter, scoreListing, rankListings };
