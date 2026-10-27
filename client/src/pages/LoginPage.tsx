import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ApiErrorResponse, AuthResponse, CurrentUser } from '../types'

type LoginPageProps = {
  onLogin: (user: CurrentUser) => void
}

function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      const result: AuthResponse = await response.json()

      if (result.data.user) {
        onLogin(result.data.user)
        navigate('/')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in to StaySphere</h1>
        <p>Use your username and password to continue.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  )
}

export default LoginPage
