/**
 * LIBOS CRM — chakana kiyim do'koni uchun demo ma'lumotlar.
 *   CLI:  `npm run seed`   — tozalab qaytadan to'ldiradi
 *   Auto: server.js'dan   — faqat bo'sh bo'lsa to'ldiradi
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDb } from './db.js'
import Staff from './models/Staff.js'
import Customer from './models/Customer.js'
import Product from './models/Product.js'
import Sale from './models/Sale.js'
import Supplier from './models/Supplier.js'
import Activity from './models/Activity.js'

const CITIES = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona", 'Qarshi']
const FIRST_M = ['Akmal', 'Bekzod', 'Dilshod', 'Rustam', 'Sardor', 'Bobur', 'Jasur', 'Kamol', 'Oybek', 'Aziz']
const FIRST_F = ['Madina', 'Nigora', 'Aziza', 'Charos', 'Feruza', 'Lola', 'Sevara', 'Dilnoza', 'Malika', 'Zarina']
const LAST = ['Karimov', 'Yusupov', 'Tursunov', 'Saidov', 'Rahimov', 'Mirzayev', 'Nazarov', 'Olimov', 'Abdullayev']

const random = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const uzPhone = () => `+998 ${random(['90', '91', '93', '94', '97', '99'])} ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`

const PALETTE = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

const CATEGORIES = [
  { id: 'tshirt', name: 'Futbolka',  range: [49000, 159000],  g: 'unisex' },
  { id: 'shirt',  name: "Ko'ylak",   range: [99000, 320000],  g: 'male'   },
  { id: 'dress',  name: "Libos",     range: [180000, 750000], g: 'female' },
  { id: 'jeans',  name: 'Jinsi',     range: [149000, 450000], g: 'unisex' },
  { id: 'jacket', name: 'Kurtka',    range: [350000, 1200000],g: 'unisex' },
  { id: 'hoodie', name: 'Hudi',      range: [159000, 420000], g: 'unisex' },
  { id: 'shoes',  name: 'Poyabzal',  range: [250000, 980000], g: 'unisex' },
  { id: 'kids',   name: 'Bolalar',   range: [59000, 280000],  g: 'kids'   },
]
const BRANDS = ['Libos', 'UrbanStyle', 'Bella', 'PrimeWear', 'Nur', 'Atlas', 'Zamin']
const COLORS = ['Qora', 'Oq', "Ko'k", 'Qizil', 'Bej', 'Yashil', 'Kulrang', 'Sariq']
const SIZES_CLOTH = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SIZES_SHOE = ['38', '39', '40', '41', '42', '43', '44']

const IMG = {
  tshirt: ['1521572163474-6864f9cf17ab', '1576566588028-4147f3842f27'],
  shirt:  ['1602810318383-e386cc2a3ccf', '1598033129183-c4f50c736f10'],
  dress:  ['1572804013309-59a88b7e92f1', '1595777457583-95e059d581b8'],
  jeans:  ['1542272604-787c3835535d', '1604176354204-9268737828e4'],
  jacket: ['1551028719-00167b16eac5', '1544022613-e87ca75a784a'],
  hoodie: ['1556821840-3a63f95609a7', '1620799140408-edc6dcb6d633'],
  shoes:  ['1542291026-7eec264c27ff', '1460353581641-37baddab0fa2'],
  kids:   ['1519238263530-99bdd11df2ea', '1471286174890-9c112ffca5b4'],
}
const imgUrl = (cat) => `https://images.unsplash.com/photo-${random(IMG[cat])}?w=500&h=500&fit=crop&auto=format`

export async function runSeed({ wipe = false } = {}) {
  if (wipe) {
    console.log('• Eski ma\'lumotlar tozalanmoqda...')
    await Promise.all([
      Staff.deleteMany({}), Customer.deleteMany({}), Product.deleteMany({}),
      Sale.deleteMany({}), Supplier.deleteMany({}), Activity.deleteMany({}),
    ])
  }

  console.log('• Xodimlar yaratilmoqda...')
  const staffSpecs = [
    { name: 'Sardor Karimov',    email: 'admin@libos.uz',    password: 'admin123',   role: 'owner',   position: "Do'kon egasi",    salary: 0 },
    { name: 'Nigora Tursunova',  email: 'manager@libos.uz',  password: 'manager123', role: 'manager', position: 'Menejer',         salary: 9_000_000 },
    { name: 'Madina Saidova',    email: 'kassir@libos.uz',   password: 'kassir123',  role: 'cashier', position: 'Bosh kassir',     salary: 5_500_000 },
    { name: 'Aziza Olimova',     email: 'kassir2@libos.uz',  password: 'kassir123',  role: 'cashier', position: 'Kassir',          salary: 4_800_000 },
    { name: 'Bekzod Mirzayev',   email: 'kassir3@libos.uz',  password: 'kassir123',  role: 'cashier', position: 'Kassir',          salary: 4_800_000 },
  ]
  const staff = await Promise.all(staffSpecs.map((s, i) =>
    Staff.create({ ...s, phone: uzPhone(), color: PALETTE[i % PALETTE.length], isActive: true })))
  const cashiers = staff.filter(s => s.role === 'cashier' || s.role === 'manager')
  console.log(`  ✓ ${staff.length} xodim`)

  console.log('• Yetkazib beruvchilar yaratilmoqda...')
  const supplierNames = ['Atlas Tekstil', 'Bella Trade', 'UrbanStyle Import', 'Zamin Fabrika', 'Nur Group']
  await Promise.all(supplierNames.map(name => Supplier.create({
    name, contactName: `${random(FIRST_M)} ${random(LAST)}`, phone: uzPhone(),
    email: `info@${name.split(' ')[0].toLowerCase()}.uz`, city: random(CITIES),
    category: random(CATEGORIES).name, balance: randomInt(-5_000_000, 12_000_000), status: 'active',
  })))
  console.log(`  ✓ ${supplierNames.length} yetkazib beruvchi`)

  console.log('• Mahsulotlar yaratilmoqda...')
  const products = []
  let sku = 1
  for (const cat of CATEGORIES) {
    for (let i = 0; i < 6; i++) {
      const price = Math.round(randomInt(cat.range[0], cat.range[1]) / 1000) * 1000
      const sizes = cat.id === 'shoes' ? SIZES_SHOE : SIZES_CLOTH
      products.push(await Product.create({
        sku: `${cat.id.toUpperCase().slice(0, 3)}-${String(sku++).padStart(4, '0')}`,
        name: `${random(BRANDS)} ${cat.name} ${random(['Pro', 'Classic', 'Premium', 'Lux', ''])}`.trim(),
        category: cat.id, categoryName: cat.name, brand: random(BRANDS),
        season: random(['all', 'summer', 'winter', 'demi']), gender: cat.g,
        sizes: [...sizes].sort(() => Math.random() - 0.5).slice(0, randomInt(3, 5)),
        colors: [...COLORS].sort(() => Math.random() - 0.5).slice(0, randomInt(2, 4)),
        price, cost: Math.round(price * 0.55),
        stock: randomInt(3, 90), minStock: 8,
        imageUrl: imgUrl(cat.id),
        description: `Sifatli ${cat.name.toLowerCase()}, qulay va zamonaviy.`,
      }))
    }
  }
  console.log(`  ✓ ${products.length} mahsulot`)

  console.log('• Mijozlar yaratilmoqda...')
  const customers = []
  for (let i = 0; i < 40; i++) {
    const gender = random(['male', 'female'])
    const name = gender === 'male' ? `${random(FIRST_M)} ${random(LAST)}` : `${random(FIRST_F)} ${random(LAST)}a`
    customers.push(await Customer.create({
      fullName: name, phone: uzPhone(), email: `${name.split(' ')[0].toLowerCase()}${i}@mail.uz`,
      gender, city: random(CITIES),
      birthday: new Date(randomInt(1975, 2005), randomInt(0, 11), randomInt(1, 28)),
      status: random(['active', 'active', 'active', 'inactive']),
    }))
  }
  console.log(`  ✓ ${customers.length} mijoz`)

  console.log('• Savdolar yaratilmoqda...')
  let receipt = 100001
  for (let i = 0; i < 120; i++) {
    const hasCustomer = Math.random() > 0.35
    const customer = hasCustomer ? random(customers) : null
    const cashier = random(cashiers)
    const itemCount = randomInt(1, 4)
    const items = []
    let subtotal = 0
    const used = new Set()
    for (let j = 0; j < itemCount; j++) {
      let p
      do { p = random(products) } while (used.has(p.id))
      used.add(p.id)
      const qty = randomInt(1, 3)
      const total = p.price * qty
      items.push({
        productId: p._id, productName: p.name, sku: p.sku,
        size: random(p.sizes.length ? p.sizes : ['M']), color: random(p.colors.length ? p.colors : ['Qora']),
        price: p.price, quantity: qty, total,
      })
      subtotal += total
    }
    const discount = Math.random() > 0.75 ? Math.round(subtotal * 0.1 / 1000) * 1000 : 0
    const total = subtotal - discount
    const pointsEarned = Math.floor(total / 100_000)
    const createdAt = new Date(Date.now() - randomInt(0, 45) * 86_400_000 - randomInt(0, 86_400_000))
    const status = Math.random() > 0.95 ? 'refunded' : 'completed'

    await Sale.create({
      receiptNumber: `CHEK-${receipt++}`,
      customerId: customer?._id || null,
      customerName: customer?.fullName || 'Tasodifiy mijoz',
      cashierId: cashier._id, cashierName: cashier.name,
      items, subtotal, discount, total,
      paymentMethod: random(['naqd', 'naqd', 'karta', 'click', 'payme']),
      pointsEarned, pointsRedeemed: 0, status, createdAt,
    })

    if (customer && status === 'completed') {
      customer.totalSpent += total
      customer.visitCount += 1
      customer.loyaltyPoints += pointsEarned
      customer.lastVisit = createdAt
      customer.recomputeTier()
      await customer.save()
    }
  }
  console.log('  ✓ 120 savdo')

  console.log('• Faollik jurnali...')
  const actions = ['tizimga kirdi', 'yangi savdo amalga oshirdi', 'mahsulot qo\'shdi', 'mijoz ma\'lumotini yangiladi', 'narxni o\'zgartirdi']
  for (let i = 0; i < 25; i++) {
    const u = random(staff)
    await Activity.create({
      userId: u._id, userName: u.name, action: random(actions),
      timestamp: new Date(Date.now() - randomInt(0, 10) * 86_400_000),
    })
  }

  console.log('\n✓ Seed tugadi')
  console.log('\nDemo akkountlar:')
  console.log('  admin@libos.uz   / admin123    (egasi)')
  console.log('  manager@libos.uz / manager123  (menejer)')
  console.log('  kassir@libos.uz  / kassir123   (kassir)')
}

export async function autoSeedIfEmpty() {
  const count = await Staff.countDocuments()
  if (count > 0) {
    console.log(`• Bazada ${count} xodim bor — seed o'tkazib yuborildi`)
    return
  }
  console.log('• Baza bo\'sh — avtomatik seed ishga tushmoqda...')
  await runSeed({ wipe: false })
}

const isMain = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`
if (isMain) {
  ;(async () => {
    try {
      await connectDb(process.env.MONGODB_URI)
      await runSeed({ wipe: true })
      await mongoose.disconnect()
      process.exit(0)
    } catch (err) {
      console.error('✗ Seed xato:', err)
      process.exit(1)
    }
  })()
}
