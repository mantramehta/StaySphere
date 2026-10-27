import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import ListingDetailsPage from './pages/ListingDetailsPage'
import ListingsPage from './pages/ListingsPage'

function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="StaySphere home">
          <span className="brand-mark">S</span>
          StaySphere
        </Link>
        <span className="header-note">V2 Preview</span>
      </header>

      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="*" element={<p className="status-message page-message">Page not found.</p>} />
      </Routes>
    </>
  )
}

export default App