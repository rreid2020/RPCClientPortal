import { defineDatasource } from '@prisma/internals'

export default defineDatasource({
  adapter: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL!,
  },
})

