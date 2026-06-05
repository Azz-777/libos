import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDb } from './db.js'
import { autoSeedIfEmpty } from './seed.js'

import authRoutes from './routes/auth.js'
import staffRoutes from './routes/staff.js'
import customersRoutes from './routes/customers.js'
import productsRoutes from './routes/products.js'
import salesRoutes from './routes/sales.js'
import suppliersRoutes from './routes/suppliers.js'
import activitiesRoutes from './routes/activities.js'
import statsRoutes from './routes/stats.js'

const {
  PORT = 3001,
  MONGODB_URI,
  CLIENT_ORIGIN = '*',
} = process.env

if (!MONGODB_URI) {
  console.error('✗ MONGODB_URI sozlanmagan.')
  process.exit(1)
}

const app = express()
app.use(cors({ origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_, res) => res.json({ ok: true, app: 'LIBOS CRM', ts: new Date().toISOString() }))

app.use('/api/auth',       authRoutes)
app.use('/api/staff',      staffRoutes)
app.use('/api/customers',  customersRoutes)
app.use('/api/products',   productsRoutes)
app.use('/api/sales',      salesRoutes)
app.use('/api/suppliers',  suppliersRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/stats',      statsRoutes)

app.use('/api', (_, res) => res.status(404).json({ error: 'Topilmadi' }))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server xatosi' })
})

async function start() {
  await connectDb(MONGODB_URI)
  await autoSeedIfEmpty()
  app.listen(PORT, () => {
    console.log(`✓ LIBOS CRM backend ishlamoqda: http://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('✗ Ishga tushmadi:', err.message)
  process.exit(1)
})
