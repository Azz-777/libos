import { Router } from 'express'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/activities
router.get('/', requireRole('owner', 'manager'), async (req, res) => {
  const list = await Activity.find().sort({ timestamp: -1 }).limit(100)
  res.json(list.map(a => a.toJSON()))
})

export default router
