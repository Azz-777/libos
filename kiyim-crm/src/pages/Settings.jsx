import { useEffect, useState } from 'react'
import { Store, Database, Info, Shield, CheckCircle2 } from 'lucide-react'
import { api } from '../api/client.js'
import { Stats } from '../api/index.js'
import { APP } from '../config.js'
import { num } from '../utils/format.js'

export default function Settings() {
  const [health, setHealth] = useState(null)
  const [ov, setOv] = useState(null)

  useEffect(() => {
    api.get('/health').then(setHealth).catch(() => setHealth({ ok: false }))
    Stats.overview().then(setOv).catch(() => {})
  }, [])

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Sozlamalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Tizim va do'kon ma'lumotlari</p>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink flex items-center gap-2 mb-4"><Store size={18} className="text-brand-500" /> Do'kon</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl px-4 py-3"><p className="text-xs text-slate-400">Nomi</p><p className="font-semibold">{APP.full}</p></div>
          <div className="bg-slate-50 rounded-xl px-4 py-3"><p className="text-xs text-slate-400">Valyuta</p><p className="font-semibold">So'm (UZS)</p></div>
          <div className="bg-slate-50 rounded-xl px-4 py-3"><p className="text-xs text-slate-400">Til</p><p className="font-semibold">O'zbek</p></div>
          <div className="bg-slate-50 rounded-xl px-4 py-3"><p className="text-xs text-slate-400">Bonus tizimi</p><p className="font-semibold">Har 100 ming so'mga 1 ball</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink flex items-center gap-2 mb-4"><Database size={18} className="text-brand-500" /> Ma'lumotlar bazasi</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 rounded-xl py-4"><p className="text-2xl font-extrabold text-ink">{num(ov?.products)}</p><p className="text-xs text-slate-400">Mahsulot</p></div>
          <div className="bg-slate-50 rounded-xl py-4"><p className="text-2xl font-extrabold text-ink">{num(ov?.customers)}</p><p className="text-xs text-slate-400">Mijoz</p></div>
          <div className="bg-slate-50 rounded-xl py-4"><p className="text-2xl font-extrabold text-ink">{num(ov?.salesCount)}</p><p className="text-xs text-slate-400">Savdo</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-bold text-ink flex items-center gap-2 mb-4"><Shield size={18} className="text-brand-500" /> Tizim holati</h3>
        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
          <span className="text-sm text-slate-600 flex items-center gap-2"><Info size={15} /> Backend API</span>
          {health?.ok
            ? <span className="chip bg-emerald-50 text-emerald-600"><CheckCircle2 size={13} /> Ishlamoqda</span>
            : <span className="chip bg-rose-50 text-rose-600">Ulanmadi</span>}
        </div>
      </div>
    </div>
  )
}
