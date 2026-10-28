const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  buildRecommendationFilter,
  scoreListing,
  rankListings,
} = require("../utils/recommendationService.js");

const noPreferences = {
  destination: null,
  minPrice: null,
  maxPrice: null,
  categories: [],
  keywords: [],
};

const listings = [
  {
    _id: "alps",
    title: "Alpine Lake Chalet",
    description: "A peaceful wooden chalet beside a quiet lake.",
    price: 180,
    location: "Zermatt",
    country: "Switzerland",
    category: "mountains",
  },
  {
    _id: "manali",
    title: "Himalayan Cabin",
    description: "A cosy cabin with valley views.",
    price: 120,
    location: "Manali",
    country: "India",
    category: "mountains",
  },
  {
    _id: "goa",
    title: "Goa Beach Hut",
    description: "Steps from the beach with a peaceful garden.",
    price: 90,
    location: "Goa",
    country: "India",
    category: "camping",
  },
  {
    _id: "maldives",
    title: "Overwater Villa",
    description: "A private pool above a turquoise lagoon near the beach.",
    price: 850,
    location: "Malé",
    country: "Maldives",
    category: "amazing-pools",
  },
];

describe("buildRecommendationFilter", () => {
  it("returns an empty filter when there are no hard limits", () => {
    assert.deepEqual(buildRecommendationFilter(noPreferences), {});
  });

  it("turns a budget into a price range", () => {
    const filter = buildRecommendationFilter({ ...noPreferences, minPrice: 100, maxPrice: 250 });
    assert.deepEqual(filter, { price: { $gte: 100, $lte: 250 } });
  });

  it("matches a destination against location, country, or title, ignoring case", () => {
    const filter = buildRecommendationFilter({ ...noPreferences, destination: "india" });
    const fields = filter.$or.map((condition) => Object.keys(condition)[0]);

    assert.deepEqual(fields, ["location", "country", "title"]);
    assert.ok(filter.$or[1].country.test("India"));
  });

  it("treats regex symbols in a destination as plain text", () => {
    const filter = buildRecommendationFilter({ ...noPreferences, destination: "St. Moritz" });
    const pattern = filter.$or[0].location;

    assert.ok(pattern.test("St. Moritz"));
    assert.equal(pattern.test("Stx Moritz"), false);
  });
});

describe("scoreListing", () => {
  it("explains category, keyword, and budget matches", () => {
    const result = scoreListing(listings[0], {
      ...noPreferences,
      maxPrice: 200,
      categories: ["mountains"],
      keywords: ["lake", "peaceful"],
    });

    assert.equal(result.score, 3 + 2 + 1);
    assert.deepEqual(result.reasons, [
      "Matches your mountains preference",
      'Title mentions "lake"',
      'Description mentions "peaceful"',
      "$180/night, within your $200 budget",
    ]);
  });

  it("mentions the location when the user asked for a destination", () => {
    const result = scoreListing(listings[1], { ...noPreferences, destination: "India" });
    assert.deepEqual(result.reasons, ["Located in Manali, India"]);
  });
});

describe("rankListings", () => {
  const ids = (results) => results.map((result) => result.listing._id);

  it("returns every listing, cheapest first, when there are no preferences", () => {
    assert.deepEqual(ids(rankListings(listings, noPreferences)), ["goa", "manali", "alps", "maldives"]);
  });

  it("keeps only listings matching at least one preference, best match first", () => {
    const results = rankListings(listings, {
      ...noPreferences,
      categories: ["mountains"],
      keywords: ["peaceful"],
    });

    assert.deepEqual(ids(results), ["alps", "manali", "goa"]);
    assert.deepEqual(results.map((result) => result.score), [4, 3, 1]);
  });

  it("returns nothing when no listing matches the preferences", () => {
    assert.deepEqual(rankListings(listings, { ...noPreferences, categories: ["castles"] }), []);
  });

  it("returns at most 12 results", () => {
    const many = Array.from({ length: 20 }, (_, index) => ({ ...listings[0], _id: `copy-${index}` }));
    assert.equal(rankListings(many, noPreferences).length, 12);
  });
});
