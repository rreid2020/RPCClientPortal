import { createApp } from './server'
import { env } from './config/env'

/**
 * Bootstrap the Express server
 */
async function main() {
  try {
    // Load environment variables (already done in config/env.ts, but ensure it's loaded)
    // The env module will throw if required variables are missing

    // Create the Express app
    const app = createApp()

    // Start the server
    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port}`)
      console.log(`📡 Environment: ${env.nodeEnv}`)
      console.log(`🔗 Health check: http://localhost:${env.port}/health`)
      console.log(`🔐 API endpoint: http://localhost:${env.port}/api`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server')
      server.close(() => {
        console.log('HTTP server closed')
        process.exit(0)
      })
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
main()

