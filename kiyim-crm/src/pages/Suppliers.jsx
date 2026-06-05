import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Truck, Phone } from 'lucide-react'
import { Suppliers } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { som, initials } from '../utils/format.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const blank = { name: '', contactName: '', phone: '', email: '', city: 'Toshkent', category: '', balance: 0, status: 'active', notes: '' }

export default function SuppliersPage() {
  const { can } = useAuth()
  const toast = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  const load = () => Suppliers.list({ search }).then(setList).catch(() => {})
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [search])

  const save = async (data) => {
    try {
      const payload = { ...data, balance: Number(data.balance) || 0 }
      if (data.id) await Suppliers.update(data.id, payload)
      else await Suppliers.create(payload)
      toast.success('Saqlandi'); setEditing(null); load()
    } catch (err) { toast.error(err.message) }
  }
  const remove = async (s) => {
    if (!confirm(`"${s.name}" o'chirilsinmi?`)) return
    try { await Suppliers.remove(s.id); toast.success("O'chirildi"); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Yetkazib beruvchilar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Hamkorlar va ta'minotchilar</p>
        </div>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={18} /> Qo'shish</button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom yoki telefon..." className="input pl-10 max-w-md" />
      </div>

      {list.length === 0 ? <EmptyState icon={Truck} title="Yetkazib beruvchilar yo'q" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-teal-100 text-teal-700 grid place-items-center font-bold shrink-0">{initials(s.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.contactName || '—'} · {s.city}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil size={15} /></button>
                  {can('owner') && <button onClick={() => remove(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button>}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-1"><Phone size={13} /> {s.phone || '—'}</span>
                <span className={`font-semibold ${s.balance < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>{som(s.balance)}</span>
              </div>
              {s.category && <span className="chip bg-slate-100 text-slate-500 mt-2">{s.category}</span>}
            </div>
          ))}
        </div>
      )}

      <SupplierForm supplier={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  )
}

function SupplierForm({ supplier, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (supplier) setForm({ ...blank, ...supplier }) }, [supplier])
  if (!supplier) return null
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={!!supplier} onClose={onClose} title={supplier.id ? 'Tahrirlash' : 'Yangi yetkazib beruvchi'}
      footer={<>
        <button onClick={onClose} className="btn-ghost">Bekor</button>
        <button onClick={() => onSave(form)} className="btn-primary">Saqlash</button>
      </>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">Nomi *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="label">Mas'ul shaxs</label><input className="input" value={form.contactName} onChange={e => set('contactName', e.target.value)} /></div>
        <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div><label className="label">Email</label><input className="input" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div><label className="label">Shahar</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
        <div><label className="label">Kategoriya</label><input className="input" value={form.category} onChange={e => set('category', e.target.value)} /></div>
        <div><label className="label">Balans (so'm)</label><input type="number" className="input" value={form.balance} onChange={e => set('balance', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Izoh</label><textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      </div>
    </Modal>
  )
}
