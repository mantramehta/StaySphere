import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ApiErrorResponse, AuthResponse, CurrentUser } from '../types'

type RegisterPageProps = {
  onRegister: (user: CurrentUser) => void
}

function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      })

      if (!response.ok) {
        const result: ApiErrorResponse = await response.json()
        throw new Error(result.error.message)
      }

      const result: AuthResponse = await response.json()

      if (result.data.user) {
        onRegister(result.data.user)
        navigate('/')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Registration failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="eyebrow">Join StaySphere</span>
        <h1>Create your account</h1>
        <p>Start exploring memorable stays around the world.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            required
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />

          {error && <p className="form-error" role="alert">{error}</p>}

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  )
}

export default RegisterPage
