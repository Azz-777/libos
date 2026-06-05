import { Router } from 'express'
import Customer from '../models/Customer.js'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/customers
router.get('/', async (req, res) => {
  const { search, tier, status } = req.query
  const q = {}
  if (tier && tier !== 'all') q.tier = tier
  if (status && status !== 'all') q.status = status
  if (search) {
    const rx = new RegExp(search, 'i')
    q.$or = [{ fullName: rx }, { phone: rx }, { email: rx }]
  }
  const list = await Customer.find(q).sort({ totalSpent: -1 })
  res.json(list.map(c => c.toJSON()))
})

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
  const c = await Customer.findById(req.params.id)
  if (!c) return res.status(404).json({ error: 'Topilmadi' })
  res.json(c.toJSON())
})

// POST /api/customers
router.post('/', async (req, res, next) => {
  try {
    const { fullName, phone } = req.body
    if (!fullName) return res.status(400).json({ error: 'Ism kerak' })
    const c = await Customer.create({ ...req.body })
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `yangi mijoz qo'shdi: ${c.fullName}` })
    res.status(201).json(c.toJSON())
  } catch (err) { next(err) }
})

// PATCH /api/customers/:id
router.patch('/:id', async (req, res) => {
  const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!c) return res.status(404).json({ error: 'Topilmadi' })
  res.json(c.toJSON())
})

// DELETE /api/customers/:id
router.delete('/:id', requireRole('owner', 'manager'), async (req, res) => {
  const c = await Customer.findByIdAndDelete(req.params.id)
  if (!c) return res.status(404).json({ error: 'Topilmadi' })
  await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `mijozni o'chirdi: ${c.fullName}` })
  res.json({ ok: true })
})

export default router
