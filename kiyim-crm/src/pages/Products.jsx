import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Shirt, AlertTriangle } from 'lucide-react'
import { Products } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { som } from '../utils/format.js'
import { CATEGORIES, SIZES, COLORS, SEASONS } from '../data/categories.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const CAT_NAME = Object.fromEntries(CATEGORIES.map(c => [c.id, c.name]))
const blank = { name: '', sku: '', category: 'tshirt', brand: '', price: '', cost: '', stock: '', minStock: 5, season: 'all', gender: 'unisex', sizes: [], colors: [], imageUrl: '', description: '' }

export default function ProductsPage() {
  const { can } = useAuth()
  const toast = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [lowOnly, setLowOnly] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = () => Products.list({ search, category: cat, lowStock: lowOnly || undefined }).then(setList).catch(() => {})
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [search, cat, lowOnly])

  const save = async (data) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price), cost: Number(data.cost) || 0,
        stock: Number(data.stock) || 0, minStock: Number(data.minStock) || 5,
        categoryName: CAT_NAME[data.category],
      }
      if (data.id) await Products.update(data.id, payload)
      else await Products.create(payload)
      toast.success('Saqlandi'); setEditing(null); load()
    } catch (err) { toast.error(err.message) }
  }

  const remove = async (p) => {
    if (!confirm(`"${p.name}" o'chirilsinmi?`)) return
    try { await Products.remove(p.id); toast.success("O'chirildi"); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Mahsulotlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Ombor va assortiment</p>
        </div>
        {can('owner', 'manager') && <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={18} /> Mahsulot qo'shish</button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom, SKU yoki brend..." className="input pl-10" />
        </div>
        <select value={cat} onChange={e => setCat(e.target.value)} className="input sm:w-44">
          <option value="all">Barcha kategoriya</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={() => setLowOnly(v => !v)} className={`btn ${lowOnly ? 'bg-amber-100 text-amber-700' : 'btn-ghost'}`}>
          <AlertTriangle size={16} /> Kam qolgan
        </button>
      </div>

      {list.length === 0 ? <EmptyState icon={Shirt} title="Mahsulot topilmadi" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map(p => (
            <div key={p.id} className="card overflow-hidden group">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  : <div className="w-full h-full grid place-items-center text-slate-300"><Shirt size={36} /></div>}
                {p.stock <= p.minStock && <span className="absolute top-2 left-2 chip bg-amber-500 text-white text-[10px]">Kam: {p.stock}</span>}
                {can('owner', 'manager') && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setEditing(p)} className="h-7 w-7 grid place-items-center rounded-lg bg-white/90 text-slate-600 hover:text-brand-600"><Pencil size={14} /></button>
                    <button onClick={() => remove(p)} className="h-7 w-7 grid place-items-center rounded-lg bg-white/90 text-slate-600 hover:text-rose-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-400">{p.sku} · {CAT_NAME[p.category] || p.category}</p>
                <p className="font-semibold text-sm text-ink truncate mt-0.5">{p.name}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="font-bold text-brand-600">{som(p.price)}</span>
                  <span className="text-xs text-slate-400">{p.stock} dona</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductForm product={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  )
}

function ProductForm({ product, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (product) setForm({ ...blank, ...product }) }, [product])
  if (!product) return null
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }))

  return (
    <Modal open={!!product} onClose={onClose} title={product.id ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'} size="lg"
      footer={<>
        <button onClick={onClose} className="btn-ghost">Bekor</button>
        <button onClick={() => onSave(form)} className="btn-primary">Saqlash</button>
      </>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">Nomi *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="label">SKU *</label><input className="input" value={form.sku} onChange={e => set('sku', e.target.value)} /></div>
        <div><label className="label">Brend</label><input className="input" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
        <div><label className="label">Kategoriya</label>
          <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="label">Mavsum</label>
          <select className="input" value={form.season} onChange={e => set('season', e.target.value)}>
            {SEASONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div><label className="label">Narx (so'm) *</label><input type="number" className="input" value={form.price} onChange={e => set('price', e.target.value)} /></div>
        <div><label className="label">Tannarx</label><input type="number" className="input" value={form.cost} onChange={e => set('cost', e.target.value)} /></div>
        <div><label className="label">Ombordagi soni</label><input type="number" className="input" value={form.stock} onChange={e => set('stock', e.target.value)} /></div>
        <div><label className="label">Min. qoldiq</label><input type="number" className="input" value={form.minStock} onChange={e => set('minStock', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Rasm URL</label><input className="input" value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." /></div>
        <div className="sm:col-span-2">
          <label className="label">O'lchamlar</label>
          <div className="flex flex-wrap gap-1.5">
            {SIZES.map(s => <button key={s} type="button" onClick={() => toggle('sizes', s)}
              className={`chip border ${form.sizes.includes(s) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>{s}</button>)}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Ranglar</label>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map(c => <button key={c} type="button" onClick={() => toggle('colors', c)}
              className={`chip border ${form.colors.includes(c) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-slate-200 text-slate-600'}`}>{c}</button>)}
          </div>
        </div>
      </div>
    </Modal>
  )
}
