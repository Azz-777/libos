import { Router } from 'express'
import Product from '../models/Product.js'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/products
router.get('/', async (req, res) => {
  const { search, category, lowStock } = req.query
  const q = {}
  if (category && category !== 'all') q.category = category
  if (search) {
    const rx = new RegExp(search, 'i')
    q.$or = [{ name: rx }, { sku: rx }, { brand: rx }]
  }
  let list = await Product.find(q).sort({ createdAt: -1 })
  if (lowStock === 'true') list = list.filter(p => p.stock <= p.minStock)
  res.json(list.map(p => p.toJSON()))
})

// POST /api/products
router.post('/', requireRole('owner', 'manager'), async (req, res, next) => {
  try {
    const { name, sku, price } = req.body
    if (!name || !sku || price == null) {
      return res.status(400).json({ error: 'name, sku, price kerak' })
    }
    const exists = await Product.findOne({ sku })
    if (exists) return res.status(409).json({ error: 'Bu SKU allaqachon mavjud' })
    const p = await Product.create({ ...req.body })
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `yangi mahsulot qo'shdi: ${p.name}` })
    res.status(201).json(p.toJSON())
  } catch (err) { next(err) }
})

// PATCH /api/products/:id
router.patch('/:id', requireRole('owner', 'manager'), async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
  if (!p) return res.status(404).json({ error: 'Topilmadi' })
  res.json(p.toJSON())
})

// DELETE /api/products/:id
router.delete('/:id', requireRole('owner', 'manager'), async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id)
  if (!p) return res.status(404).json({ error: 'Topilmadi' })
  await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `mahsulotni o'chirdi: ${p.name}` })
  res.json({ ok: true })
})

export default router
