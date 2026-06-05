import { Router } from 'express'
import Staff from '../models/Staff.js'
import Activity from '../models/Activity.js'
import { signToken, requireAuth } from '../middleware/auth.js'

const router = Router()

const logSilent = (data) => Activity.create(data).catch(err =>
  console.warn('Activity log failed:', err.message)
)

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email va parol kerak' })
    }

    const staff = await Staff.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!staff) return res.status(401).json({ error: "Email yoki parol noto'g'ri" })

    const ok = await staff.comparePassword(password)
    if (!ok) return res.status(401).json({ error: "Email yoki parol noto'g'ri" })

    if (!staff.isActive) return res.status(403).json({ error: 'Hisobingiz bloklangan' })

    const token = signToken(staff)
    logSilent({ userId: staff._id, userName: staff.name, action: 'tizimga kirdi' })

    res.json({ token, user: staff.toJSON() })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.staff.toJSON() })
})

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res) => {
  logSilent({ userId: req.staff._id, userName: req.staff.name, action: 'tizimdan chiqdi' })
  res.json({ ok: true })
})

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {}
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Yangi parol kamida 6 belgi bo'lishi kerak" })
    }
    const staff = await Staff.findById(req.staff._id).select('+password')
    const ok = await staff.comparePassword(oldPassword)
    if (!ok) return res.status(401).json({ error: "Joriy parol noto'g'ri" })
    staff.password = newPassword
    await staff.save()
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
