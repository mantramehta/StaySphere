import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ListingMap from '../components/ListingMap'
import type { ListingDetails, ListingResponse } from '../types'

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function ListingDetailsPage() {
  const { id } = useParams()
  const [listing, setListing] = useState<ListingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadListing() {
      if (!id) {
        setError('The listing ID is missing.')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/listings/${id}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          const message =
            response.status === 404 ? 'The listing was not found.' : 'The listing could not be loaded.'
          throw new Error(message)
        }

        const result: ListingResponse = await response.json()
        setListing(result.data)
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name !== 'AbortError') {
          setError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadListing()

    return () => controller.abort()
  }, [id])

  return (
    <main className="details-page">
      <Link className="back-link" to="/">
        ← Back to stays
      </Link>

      {isLoading && <p className="status-message">Loading stay...</p>}

      {error && (
        <div className="status-message error-message" role="alert">
          <strong>Something went wrong.</strong>
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && listing && (
        <>
          <article className="details-card">
            <img className="details-image" src={listing.image.url} alt={listing.title} />
            <div className="details-content">
              <span className="category">{listing.category.replaceAll('-', ' ')}</span>
              <h1>{listing.title}</h1>
              <p className="details-location">
                {listing.location}, {listing.country}
              </p>
              <p className="details-description">{listing.description}</p>
              <p className="details-price">
                <strong>{priceFormatter.format(listing.price)}</strong> / night
              </p>
              <p className="details-host">
                Hosted by <strong>{listing.owner?.username ?? 'StaySphere host'}</strong>
              </p>
            </div>
          </article>

          <section className="map-section">
            <span className="eyebrow">Location</span>
            <h2>Where you’ll be</h2>
            <p>The marker shows the listing area. Exact details are shared after booking.</p>
            <ListingMap coordinates={listing.geometry.coordinates} title={listing.title} />
          </section>
        </>
      )}
    </main>
  )
}

export default ListingDetailsPage
