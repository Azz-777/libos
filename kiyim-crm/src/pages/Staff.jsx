import { useEffect, useState } from 'react'
import { Search, Plus, Pencil, Trash2, UserCog, Mail, Phone, Lock } from 'lucide-react'
import { Staff } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { som, initials } from '../utils/format.js'
import { ROLES } from '../config.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const blank = { name: '', email: '', password: '', role: 'cashier', phone: '', branch: "Markaziy do'kon", position: '', salary: '', color: '#6366f1', isActive: true }
const PALETTE = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']

export default function StaffPage() {
  const { can, user } = useAuth()
  const toast = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [editing, setEditing] = useState(null)

  const load = () => Staff.list({ search, role }).then(setList).catch(() => {})
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [search, role])

  const save = async (data) => {
    try {
      const payload = { ...data, salary: Number(data.salary) || 0 }
      if (data.id) await Staff.update(data.id, payload)
      else await Staff.create(payload)
      toast.success('Saqlandi'); setEditing(null); load()
    } catch (err) { toast.error(err.message) }
  }
  const remove = async (s) => {
    if (!confirm(`"${s.name}" o'chirilsinmi?`)) return
    try { await Staff.remove(s.id); toast.success("O'chirildi"); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Xodimlar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Jamoa va kirish huquqlari</p>
        </div>
        {can('owner') && <button onClick={() => setEditing(blank)} className="btn-primary"><Plus size={18} /> Xodim qo'shish</button>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ism yoki email..." className="input pl-10" />
        </div>
        <select value={role} onChange={e => setRole(e.target.value)} className="input sm:w-40">
          <option value="all">Barcha rol</option>
          {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {list.length === 0 ? <EmptyState icon={UserCog} title="Xodimlar topilmadi" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(s => (
            <div key={s.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl grid place-items-center text-white font-bold shrink-0" style={{ background: s.color }}>{initials(s.name)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">{s.name} {s.id === user.id && <span className="text-xs text-slate-400">(siz)</span>}</p>
                  <p className="text-xs text-slate-400">{s.position || ROLES[s.role]?.label}</p>
                </div>
                <span className={`chip ${ROLES[s.role]?.color}`}>{ROLES[s.role]?.label}</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-500">
                <p className="flex items-center gap-1.5 truncate"><Mail size={12} /> {s.email}</p>
                <p className="flex items-center gap-1.5"><Phone size={12} /> {s.phone || '—'}</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span className="text-sm font-semibold text-slate-600">{s.salary ? som(s.salary) : '—'}</span>
                {can('owner') && (
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600"><Pencil size={15} /></button>
                    {s.id !== user.id && <button onClick={() => remove(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={15} /></button>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <StaffForm staff={editing} onClose={() => setEditing(null)} onSave={save} />
    </div>
  )
}

function StaffForm({ staff, onClose, onSave }) {
  const [form, setForm] = useState(blank)
  useEffect(() => { if (staff) setForm({ ...blank, ...staff, password: '' }) }, [staff])
  if (!staff) return null
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <Modal open={!!staff} onClose={onClose} title={staff.id ? 'Xodimni tahrirlash' : 'Yangi xodim'}
      footer={<>
        <button onClick={onClose} className="btn-ghost">Bekor</button>
        <button onClick={() => onSave(form)} className="btn-primary">Saqlash</button>
      </>}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2"><label className="label">F.I.Sh *</label><input className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label className="label">Email *</label><input className="input" value={form.email} onChange={e => set('email', e.target.value)} /></div>
        <div><label className="label">Telefon</label><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div>
          <label className="label flex items-center gap-1"><Lock size={11} /> Parol {staff.id && <span className="text-slate-300 font-normal">(o'zgartirmasangiz bo'sh qoldiring)</span>}</label>
          <input type="password" className="input" value={form.password} onChange={e => set('password', e.target.value)} placeholder={staff.id ? '••••••' : 'Kamida 6 belgi'} />
        </div>
        <div><label className="label">Rol *</label>
          <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
            {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div><label className="label">Lavozim</label><input className="input" value={form.position} onChange={e => set('position', e.target.value)} /></div>
        <div><label className="label">Maosh (so'm)</label><input type="number" className="input" value={form.salary} onChange={e => set('salary', e.target.value)} /></div>
        <div className="sm:col-span-2">
          <label className="label">Rang</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map(c => <button key={c} type="button" onClick={() => set('color', c)}
              className={`h-8 w-8 rounded-lg transition ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} style={{ background: c }} />)}
          </div>
        </div>
      </div>
    </Modal>
  )
}
