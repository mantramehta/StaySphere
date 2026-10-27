import { useState } from 'react'
import type { Review } from '../types'

type ReviewCardProps = {
  review: Review
  canDelete: boolean
  isDeleting: boolean
  onDelete: (reviewId: string) => void
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

function ReviewCard({ review, canDelete, isDeleting, onDelete }: ReviewCardProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  function handleDelete() {
    setIsConfirming(false)
    onDelete(review._id)
  }

  return (
    <article className="review-card">
      <div className="review-heading">
        <div>
          <h3>{review.author?.username ?? 'StaySphere guest'}</h3>
          {review.createdAt && <time>{dateFormatter.format(new Date(review.createdAt))}</time>}
        </div>
        <span className="rating" aria-label={`${review.rating} out of 5 stars`}>
          ★ {review.rating}
        </span>
      </div>
      <p>{review.comments}</p>
      {canDelete && !isConfirming && (
        <button
          className="review-delete-button"
          type="button"
          onClick={() => setIsConfirming(true)}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete review'}
        </button>
      )}
      {canDelete && isConfirming && (
        <div className="review-confirmation">
          <span>Delete this review?</span>
          <button type="button" onClick={() => setIsConfirming(false)}>
            Cancel
          </button>
          <button className="confirm-delete" type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </article>
  )
}

export default ReviewCard
