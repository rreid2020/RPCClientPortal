import { Router } from 'express'
import meRouter from './me'
import adminRouter from './admin'

const router = Router()

// Mount route modules
router.use('/api', meRouter)
router.use('/api/admin', adminRouter)

export default router




