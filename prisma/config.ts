// Prisma 7 config file for migrations
// This file is used by Prisma Migrate to get the database connection URL
export default {
  datasource: {
    provider: 'postgresql' as const,
    url: process.env.DATABASE_URL!,
  },
}

