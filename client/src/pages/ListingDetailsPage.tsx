import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ListingMap from '../components/ListingMap'
import ReviewCard from '../components/ReviewCard'
import type {
  ApiErrorResponse,
  CurrentUser,
  ListingDetails,
  ListingResponse,
  ReviewResponse,
} from '../types'

type ListingDetailsPageProps = {
  currentUser: CurrentUser | null
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function ListingDetailsPage({ currentUser }: ListingDetailsPageProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ListingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [rating, setRating] = useState('5')
  const [comments, setComments] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null)

  const isOwner = Boolean(
    currentUser && listing?.owner && currentUser.id === listing.owner._id,
  )

  const averageRating =
    listing && listing.reviews.length > 0
      ? listing.reviews.reduce((total, review) => total + review.rating, 0) /
        listing.reviews.length
      : null

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

  async function handleDelete() {
    if (!listing || !window.confirm('Delete this listing permanently?')) return

    setActionError(null)
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/listings/${listing._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      navigate('/')
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : 'The listing could not be deleted.',
      )
      setIsDeleting(false)
    }
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!listing) return

    setReviewError(null)
    setIsReviewSubmitting(true)

    try {
      const response = await fetch(`/api/listings/${listing._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: Number(rating), comments }),
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      const result: ReviewResponse = await response.json()
      setListing((currentListing) =>
        currentListing
          ? { ...currentListing, reviews: [result.data, ...currentListing.reviews] }
          : currentListing,
      )
      setRating('5')
      setComments('')
    } catch (requestError) {
      setReviewError(
        requestError instanceof Error
          ? requestError.message
          : 'The review could not be created.',
      )
    } finally {
      setIsReviewSubmitting(false)
    }
  }

  async function handleReviewDelete(reviewId: string) {
    if (!listing) return

    setReviewError(null)
    setDeletingReviewId(reviewId)

    try {
      const response = await fetch(
        `/api/listings/${listing._id}/reviews/${reviewId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      setListing((currentListing) =>
        currentListing
          ? {
              ...currentListing,
              reviews: currentListing.reviews.filter(
                (review) => review._id !== reviewId,
              ),
            }
          : currentListing,
      )
    } catch (requestError) {
      setReviewError(
        requestError instanceof Error
          ? requestError.message
          : 'The review could not be deleted.',
      )
    } finally {
      setDeletingReviewId(null)
    }
  }

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
              {isOwner && (
                <div className="owner-actions">
                  <Link className="edit-button" to={`/listings/${listing._id}/edit`}>
                    Edit listing
                  </Link>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete listing'}
                  </button>
                </div>
              )}
              {actionError && <p className="form-error" role="alert">{actionError}</p>}
            </div>
          </article>

          <section className="reviews-section">
            <div className="reviews-heading">
              <div>
                <span className="eyebrow">Guest feedback</span>
                <h2>Reviews</h2>
              </div>
              {averageRating !== null && (
                <p>
                  <strong>★ {averageRating.toFixed(1)}</strong> · {listing.reviews.length}{' '}
                  {listing.reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              )}
            </div>

            {currentUser ? (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div>
                  <label htmlFor="review-rating">Rating</label>
                  <select
                    id="review-rating"
                    value={rating}
                    onChange={(event) => setRating(event.target.value)}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div className="review-comment-field">
                  <label htmlFor="review-comments">Your review</label>
                  <textarea
                    id="review-comments"
                    value={comments}
                    onChange={(event) => setComments(event.target.value)}
                    minLength={3}
                    maxLength={1000}
                    rows={3}
                    required
                  />
                </div>
                <button className="primary-button" type="submit" disabled={isReviewSubmitting}>
                  {isReviewSubmitting ? 'Posting...' : 'Post review'}
                </button>
              </form>
            ) : (
              <p className="review-login-message">
                <Link to="/login">Log in</Link> to leave a review.
              </p>
            )}

            {reviewError && <p className="form-error review-error" role="alert">{reviewError}</p>}

            {listing.reviews.length === 0 ? (
              <p className="status-message">No reviews yet.</p>
            ) : (
              <div className="reviews-grid">
                {listing.reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    canDelete={currentUser?.id === review.author?._id}
                    isDeleting={deletingReviewId === review._id}
                    onDelete={handleReviewDelete}
                  />
                ))}
              </div>
            )}
          </section>

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
