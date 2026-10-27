import { useEffect, useState, type FormEvent } from 'react'
import ListingCard from '../components/ListingCard'
import type { Listing, ListingsResponse } from '../types'

const categories = [
  { label: 'All', value: '' },
  { label: 'Trending', value: 'trending' },
  { label: 'Rooms', value: 'rooms' },
  { label: 'Iconic Cities', value: 'iconic-cities' },
  { label: 'Mountains', value: 'mountains' },
  { label: 'Castles', value: 'castles' },
  { label: 'Amazing Pools', value: 'amazing-pools' },
  { label: 'Camping', value: 'camping' },
  { label: 'Farms', value: 'farms' },
  { label: 'Arctic', value: 'arctic' },
  { label: 'Domes', value: 'domes' },
  { label: 'Boats', value: 'boats' },
]

function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadListings() {
      try {
        setIsLoading(true)
        setError(null)

        const params = new URLSearchParams()

        if (search) params.set('search', search)
        if (selectedCategory) params.set('category', selectedCategory)

        const query = params.toString()
        const url = query ? `/api/listings?${query}` : '/api/listings'

        const response = await fetch(url, {
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
  }, [search, selectedCategory])

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  function clearSearch() {
    setSearchInput('')
    setSearch('')
  }

  return (
    <main className="listings-section">
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

      <form className="search-form" onSubmit={handleSearch}>
        <label className="visually-hidden" htmlFor="listing-search">
          Search stays
        </label>
        <input
          id="listing-search"
          type="search"
          placeholder="Search by title, location, or country"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button className="primary-button" type="submit">
          Search
        </button>
        {search && (
          <button className="clear-button" type="button" onClick={clearSearch}>
            Clear
          </button>
        )}
      </form>

      <nav className="category-filters" aria-label="Filter stays by category">
        {categories.map((category) => (
          <button
            className={selectedCategory === category.value ? 'filter active-filter' : 'filter'}
            type="button"
            key={category.value || 'all'}
            aria-pressed={selectedCategory === category.value}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </nav>

      {isLoading && <p className="status-message">Loading stays...</p>}

      {error && (
        <div className="status-message error-message" role="alert">
          <strong>Something went wrong.</strong>
          <span>{error} Make sure the Express server is running.</span>
        </div>
      )}

      {!isLoading && !error && listings.length === 0 && (
        <p className="status-message">No stays match your current filters.</p>
      )}

      {!isLoading && !error && listings.length > 0 && (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  )
}

export default ListingsPage
