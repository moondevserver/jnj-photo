---
- name: "jnj-photo"
- description: "Nextjs Server with postgreSQL in Typescript"
- author: "Moon Dev Server <moondevserver@gmail.com>"
- github-id: "moondevserver"
---

# Next.js + PostgreSQL + GraphQL Template

## Features

- Next.js 14 with App Router
- PostgreSQL with Prisma ORM
- GraphQL with Apollo Server
- TypeScript
- Tailwind CSS
- ESLint & Prettier

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up your PostgreSQL database and update the `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/your_database_name?schema=public"
```

3. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

## Database Setup

1. Make sure PostgreSQL is installed and running
2. Create a new database:
```sql
CREATE DATABASE your_database_name;
```

3. The schema will be automatically created when you run `prisma db push`

## GraphQL API

The GraphQL API is available at `/api/graphql`. You can test it using the GraphQL Playground at `/graphql-test`.

## Tech Stack

- TypeScript
- Next.js
- PostgreSQL
- Prisma
- Apollo Server
- GraphQL
- Tailwind CSS 