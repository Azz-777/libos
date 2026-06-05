import { Router } from 'express'
import Staff from '../models/Staff.js'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/staff
router.get('/', requireRole('owner', 'manager'), async (req, res) => {
  const { role, search } = req.query
  const q = {}
  if (role && role !== 'all') q.role = role
  if (search) {
    const rx = new RegExp(search, 'i')
    q.$or = [{ name: rx }, { email: rx }, { position: rx }]
  }
  const list = await Staff.find(q).sort({ createdAt: -1 })
  res.json(list.map(s => s.toJSON()))
})

// POST /api/staff — faqat egasi yangi xodim qo'shadi
router.post('/', requireRole('owner'), async (req, res, next) => {
  try {
    const { name, email, password, role, phone, branch, position, salary, color } = req.body
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, role kerak' })
    }
    const exists = await Staff.findOne({ email: email.toLowerCase().trim() })
    if (exists) return res.status(409).json({ error: 'Bu email allaqachon mavjud' })

    const staff = await Staff.create({ name, email, password, role, phone, branch, position, salary, color })
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `yangi xodim qo'shdi: ${staff.name}` })
    res.status(201).json(staff.toJSON())
  } catch (err) { next(err) }
})

// PATCH /api/staff/:id
router.patch('/:id', requireRole('owner'), async (req, res, next) => {
  try {
    const update = { ...req.body }
    if (!update.password) delete update.password
    const staff = await Staff.findById(req.params.id).select('+password')
    if (!staff) return res.status(404).json({ error: 'Topilmadi' })
    Object.assign(staff, update)
    await staff.save()
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `xodimni tahrirladi: ${staff.name}` })
    res.json(staff.toJSON())
  } catch (err) { next(err) }
})

// DELETE /api/staff/:id
router.delete('/:id', requireRole('owner'), async (req, res) => {
  if (String(req.params.id) === String(req.staff._id)) {
    return res.status(400).json({ error: "O'zingizni o'chira olmaysiz" })
  }
  const staff = await Staff.findByIdAndDelete(req.params.id)
  if (!staff) return res.status(404).json({ error: 'Topilmadi' })
  await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `xodimni o'chirdi: ${staff.name}` })
  res.json({ ok: true })
})

export default router
