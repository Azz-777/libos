import { useEffect, useMemo, useState } from 'react'
import {
  Search, Plus, Minus, Trash2, ShoppingBag, X, UserPlus, Check, Loader2,
} from 'lucide-react'
import { Products, Customers, Sales } from '../api/index.js'
import { useToast } from '../context/ToastContext.jsx'
import { som } from '../utils/format.js'
import { CATEGORIES, PAYMENTS } from '../data/categories.js'
import Modal from '../components/Modal.jsx'

export default function POS() {
  const toast = useToast()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [cart, setCart] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [payment, setPayment] = useState('naqd')
  const [discount, setDiscount] = useState('')
  const [busy, setBusy] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [pickProduct, setPickProduct] = useState(null)

  const load = () => {
    Products.list().then(setProducts).catch(() => {})
    Customers.list().then(setCustomers).catch(() => {})
  }
  useEffect(load, [])

  const filtered = useMemo(() => products.filter(p => {
    if (cat !== 'all' && p.category !== cat) return false
    if (search && !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [products, search, cat])

  const addToCart = (p, size, color) => {
    const key = `${p.id}-${size}-${color}`
    setCart(c => {
      const ex = c.find(i => i.key === key)
      if (ex) return c.map(i => i.key === key ? { ...i, quantity: Math.min(i.quantity + 1, p.stock) } : i)
      return [...c, { key, productId: p.id, name: p.name, price: p.price, stock: p.stock, size, color, quantity: 1 }]
    })
  }

  const openProduct = (p) => {
    if (p.stock <= 0) { toast.error('Mahsulot omborda tugagan'); return }
    if ((p.sizes?.length || 0) <= 1 && (p.colors?.length || 0) <= 1) {
      addToCart(p, p.sizes?.[0] || '', p.colors?.[0] || '')
    } else {
      setPickProduct(p)
    }
  }

  const setQty = (key, delta) => setCart(c => c.map(i =>
    i.key === key ? { ...i, quantity: Math.max(1, Math.min(i.quantity + delta, i.stock)) } : i))
  const removeItem = (key) => setCart(c => c.filter(i => i.key !== key))

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0)
  const disc = Number(discount) || 0
  const total = Math.max(0, subtotal - disc)

  const checkout = async () => {
    if (!cart.length) return
    setBusy(true)
    try {
      const sale = await Sales.create({
        customerId: customerId || undefined,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, size: i.size, color: i.color })),
        paymentMethod: payment,
        discount: disc,
      })
      setReceipt(sale)
      setCart([]); setDiscount(''); setCustomerId('')
      load()
      toast.success('Savdo muvaffaqiyatli yakunlandi!')
    } catch (err) {
      toast.error(err.message || 'Xatolik')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-5 items-start">
      {/* Products */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Kassa</h1>
          <p className="text-slate-500 text-sm mt-0.5">Mahsulotni tanlang va savatga qo'shing</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot yoki SKU qidirish..." className="input pl-10" />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)} className="input sm:w-44">
            <option value="all">Barcha kategoriya</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(p => (
            <button key={p.id} onClick={() => openProduct(p)} disabled={p.stock <= 0}
              className="card overflow-hidden text-left hover:shadow-card transition group disabled:opacity-50">
              <div className="aspect-square bg-slate-100 overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
                  : <div className="w-full h-full grid place-items-center text-slate-300"><ShoppingBag size={32} /></div>}
              </div>
              <div className="p-2.5">
                <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-brand-600">{som(p.price)}</span>
                  <span className={`text-[11px] ${p.stock <= p.minStock ? 'text-rose-500' : 'text-slate-400'}`}>{p.stock} dona</span>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-10 text-sm">Mahsulot topilmadi</p>}
        </div>
      </div>

      {/* Cart */}
      <div className="card p-4 lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-ink flex items-center gap-2"><ShoppingBag size={18} className="text-brand-500" /> Savatcha</h3>
          {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs text-rose-500 hover:underline">Tozalash</button>}
        </div>

        <div className="space-y-2 max-h-[40vh] overflow-y-auto -mr-1 pr-1">
          {cart.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Savatcha bo'sh</p>}
          {cart.map(i => (
            <div key={i.key} className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{i.name}</p>
                <p className="text-xs text-slate-400">
                  {[i.size, i.color].filter(Boolean).join(' · ')} {(i.size || i.color) && '·'} {som(i.price)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setQty(i.key, -1)} className="h-6 w-6 grid place-items-center rounded-md bg-white border border-slate-200 hover:bg-slate-100"><Minus size={13} /></button>
                <span className="w-6 text-center text-sm font-semibold">{i.quantity}</span>
                <button onClick={() => setQty(i.key, 1)} className="h-6 w-6 grid place-items-center rounded-md bg-white border border-slate-200 hover:bg-slate-100"><Plus size={13} /></button>
              </div>
              <button onClick={() => removeItem(i.key)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3">
          <div>
            <label className="label">Mijoz (ixtiyoriy)</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="input">
              <option value="">Tasodifiy mijoz</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.fullName} · {c.phone}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">To'lov</label>
              <select value={payment} onChange={e => setPayment(e.target.value)} className="input">
                {PAYMENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Chegirma</label>
              <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" className="input" />
            </div>
          </div>

          <div className="space-y-1 text-sm pt-1">
            <div className="flex justify-between text-slate-500"><span>Oraliq</span><span>{som(subtotal)}</span></div>
            {disc > 0 && <div className="flex justify-between text-rose-500"><span>Chegirma</span><span>−{som(disc)}</span></div>}
            <div className="flex justify-between font-extrabold text-lg text-ink pt-1"><span>Jami</span><span>{som(total)}</span></div>
          </div>

          <button onClick={checkout} disabled={!cart.length || busy} className="btn-primary w-full py-3 text-base">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <><Check size={18} /> Savdoni yakunlash</>}
          </button>
        </div>
      </div>

      {/* Variant picker */}
      <Modal open={!!pickProduct} onClose={() => setPickProduct(null)} title={pickProduct?.name} size="sm">
        {pickProduct && <VariantPicker product={pickProduct} onAdd={(s, c) => { addToCart(pickProduct, s, c); setPickProduct(null) }} />}
      </Modal>

      {/* Receipt */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Chek" size="sm"
        footer={<button onClick={() => setReceipt(null)} className="btn-primary">Yopish</button>}>
        {receipt && (
          <div className="text-sm">
            <div className="text-center pb-3 border-b border-dashed border-slate-200">
              <p className="font-extrabold text-lg">LIBOS</p>
              <p className="text-slate-400 text-xs">{receipt.receiptNumber}</p>
            </div>
            <div className="py-3 space-y-1.5 border-b border-dashed border-slate-200">
              {receipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-600">{it.productName} ×{it.quantity}</span>
                  <span className="font-medium">{som(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="py-3 space-y-1">
              <div className="flex justify-between text-slate-500"><span>Oraliq</span><span>{som(receipt.subtotal)}</span></div>
              {receipt.discount > 0 && <div className="flex justify-between text-rose-500"><span>Chegirma</span><span>−{som(receipt.discount)}</span></div>}
              <div className="flex justify-between font-extrabold text-base"><span>Jami</span><span>{som(receipt.total)}</span></div>
              {receipt.pointsEarned > 0 && <p className="text-emerald-600 text-xs text-center pt-2">+{receipt.pointsEarned} bonus ball qo'shildi 🎉</p>}
            </div>
            <p className="text-center text-slate-400 text-xs">Xaridingiz uchun rahmat!</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

function VariantPicker({ product, onAdd }) {
  const [size, setSize] = useState(product.sizes?.[0] || '')
  const [color, setColor] = useState(product.colors?.[0] || '')
  return (
    <div className="space-y-4">
      {product.sizes?.length > 0 && (
        <div>
          <label className="label">O'lcham</label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`chip border ${size === s ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {product.colors?.length > 0 && (
        <div>
          <label className="label">Rang</label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`chip border ${color === c ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>{c}</button>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => onAdd(size, color)} className="btn-primary w-full"><Plus size={16} /> Savatga qo'shish</button>
    </div>
  )
}
