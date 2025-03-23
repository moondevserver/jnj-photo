import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Next.js + postgreSQL + GraphQL Demo</h1>
      
      <div className="grid gap-4">
        <Link 
          href="/posts" 
          className="p-4 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">📝 Posts</h2>
          <p className="text-gray-600">View and manage blog posts</p>
        </Link>

        <Link 
          href="/graphql-test" 
          className="p-4 border rounded-lg hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">🔍 GraphQL Playground</h2>
          <p className="text-gray-600">Test GraphQL queries and mutations</p>
        </Link>
      </div>
    </main>
  )
} 