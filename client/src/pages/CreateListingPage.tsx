import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ApiErrorResponse, CreateListingResponse } from '../types'

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

function CreateListingPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!image) {
      setError('Please choose an image.')
      return
    }

    if (image.size > 5 * 1024 * 1024) {
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
    formData.append('image', image)

    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      const result: CreateListingResponse = await response.json()
      navigate(`/listings/${result.data._id}`)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The listing could not be created.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="form-page">
      <section className="listing-form-card">
        <span className="eyebrow">Host on StaySphere</span>
        <h1>Add a new stay</h1>
        <p>Tell guests what makes your place memorable.</p>

        <form className="listing-form" onSubmit={handleSubmit}>
          <label htmlFor="listing-title">Title</label>
          <input
            id="listing-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            minLength={3}
            maxLength={100}
            required
          />

          <label htmlFor="listing-description">Description</label>
          <textarea
            id="listing-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            minLength={10}
            maxLength={2000}
            rows={5}
            required
          />

          <div className="form-row">
            <div>
              <label htmlFor="listing-price">Price per night</label>
              <input
                id="listing-price"
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                min="0"
                step="1"
                required
              />
            </div>

            <div>
              <label htmlFor="listing-category">Category</label>
              <select
                id="listing-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                <option value="">Choose a category</option>
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
              <label htmlFor="listing-location">Location</label>
              <input
                id="listing-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="listing-country">Country</label>
              <input
                id="listing-country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                maxLength={100}
                required
              />
            </div>
          </div>

          <label htmlFor="listing-image">Listing image</label>
          <input
            id="listing-image"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating stay...' : 'Create stay'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default CreateListingPage
