import { Router } from 'express'
import Supplier from '../models/Supplier.js'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/suppliers
router.get('/', requireRole('owner', 'manager'), async (req, res) => {
  const { search } = req.query
  const q = {}
  if (search) {
    const rx = new RegExp(search, 'i')
    q.$or = [{ name: rx }, { contactName: rx }, { phone: rx }]
  }
  const list = await Supplier.find(q).sort({ createdAt: -1 })
  res.json(list.map(s => s.toJSON()))
})

// POST /api/suppliers
router.post('/', requireRole('owner', 'manager'), async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Nomi kerak' })
    const s = await Supplier.create({ ...req.body })
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `yetkazib beruvchi qo'shdi: ${s.name}` })
    res.status(201).json(s.toJSON())
  } catch (err) { next(err) }
})

// PATCH /api/suppliers/:id
router.patch('/:id', requireRole('owner', 'manager'), async (req, res) => {
  const s = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!s) return res.status(404).json({ error: 'Topilmadi' })
  res.json(s.toJSON())
})

// DELETE /api/suppliers/:id
router.delete('/:id', requireRole('owner'), async (req, res) => {
  const s = await Supplier.findByIdAndDelete(req.params.id)
  if (!s) return res.status(404).json({ error: 'Topilmadi' })
  res.json({ ok: true })
})

export default router
