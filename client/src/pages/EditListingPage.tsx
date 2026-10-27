import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type {
  ApiErrorResponse,
  CurrentUser,
  ListingDetails,
  ListingResponse,
} from '../types'

const categories = [
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

type EditListingPageProps = {
  currentUser: CurrentUser
}

function EditListingPage({ currentUser }: EditListingPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ListingDetails | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function loadListing() {
      try {
        const response = await fetch(`/api/listings/${id}`)

        if (!response.ok) {
          throw new Error('The listing could not be loaded.')
        }

        const result: ListingResponse = await response.json()

        if (result.data.owner?._id !== currentUser.id) {
          throw new Error('Only the listing owner can edit this stay.')
        }

        setListing(result.data)
        setTitle(result.data.title)
        setDescription(result.data.description)
        setPrice(String(result.data.price))
        setLocation(result.data.location)
        setCountry(result.data.country)
        setCategory(result.data.category)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'The listing could not be loaded.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadListing()
  }, [currentUser.id, id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!listing) return

    if (image && image.size > 5 * 1024 * 1024) {
      setError('The image must be 5 MB or smaller.')
      return
    }

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('price', price)
    formData.append('location', location)
    formData.append('country', country)
    formData.append('category', category)
    if (image) formData.append('image', image)

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/listings/${listing._id}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      const result: ListingResponse = await response.json()
      navigate(`/listings/${result.data._id}`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The listing could not be updated.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="status-message page-message">Loading listing...</p>
  }

  if (!listing) {
    return <p className="status-message error-message page-message">{error}</p>
  }

  return (
    <main className="form-page">
      <Link className="back-link" to={`/listings/${listing._id}`}>← Cancel editing</Link>
      <section className="listing-form-card">
        <span className="eyebrow">Manage your stay</span>
        <h1>Edit listing</h1>
        <p>Update the information guests see.</p>

        <form className="listing-form" onSubmit={handleSubmit}>
          <label htmlFor="edit-title">Title</label>
          <input
            id="edit-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={3}
            maxLength={100}
            required
          />

          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            minLength={10}
            maxLength={2000}
            rows={5}
            required
          />

          <div className="form-row">
            <div>
              <label htmlFor="edit-price">Price per night</label>
              <input
                id="edit-price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                min="0"
                step="1"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-category">Category</label>
              <select
                id="edit-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div>
              <label htmlFor="edit-location">Location</label>
              <input
                id="edit-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div>
              <label htmlFor="edit-country">Country</label>
              <input
                id="edit-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div className="current-image">
            <span>Current image</span>
            <img src={listing.image.url} alt={listing.title} />
          </div>

          <label htmlFor="edit-image">Replace image (optional)</label>
          <input
            id="edit-image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving changes...' : 'Save changes'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default EditListingPage
