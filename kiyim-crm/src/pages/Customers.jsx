import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, Users, Phone, Star, Gift } from 'lucide-react'
import { Customers } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { som, num, initials, date } from '../utils/format.js'
import { TIERS } from '../config.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const blank = { fullName: '', phone: '', email: '', gender: 'male', city: 'Toshkent', notes: '', status: 'active' }

export default function CustomersPage() {
  const { can } = useAuth()
  const toast = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState('all')
  const [editing, setEditing] = useState(null)

  const load = () => Customers.list({ search, tier }).then(setList).catch(() => {})
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [search, tier])

  const save = async (data) => {
    try {
      if (data.id) await Customers.update(data.id, data)
      else await Customers.create(data)
      toast.success('Saqlandi'); setEditing(null); load()
    } catch (err) { toast.error(err.message) }
  }
  const remove = async (c) => {
    if (!confirm(`"${c.fullName}" o'chirilsinmi?`)) return
    try { await Customers.remove(c.id); toast.success("O'chirildi"); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Mijozlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Sodiq mijozlar bazasi va bonus ballari</p>
        </div>
        <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={18} /> Mijoz qo'shish</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki telefon..." className="input pl-10" />
        </div>
        <select value={tier} onChange={e => setTier(e.target.value)} className="input sm:w-44">
          <option value="all">Barcha daraja</option>
          {Object.entries(TIERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {list.length === 0 ? <EmptyState icon={Users} title="Mijozlar topilmadi" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(c => {
            const tierInfo = TIERS[c.tier]
            return (
              <div key={c.id} className="card p-4 group">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-xl grid place-items-center text-white font-bold shrink-0"
                    style={{ background: tierInfo.dot }}>{initials(c.fullName)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink truncate">{c.fullName}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={11} /> {c.phone || '—'}</p>
                  </div>
                  <span className={`chip ${tierInfo.color}`}><Star size={11} /> {tierInfo.label}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-slate-50 rounded-xl py-2">
                    <p className="text-xs text-slate-400">Xaridlar</p>
                    <p className="font-bold text-sm text-ink">{c.visitCount}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl py-2">
                    <p className="text-xs text-slate-400">Sarflagan</p>
                    <p className="font-bold text-sm text-ink">{som(c.totalSpent).replace(" so'm", '')}</p>
                  </div>
                  <div className="bg-brand-50 rounded-xl py-2">
                    <p className="text-xs text-brand-400 flex items-center justify-center gap-0.5"><Gift size={10} /> Ball</p>
                    <p className="font-bold text-sm text-brand-600">{num(c.loyaltyPoints)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{c.city} · {date(c.lastVisit)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil size={15} /></button>
                    {can('owner', 'manager') && <button onClick={() => remove(c)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CustomerForm customer={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  )
}

function CustomerForm({ customer, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (customer) setForm({ ...blank, ...customer }) }, [customer])
  if (!customer) return null
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={!!customer} onClose={onClose} title={customer.id ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
      footer={<>
        <button onClick={onClose} className="btn-ghost">Bekor</button>
        <button onClick={() => onSave(form)} className="btn-primary">Saqlash</button>
      </>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">F.I.Sh *</label><input className="input" value={form.fullName} onChange={e => set('fullName', e.target.value)} /></div>
        <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+998 90 123 45 67" /></div>
        <div><label className="label">Email</label><input className="input" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div><label className="label">Jins</label>
          <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
            <option value="male">Erkak</option><option value="female">Ayol</option><option value="other">Boshqa</option>
          </select>
        </div>
        <div><label className="label">Shahar</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">Izoh</label><textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
      </div>
    </Modal>
  )
}
