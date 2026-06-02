import { defineConfig } from 'drizzle-kit'

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL)
export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
