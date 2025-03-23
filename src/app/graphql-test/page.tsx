'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GraphQLTestPage() {
  const [query, setQuery] = useState(`query {
  posts {
    id
    title
    content
    published
    author {
      name
      email
    }
  }
}`)
  const [response, setResponse] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error:', error)
      setResponse(String(error))
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">GraphQL Playground</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-4">Query</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-[400px] p-4 font-mono text-sm border rounded-lg"
            />
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Run Query
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Response</h2>
          <pre className="w-full h-[400px] p-4 font-mono text-sm border rounded-lg overflow-auto bg-gray-50">
            {response || 'No response yet'}
          </pre>
        </div>
      </div>
    </div>
  )
} 