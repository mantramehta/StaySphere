import ListingCard from './ListingCard'
import type { AIPreferences, AIRecommendationsResponse } from '../types'

type AIRecommendationsProps = {
  result: AIRecommendationsResponse
  onClear: () => void
}

function describeBudget({ minPrice, maxPrice }: AIPreferences) {
  if (minPrice !== null && maxPrice !== null) return `$${minPrice}–$${maxPrice} a night`
  if (maxPrice !== null) return `Under $${maxPrice} a night`
  if (minPrice !== null) return `Over $${minPrice} a night`
  return null
}

function summarize(preferences: AIPreferences) {
  const categories = preferences.categories.map(
    (category) => category.charAt(0).toUpperCase() + category.slice(1).replaceAll('-', ' '),
  )

  return [preferences.destination, describeBudget(preferences), ...categories].filter(
    (item): item is string => Boolean(item),
  )
}

function AIRecommendations({ result, onClear }: AIRecommendationsProps) {
  const { data, meta } = result
  const understood = summarize(meta.preferences)
  const { keywords } = meta.preferences

  return (
    <section className="ai-results" aria-labelledby="ai-results-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Recommended for you</span>
          <h2 id="ai-results-title">
            {meta.count} {meta.count === 1 ? 'stay matches' : 'stays match'} your request
          </h2>
        </div>
        <button className="clear-button" type="button" onClick={onClear}>
          Show all stays
        </button>
      </div>

      {understood.length > 0 && (
        <div className="ai-summary">
          <span>We searched for:</span>
          {understood.map((item) => (
            <span className="ai-chip" key={item}>
              {item}
            </span>
          ))}
        </div>
      )}

      {keywords.length > 0 && (
        <p className="ai-note">Matching words in listings: {keywords.join(', ')}</p>
      )}

      {meta.unsupported.length > 0 && (
        <p className="ai-note">
          StaySphere can't filter by these yet, so they weren't used:{' '}
          {meta.unsupported.join(', ')}.
        </p>
      )}

      {data.length === 0 ? (
        <div className="status-message">
          <strong>No stays match all of that yet.</strong>
          <p>Try a higher budget, a different destination, or fewer details.</p>
        </div>
      ) : (
        <div className="listing-grid">
          {data.map(({ listing, reasons }) => (
            <ListingCard key={listing._id} listing={listing} reasons={reasons} />
          ))}
        </div>
      )}
    </section>
  )
}

export default AIRecommendations
