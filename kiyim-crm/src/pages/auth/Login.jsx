import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { APP } from '../../config.js'

const DEMO = [
  { role: 'Egasi',   email: 'admin@libos.uz',   pass: 'admin123' },
  { role: 'Menejer', email: 'manager@libos.uz', pass: 'manager123' },
  { role: 'Kassir',  email: 'kassir@libos.uz',  pass: 'kassir123' },
]

export default function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (user) navigate('/panel') }, [user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await login(email, password)
      toast.success('Xush kelibsiz!')
      navigate('/panel')
    } catch (err) {
      toast.error(err.message || 'Kirishda xatolik')
    } finally {
      setBusy(false)
    }
  }

  const fill = (d) => { setEmail(d.email); setPassword(d.pass) }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 text-white p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-white/15 grid place-items-center font-extrabold text-xl">L</div>
          <span className="font-extrabold text-xl">{APP.name}</span>
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold leading-tight">Do'koningiz<br />kafti ichingizda.</h1>
          <p className="mt-4 text-white/70 max-w-sm">{APP.tagline}.</p>
        </div>
        <p className="text-white/50 text-sm">© {new Date().getFullYear()} {APP.full}</p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-slate-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 grid place-items-center text-white font-extrabold text-xl">L</div>
            <span className="font-extrabold text-xl">{APP.name}</span>
          </div>

          <h2 className="text-2xl font-extrabold text-ink">Tizimga kirish</h2>
          <p className="text-slate-500 text-sm mt-1">Hisobingizga kiring va ishni boshlang.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="email@libos.uz" autoFocus />
            </div>
            <div>
              <label className="label">Parol</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} className="input pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full py-3">
              {busy ? <Loader2 size={18} className="animate-spin" /> : <>Kirish <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-7">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Demo akkauntlar</p>
            <div className="space-y-2">
              {DEMO.map(d => (
                <button key={d.email} onClick={() => fill(d)}
                  className="w-full card px-4 py-2.5 flex items-center justify-between hover:border-brand-300 hover:shadow-card transition text-left">
                  <div>
                    <p className="text-sm font-semibold text-ink">{d.role}</p>
                    <p className="text-xs text-slate-400">{d.email}</p>
                  </div>
                  <span className="chip bg-brand-50 text-brand-600">{d.pass}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
