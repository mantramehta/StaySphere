import { useState, type FormEvent } from 'react'
import type { AIRecommendationsResponse, ApiErrorResponse } from '../types'

type AITravelSearchProps = {
  onResults: (result: AIRecommendationsResponse) => void
}

const MAX_PROMPT_LENGTH = 300

const examplePrompts = [
  'A mountain stay in India under $200',
  'Somewhere romantic with a pool',
  'A peaceful farm stay in Italy',
  'A castle under $500 a night',
]

function AITravelSearch({ onResults }: AITravelSearchProps) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function findStays(text: string) {
    const trimmed = text.trim()

    if (trimmed.length < 3) {
      setError('Tell us a little more about the stay you want.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
      })

      if (!response.ok) {
        const result: ApiErrorResponse | null = await response.json().catch(() => null)
        throw new Error(result?.error.message ?? 'AI search is unavailable right now.')
      }

      const result: AIRecommendationsResponse = await response.json()
      onResults(result)
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? 'We could not reach StaySphere. Check your connection and try again.'
          : (requestError as Error).message,
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    findStays(prompt)
  }

  function handleExample(example: string) {
    setPrompt(example)
    findStays(example)
  }

  return (
    <section className="ai-search" aria-labelledby="ai-search-title">
      <span className="eyebrow">AI travel concierge</span>
      <h2 id="ai-search-title">Describe your perfect stay</h2>
      <p>Tell us what you're looking for, and we'll help you find it.</p>

      <form className="ai-search-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="ai-prompt">
          Describe your perfect stay
        </label>
        <input
          id="ai-prompt"
          type="text"
          placeholder="e.g. A quiet mountain cabin in India under $200"
          maxLength={MAX_PROMPT_LENGTH}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isLoading}
        />
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading ? 'Finding stays...' : 'Find stays'}
        </button>
      </form>

      <div className="ai-examples">
        <span>Try:</span>
        {examplePrompts.map((example) => (
          <button
            type="button"
            key={example}
            onClick={() => handleExample(example)}
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>

      {isLoading && (
        <p className="ai-status" role="status">
          Reading your request and searching real StaySphere listings...
        </p>
      )}

      {error && (
        <p className="form-error ai-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default AITravelSearch
