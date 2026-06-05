import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import Staff from '../models/Staff.js'

export function signToken(staff) {
  return jwt.sign(
    { sub: staff.id, role: staff.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Avtorizatsiya tokeni kerak' })
    }

    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      return res.status(401).json({ error: "Yaroqsiz yoki muddati o'tgan token" })
    }

    if (!payload?.sub || !mongoose.isValidObjectId(payload.sub)) {
      return res.status(401).json({ error: 'Yaroqsiz token (id format)' })
    }

    const staff = await Staff.findById(payload.sub)
    if (!staff || !staff.isActive) {
      return res.status(401).json({ error: 'Xodim topilmadi yoki bloklangan' })
    }
    req.staff = staff
    next()
  } catch (err) {
    console.error('requireAuth error:', err)
    return res.status(401).json({ error: 'Avtorizatsiya xatosi' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staff) return res.status(401).json({ error: 'Autentifikatsiya kerak' })
    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({ error: `Ruxsat yo'q (kerak: ${roles.join(' yoki ')})` })
    }
    next()
  }
}
