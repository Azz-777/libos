import { Router } from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import Activity from '../models/Activity.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// GET /api/sales — kassir faqat o'z savdolarini ko'radi
router.get('/', async (req, res) => {
  const { search, status, payment } = req.query
  const q = {}
  if (req.staff.role === 'cashier') q.cashierId = req.staff._id
  if (status && status !== 'all') q.status = status
  if (payment && payment !== 'all') q.paymentMethod = payment
  if (search) {
    const rx = new RegExp(search, 'i')
    q.$or = [{ receiptNumber: rx }, { customerName: rx }]
  }
  const list = await Sale.find(q).sort({ createdAt: -1 }).limit(500)
  res.json(list.map(s => s.toJSON()))
})

// POST /api/sales — yangi savdo (kassa)
router.post('/', async (req, res, next) => {
  try {
    const { customerId, items, paymentMethod = 'naqd', discount = 0, pointsRedeemed = 0, notes = '' } = req.body
    if (!items?.length) return res.status(400).json({ error: 'Savatcha bo\'sh' })

    let customer = null
    if (customerId) {
      customer = await Customer.findById(customerId)
      if (!customer) return res.status(404).json({ error: 'Mijoz topilmadi' })
    }

    const enriched = []
    let subtotal = 0
    for (const it of items) {
      const p = await Product.findById(it.productId)
      if (!p) return res.status(404).json({ error: `Mahsulot topilmadi: ${it.productId}` })
      const qty = Number(it.quantity) || 1
      if (p.stock < qty) {
        return res.status(400).json({ error: `"${p.name}" omborda yetarli emas (mavjud: ${p.stock})` })
      }
      const line = {
        productId: p._id, productName: p.name, sku: p.sku,
        size: it.size || '', color: it.color || '',
        price: p.price, quantity: qty, total: p.price * qty,
      }
      enriched.push(line)
      subtotal += line.total
      p.stock = Math.max(0, p.stock - qty)
      await p.save()
    }

    const redeem = Math.min(Number(pointsRedeemed) || 0, customer?.loyaltyPoints || 0)
    const total = Math.max(0, subtotal - (Number(discount) || 0) - redeem)
    const pointsEarned = Math.floor(total / 100_000) // har 100 ming so'mga 1 ball

    const count = await Sale.countDocuments()
    const receiptNumber = `CHEK-${100000 + count + 1}`

    const sale = await Sale.create({
      receiptNumber,
      customerId: customer?._id || null,
      customerName: customer?.fullName || 'Tasodifiy mijoz',
      cashierId: req.staff._id,
      cashierName: req.staff.name,
      items: enriched,
      subtotal,
      discount: Number(discount) || 0,
      total,
      paymentMethod,
      pointsEarned,
      pointsRedeemed: redeem,
      notes,
      status: 'completed',
    })

    if (customer) {
      customer.totalSpent += total
      customer.visitCount += 1
      customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - redeem + pointsEarned)
      customer.lastVisit = new Date()
      customer.recomputeTier()
      await customer.save()
    }

    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `yangi savdo: ${sale.receiptNumber}` })
    res.status(201).json(sale.toJSON())
  } catch (err) { next(err) }
})

// POST /api/sales/:id/refund — qaytarish (mahsulotni omborga qaytaradi)
router.post('/:id/refund', requireRole('owner', 'manager'), async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
    if (!sale) return res.status(404).json({ error: 'Topilmadi' })
    if (sale.status === 'refunded') return res.status(400).json({ error: 'Allaqachon qaytarilgan' })

    for (const it of sale.items) {
      const p = await Product.findById(it.productId)
      if (p) { p.stock += it.quantity; await p.save() }
    }
    sale.status = 'refunded'
    await sale.save()

    if (sale.customerId) {
      const customer = await Customer.findById(sale.customerId)
      if (customer) {
        customer.totalSpent = Math.max(0, customer.totalSpent - sale.total)
        customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - sale.pointsEarned)
        customer.recomputeTier()
        await customer.save()
      }
    }
    await Activity.create({ userId: req.staff._id, userName: req.staff.name, action: `savdo qaytarildi: ${sale.receiptNumber}` })
    res.json(sale.toJSON())
  } catch (err) { next(err) }
})

export default router
