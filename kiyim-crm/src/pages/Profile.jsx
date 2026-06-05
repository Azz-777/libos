import { useState } from 'react'
import { Lock, Save, User, Mail, Phone, Briefcase } from 'lucide-react'
import { Auth } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { ROLES } from '../config.js'
import { initials } from '../utils/format.js'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [oldP, setOldP] = useState('')
  const [newP, setNewP] = useState('')
  const [busy, setBusy] = useState(false)

  const change = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await Auth.changePassword(oldP, newP)
      toast.success('Parol yangilandi')
      setOldP(''); setNewP('')
    } catch (err) { toast.error(err.message) }
    finally { setBusy(false) }
  }

  const rows = [
    { icon: User, label: 'F.I.Sh', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Telefon', value: user.phone || '—' },
    { icon: Briefcase, label: 'Lavozim', value: user.position || ROLES[user.role]?.label },
  ]

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-2xl font-extrabold text-ink">Profilim</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl grid place-items-center text-white text-xl font-bold" style={{ background: user.color || '#6366f1' }}>{initials(user.name)}</div>
          <div>
            <p className="text-lg font-bold text-ink">{user.name}</p>
            <span className={`chip ${ROLES[user.role]?.color} mt-1`}>{ROLES[user.role]?.label}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mt-6">
          {rows.map(r => (
            <div key={r.label} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
              <r.icon size={18} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">{r.label}</p>
                <p className="text-sm font-semibold text-ink">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink flex items-center gap-2 mb-4"><Lock size={18} className="text-brand-500" /> Parolni o'zgartirish</h3>
        <form onSubmit={change} className="grid sm:grid-cols-2 gap-3 max-w-lg">
          <div className="sm:col-span-2"><label className="label">Joriy parol</label><input type="password" required className="input" value={oldP} onChange={e => setOldP(e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="label">Yangi parol</label><input type="password" required minLength={6} className="input" value={newP} onChange={e => setNewP(e.target.value)} placeholder="Kamida 6 belgi" /></div>
          <div className="sm:col-span-2"><button disabled={busy} className="btn-primary"><Save size={16} /> Saqlash</button></div>
        </form>
      </div>
    </div>
  )
}
