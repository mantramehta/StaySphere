import { Link } from 'react-router-dom'
import type { Listing } from '../types'

type ListingCardProps = {
  listing: Listing
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link className="listing-link" to={`/listings/${listing._id}`}>
      <article className="listing-card">
        <img className="listing-image" src={listing.image.url} alt={listing.title} />
        <div className="listing-details">
          <span className="category">{listing.category.replaceAll('-', ' ')}</span>
          <h2>{listing.title}</h2>
          <p className="location">
            {listing.location}, {listing.country}
          </p>
          <p className="price">
            <strong>{priceFormatter.format(listing.price)}</strong> / night
          </p>
        </div>
      </article>
    </Link>
  )
}

export default ListingCard
