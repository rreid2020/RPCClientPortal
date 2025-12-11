import { createApp } from './server'
import { env } from './config/env'
import { db } from './config/db'

/**
 * Bootstrap the Express server
 */
async function main() {
  try {
    // Load environment variables (already done in config/env.ts, but ensure it's loaded)
    // The env module will throw if required variables are missing

    // Test database connection
    console.log('🔍 Testing database connection...')
    try {
      await db.$connect()
      console.log('✅ Database connection successful')
    } catch (dbError: any) {
      console.error('❌ Database connection failed:', dbError.message)
      throw new Error(`Database connection failed: ${dbError.message}`)
    }

    // Create the Express app
    const app = createApp()

    // Start the server - bind to 0.0.0.0 to accept connections from all interfaces
    const host = process.env.HOSTNAME || '0.0.0.0'
    const server = app.listen(env.port, host, () => {
      console.log(`🚀 Server running on ${host}:${env.port}`)
      console.log(`📡 Environment: ${env.nodeEnv}`)
      console.log(`🔗 Health check: http://${host}:${env.port}/health`)
      console.log(`🔐 API endpoint: http://${host}:${env.port}/api`)
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


