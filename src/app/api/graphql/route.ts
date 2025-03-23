import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const typeDefs = `#graphql
  type User {
    id: String!
    email: String!
    name: String
    posts: [Post!]!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: String!
    title: String!
    content: String
    published: Boolean!
    author: User!
    authorId: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    users: [User!]!
    user(id: String!): User
    posts: [Post!]!
    post(id: String!): Post
    publishedPosts: [Post!]!
  }

  type Mutation {
    createUser(email: String!, name: String): User!
    updateUser(id: String!, email: String, name: String): User!
    deleteUser(id: String!): User
    
    createPost(title: String!, content: String, authorId: String!): Post!
    updatePost(id: String!, title: String, content: String, published: Boolean): Post!
    deletePost(id: String!): Post
    publishPost(id: String!): Post!
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      return await prisma.user.findMany({
        include: { posts: true }
      });
    },
    user: async (_, { id }) => {
      return await prisma.user.findUnique({
        where: { id },
        include: { posts: true }
      });
    },
    posts: async () => {
      return await prisma.post.findMany({
        include: { author: true }
      });
    },
    post: async (_, { id }) => {
      return await prisma.post.findUnique({
        where: { id },
        include: { author: true }
      });
    },
    publishedPosts: async () => {
      return await prisma.post.findMany({
        where: { published: true },
        include: { author: true }
      });
    }
  },
  Mutation: {
    createUser: async (_, { email, name }) => {
      return await prisma.user.create({
        data: { email, name },
        include: { posts: true }
      });
    },
    updateUser: async (_, { id, email, name }) => {
      return await prisma.user.update({
        where: { id },
        data: { email, name },
        include: { posts: true }
      });
    },
    deleteUser: async (_, { id }) => {
      return await prisma.user.delete({
        where: { id },
        include: { posts: true }
      });
    },
    createPost: async (_, { title, content, authorId }) => {
      return await prisma.post.create({
        data: { title, content, authorId },
        include: { author: true }
      });
    },
    updatePost: async (_, { id, title, content, published }) => {
      return await prisma.post.update({
        where: { id },
        data: { title, content, published },
        include: { author: true }
      });
    },
    deletePost: async (_, { id }) => {
      return await prisma.post.delete({
        where: { id },
        include: { author: true }
      });
    },
    publishPost: async (_, { id }) => {
      return await prisma.post.update({
        where: { id },
        data: { published: true },
        include: { author: true }
      });
    }
  }
};

// GraphQL 서버 생성
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Next.js API 라우트 핸들러 생성
const handler = startServerAndCreateNextHandler(server);

// Next.js App Router에서 사용할 수 있는 형태로 Export
export { handler as GET, handler as POST };
