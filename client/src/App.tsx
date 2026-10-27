import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import ListingDetailsPage from './pages/ListingDetailsPage'
import ListingsPage from './pages/ListingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreateListingPage from './pages/CreateListingPage'
import EditListingPage from './pages/EditListingPage'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import type { AuthResponse, CurrentUser } from './types'

function App() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) return

        const result: AuthResponse = await response.json()
        setCurrentUser(result.data.user)
      } catch {
        setCurrentUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    }

    loadCurrentUser()
  }, [])

  async function handleLogout() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    if (response.ok) {
      setCurrentUser(null)
      navigate('/')
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-left">
          <Link className="brand" to="/" aria-label="StaySphere home">
            <img className="brand-logo" src="/staysphere-logo.svg" alt="" />
          </Link>
          <Link className="explore-link" to="/listings">
            Explore
          </Link>
        </div>
        <nav className="auth-nav" aria-label="Account navigation">
          {isAuthLoading && <span className="header-note">Checking session...</span>}

          {!isAuthLoading && !currentUser && (
            <>
              <Link to="/login">Log in</Link>
              <Link className="header-button" to="/register">Sign up</Link>
            </>
          )}

          {!isAuthLoading && currentUser && (
            <>
              <Link to="/listings/new">Add a stay</Link>
              <span className="header-note">Hi, {currentUser.username}</span>
              <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </header>

      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage currentUser={currentUser} />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route
            path="/listings/:id"
            element={<ListingDetailsPage currentUser={currentUser} />}
          />
          <Route
            path="/listings/new"
            element={
              isAuthLoading ? (
                <p className="status-message page-message">Checking session...</p>
              ) : currentUser ? (
                <CreateListingPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              isAuthLoading ? (
                <p className="status-message page-message">Checking session...</p>
              ) : currentUser ? (
                <EditListingPage currentUser={currentUser} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={<LoginPage onLogin={setCurrentUser} />} />
          <Route path="/register" element={<RegisterPage onRegister={setCurrentUser} />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="*"
            element={<p className="status-message page-message">Page not found.</p>}
          />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

export default App
