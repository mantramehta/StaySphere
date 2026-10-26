import { useEffect, useState } from 'react'
import './App.css'
import ListingCard from './components/ListingCard'
import type { Listing, ListingsResponse } from './types'

function App() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadListings() {
      try {
        const response = await fetch('/api/listings', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The listings could not be loaded.')
        }

        const result: ListingsResponse = await response.json()
        setListings(result.data)
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

    loadListings()

    return () => controller.abort()
  }, [])

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="/" aria-label="StaySphere home">
          <span className="brand-mark">S</span>
          StaySphere
        </a>
        <span className="header-note">V2 Preview</span>
      </header>

      <section className="listings-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Explore stays</span>
            <h1>Find somewhere memorable</h1>
          </div>
          {!isLoading && !error && (
            <p className="result-count">
              {listings.length} {listings.length === 1 ? 'stay' : 'stays'}
            </p>
          )}
        </div>

        {isLoading && <p className="status-message">Loading stays…</p>}

        {error && (
          <div className="status-message error-message" role="alert">
            <strong>Something went wrong.</strong>
            <span>{error} Make sure the Express server is running.</span>
          </div>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <p className="status-message">No stays are available yet.</p>
        )}

        {!isLoading && !error && listings.length > 0 && (
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App

