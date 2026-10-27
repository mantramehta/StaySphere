import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import ListingDetailsPage from './pages/ListingDetailsPage'
import ListingsPage from './pages/ListingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
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
    <>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="StaySphere home">
          <span className="brand-mark">S</span>
          StaySphere
        </Link>
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
              <span className="header-note">Hi, {currentUser.username}</span>
              <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/login" element={<LoginPage onLogin={setCurrentUser} />} />
        <Route path="/register" element={<RegisterPage onRegister={setCurrentUser} />} />
        <Route path="*" element={<p className="status-message page-message">Page not found.</p>} />
      </Routes>
    </>
  )
}

export default App
