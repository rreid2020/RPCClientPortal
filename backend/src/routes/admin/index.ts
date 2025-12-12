import { Router } from 'express'
import tenantsRouter from './tenants'
import usersRouter from './users'
import rolesRouter from './roles'

const router = Router()

// Mount admin sub-routes
router.use('/tenants', tenantsRouter)
router.use('/users', usersRouter)
router.use('/roles', rolesRouter)

export default router



