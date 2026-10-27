function buildListingFilter(query) {
  const { category, search } = query;
  const filter = {};
  const searchTerm = typeof search === "string" ? search.trim() : "";

  if (category) {
    filter.category = category;
  }

  if (searchTerm) {
    filter.$or = [
      { title: { $regex: searchTerm, $options: "i" } },
      { location: { $regex: searchTerm, $options: "i" } },
      { country: { $regex: searchTerm, $options: "i" } },
    ];
  }

  return { filter, category, searchTerm };
}

module.exports = buildListingFilter;
