import { Link } from 'react-router-dom'
import type { CurrentUser } from '../types'

type HomePageProps = {
  currentUser: CurrentUser | null
}

function HomePage({ currentUser }: HomePageProps) {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <span className="eyebrow">Find your next stay</span>
          <h1>Beautiful places. Unforgettable stays.</h1>
          <p>
            Discover handpicked homes, unique escapes, and memorable destinations
            from around the world.
          </p>
          <div className="home-actions">
            <Link className="home-primary" to="/listings">Explore stays</Link>
            <Link className="home-secondary" to={currentUser ? '/listings/new' : '/register'}>
              {currentUser ? 'Host your place' : 'Join StaySphere'}
            </Link>
          </div>
        </div>

        <div className="home-image-wrap">
          <img
            className="home-image"
            src="https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=1200&q=80"
            alt="Modern holiday home with a swimming pool"
          />
          <div className="home-image-note">
            <strong>Stay somewhere special</strong>
            <span>Homes in destinations worldwide</span>
          </div>
        </div>
      </section>

      <section className="home-features" aria-label="StaySphere features">
        <article><span>⌂</span><div><h2>Unique stays</h2><p>From city rooms to cabins, castles, domes, and boats.</p></div></article>
        <article><span>⌕</span><div><h2>Easy discovery</h2><p>Search destinations and browse stays by category.</p></div></article>
        <article><span>⌖</span><div><h2>Explore the world</h2><p>View every stay on a map before planning your trip.</p></div></article>
      </section>
    </main>
  )
}

export default HomePage
