import { Link } from 'react-router-dom'

function PrivacyPage() {
  return (
    <main className="legal-page">
      <span className="eyebrow">StaySphere</span>
      <h1>Privacy Policy</h1>
      <p className="legal-date">Last updated October 27, 2026</p>
      <section><h2>About this project</h2><p>StaySphere is an educational travel-listing project. It is not a real booking service.</p></section>
      <section><h2>Information we store</h2><p>We store account details, listings, and reviews that you choose to submit. Passwords are securely hashed and are never stored as readable text.</p></section>
      <section><h2>How information is used</h2><p>Your information is used to provide login, listing, review, image, and map features inside StaySphere.</p></section>
      <section><h2>Services used</h2><p>StaySphere uses MongoDB Atlas for data, Cloudinary for uploaded images, and Mapbox for maps and location data.</p></section>
      <section><h2>AI travel search</h2><p>When you use AI travel search, the text you type is sent to Google's Gemini API to understand your request. Google may use this text to improve its services, so please don't include personal information. Your request is not linked to your account or saved by StaySphere.</p></section>
      <Link className="back-link" to="/listings">← Back to listings</Link>
    </main>
  )
}

export default PrivacyPage
