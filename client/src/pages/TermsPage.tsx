import { Link } from 'react-router-dom'

function TermsPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">StaySphere</span>
      <h1>Terms of Use</h1>
      <p className="legal-date">Last updated October 24, 2026</p>
      <section><h2>Educational use</h2><p>StaySphere is a portfolio and learning project. Listings are demonstrations and should not be treated as real accommodation offers.</p></section>
      <section><h2>User content</h2><p>You are responsible for listings and reviews you submit. Do not upload unlawful, misleading, or harmful content.</p></section>
      <section><h2>Accounts</h2><p>Keep your login details private. You may only edit or delete content when the application authorizes your account to do so.</p></section>
      <section><h2>No bookings or payments</h2><p>StaySphere does not currently process reservations or payments. Prices are shown only for demonstration.</p></section>
      <Link className="back-link" to="/listings">← Back to listings</Link>
    </main>
  )
}

export default TermsPage
