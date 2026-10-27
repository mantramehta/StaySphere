import type { Review } from '../types'

type ReviewCardProps = {
  review: Review
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
})

function ReviewCard({ review }: ReviewCardProps) {
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
    </article>
  )
}

export default ReviewCard
