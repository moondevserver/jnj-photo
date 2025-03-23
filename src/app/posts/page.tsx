import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CreatePost from './create-post'

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    include: {
      author: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Home
        </Link>
      </div>

      <CreatePost />

      <div className="grid gap-4 mt-8">
        {posts.map((post) => (
          <article key={post.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-2">{post.content}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>By {post.author?.name || 'Unknown'}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-sm ${
                post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {post.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
} 