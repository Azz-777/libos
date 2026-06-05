import { Router } from 'express'
import Sale from '../models/Sale.js'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import Staff from '../models/Staff.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
const startOfMonth = () => { const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d }

// GET /api/stats/overview
router.get('/overview', async (req, res) => {
  const completed = { status: 'completed' }
  const [todaySales, monthSales, allCompleted, customers, products, lowStock] = await Promise.all([
    Sale.find({ ...completed, createdAt: { $gte: startOfToday() } }),
    Sale.find({ ...completed, createdAt: { $gte: startOfMonth() } }),
    Sale.find(completed),
    Customer.countDocuments(),
    Product.countDocuments(),
    Product.find().then(list => list.filter(p => p.stock <= p.minStock).length),
  ])

  const sum = (arr) => arr.reduce((a, s) => a + s.total, 0)
  const todayRevenue = sum(todaySales)
  const monthRevenue = sum(monthSales)
  const totalRevenue = sum(allCompleted)

  res.json({
    todayRevenue,
    todaySalesCount: todaySales.length,
    monthRevenue,
    totalRevenue,
    salesCount: allCompleted.length,
    avgCheck: allCompleted.length ? Math.round(totalRevenue / allCompleted.length) : 0,
    customers,
    products,
    lowStock,
  })
})

// GET /api/stats/daily?days=14
router.get('/daily', async (req, res) => {
  const days = Math.min(Number(req.query.days) || 14, 60)
  const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - days + 1)
  const sales = await Sale.find({ status: 'completed', createdAt: { $gte: from } })

  const buckets = {}
  for (let i = 0; i < days; i++) {
    const d = new Date(from); d.setDate(from.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    buckets[key] = { date: key, revenue: 0, count: 0 }
  }
  for (const s of sales) {
    const key = new Date(s.createdAt).toISOString().slice(0, 10)
    if (buckets[key]) { buckets[key].revenue += s.total; buckets[key].count += 1 }
  }
  res.json(Object.values(buckets))
})

// GET /api/stats/top-products
router.get('/top-products', async (req, res) => {
  const sales = await Sale.find({ status: 'completed' })
  const map = {}
  for (const s of sales) {
    for (const it of s.items) {
      const k = it.productName
      if (!map[k]) map[k] = { name: k, qty: 0, revenue: 0 }
      map[k].qty += it.quantity
      map[k].revenue += it.total
    }
  }
  res.json(Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8))
})

// GET /api/stats/by-category
router.get('/by-category', async (req, res) => {
  const [sales, products] = await Promise.all([
    Sale.find({ status: 'completed' }),
    Product.find(),
  ])
  const skuToCat = {}
  for (const p of products) skuToCat[p.sku] = p.categoryName || p.category
  const map = {}
  for (const s of sales) {
    for (const it of s.items) {
      const cat = skuToCat[it.sku] || 'Boshqa'
      map[cat] = (map[cat] || 0) + it.total
    }
  }
  res.json(Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
})

// GET /api/stats/by-payment
router.get('/by-payment', async (req, res) => {
  const sales = await Sale.find({ status: 'completed' })
  const labels = { naqd: 'Naqd', karta: 'Plastik karta', click: 'Click', payme: 'Payme' }
  const map = {}
  for (const s of sales) {
    const k = labels[s.paymentMethod] || s.paymentMethod
    map[k] = (map[k] || 0) + s.total
  }
  res.json(Object.entries(map).map(([name, value]) => ({ name, value })))
})

// GET /api/stats/top-cashiers
router.get('/top-cashiers', async (req, res) => {
  const [sales, staff] = await Promise.all([
    Sale.find({ status: 'completed' }),
    Staff.find(),
  ])
  const map = {}
  for (const s of sales) {
    const k = s.cashierName || '—'
    if (!map[k]) map[k] = { name: k, revenue: 0, count: 0 }
    map[k].revenue += s.total
    map[k].count += 1
  }
  res.json(Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 6))
})

// GET /api/stats/tiers
router.get('/tiers', async (req, res) => {
  const customers = await Customer.find()
  const labels = { bronze: 'Bronza', silver: 'Kumush', gold: 'Oltin', platinum: 'Platina' }
  const map = { Bronza: 0, Kumush: 0, Oltin: 0, Platina: 0 }
  for (const c of customers) map[labels[c.tier]] += 1
  res.json(Object.entries(map).map(([name, value]) => ({ name, value })))
})

export default router
