import express, { Application } from 'express'
import cors from 'cors'
import { env } from './config/env'
import routes from './routes'
import { errorHandler } from './middleware/errorHandler'

/**
 * Create and configure the Express application
 */
export function createApp(): Application {
  const app = express()

  // CORS configuration
  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )

  // Body parsing middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // API routes
  app.use(routes)

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      error: 'Not Found',
      code: 'NOT_FOUND',
    })
  })

  // Error handling middleware (must be last)
  app.use(errorHandler)

  return app
}





