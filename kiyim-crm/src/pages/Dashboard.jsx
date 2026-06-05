import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, ShoppingBag, Users, AlertTriangle, TrendingUp, Receipt, ArrowRight,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import { Stats, Sales } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { som, somShort, dayLabel, dateTime } from '../utils/format.js'

const PIE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444']

export default function Dashboard() {
  const { user } = useAuth()
  const [ov, setOv] = useState(null)
  const [daily, setDaily] = useState([])
  const [cats, setCats] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    Stats.overview().then(setOv).catch(() => {})
    Stats.daily(14).then(setDaily).catch(() => {})
    Stats.byCategory().then(setCats).catch(() => {})
    Sales.list().then(s => setRecent(s.slice(0, 6))).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Xayrli tong' : hour < 18 ? 'Xayrli kun' : 'Xayrli kech'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{greet}, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">Do'kon faoliyatining umumiy ko'rinishi</p>
        </div>
        <Link to="/kassa" className="btn-primary"><ShoppingBag size={18} /> Yangi savdo</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} tone="brand" label="Bugungi tushum" value={som(ov?.todayRevenue)} sub={`${ov?.todaySalesCount || 0} ta savdo`} />
        <StatCard icon={TrendingUp} tone="pink" label="Oylik tushum" value={som(ov?.monthRevenue)} sub={`O'rtacha chek ${somShort(ov?.avgCheck)}`} />
        <StatCard icon={Users} tone="teal" label="Mijozlar" value={ov?.customers ?? '—'} sub={`${ov?.products ?? 0} mahsulot`} />
        <StatCard icon={AlertTriangle} tone="amber" label="Kam qolgan" value={ov?.lowStock ?? '—'} sub="mahsulot tugayapti" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold text-ink">So'nggi 14 kunlik tushum</h3>
          <div className="h-64 mt-4 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tickFormatter={dayLabel} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={somShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip formatter={(v) => som(v)} labelFormatter={dayLabel}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" name="Tushum" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-ink">Kategoriyalar</h3>
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cats} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {cats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => som(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {cats.slice(0, 5).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {c.name}
                </span>
                <span className="font-semibold text-slate-700">{somShort(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent sales */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-ink flex items-center gap-2"><Receipt size={18} className="text-brand-500" /> So'nggi savdolar</h3>
          <Link to="/savdolar" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            Barchasi <ArrowRight size={15} />
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recent.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-400">Hozircha savdolar yo'q</p>}
          {recent.map(s => (
            <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-ink truncate">{s.customerName}</p>
                <p className="text-xs text-slate-400">{s.receiptNumber} · {dateTime(s.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-ink">{som(s.total)}</p>
                <p className={`text-xs ${s.status === 'refunded' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {s.status === 'refunded' ? 'Qaytarilgan' : 'Yakunlangan'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
