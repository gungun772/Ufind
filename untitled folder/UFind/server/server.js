import http from 'http'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import { seedInitialData } from './seed.js'
import { initSocket } from './socket.js'
import authRoutes from './routes/auth.js'
import itemsRoutes from './routes/items.js'
import claimsRoutes from './routes/claims.js'
import adminRoutes from './routes/admin.js'
import enquiriesRoutes from './routes/enquiries.js'
import notificationsRoutes from './routes/notifications.js'

dotenv.config()

const app = express()
const httpServer = http.createServer(app)
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Initialize Socket.IO with HTTP Server
initSocket(httpServer)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'UFind Campus Lost & Found API',
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemsRoutes)
app.use('/api/claims', claimsRoutes)
app.use('/api/enquiries', enquiriesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  })
})

// Start Server and Database Connection
async function start() {
  try {
    await connectDB()
    await seedInitialData()

    httpServer.listen(PORT, () => {
      console.log(`[UFind API] Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('[UFind API] Failed to start server:', error)
    process.exit(1)
  }
}

start()
