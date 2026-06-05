import { useEffect, useState } from 'react'
import { BarChart3, TrendingUp, CreditCard, Award, Crown } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Stats } from '../api/index.js'
import { som, somShort, num } from '../utils/format.js'

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#ef4444']

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card p-5">
      <h3 className="font-bold text-ink flex items-center gap-2 mb-4"><Icon size={18} className="text-brand-500" /> {title}</h3>
      {children}
    </div>
  )
}

export default function Reports() {
  const [topProducts, setTopProducts] = useState([])
  const [byPayment, setByPayment] = useState([])
  const [topCashiers, setTopCashiers] = useState([])
  const [tiers, setTiers] = useState([])
  const [daily, setDaily] = useState([])

  useEffect(() => {
    Stats.topProducts().then(setTopProducts).catch(() => {})
    Stats.byPayment().then(setByPayment).catch(() => {})
    Stats.topCashiers().then(setTopCashiers).catch(() => {})
    Stats.tiers().then(setTiers).catch(() => {})
    Stats.daily(30).then(setDaily).catch(() => {})
  }, [])

  const tip = { contentStyle: { borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 } }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Hisobotlar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Savdo tahlili va statistika</p>
      </div>

      <Section icon={TrendingUp} title="30 kunlik savdo dinamikasi">
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={(d) => d.slice(8)} />
              <YAxis tickFormatter={somShort} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={50} />
              <Tooltip {...tip} formatter={(v) => som(v)} />
              <Bar dataKey="revenue" name="Tushum" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section icon={BarChart3} title="Eng ko'p sotilgan mahsulotlar">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={(v, n) => n === 'qty' ? `${v} dona` : som(v)} />
                <Bar dataKey="qty" name="qty" fill="#ec4899" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section icon={CreditCard} title="To'lov turlari">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byPayment} dataKey="value" nameKey="name" outerRadius={90} label={(e) => e.name}>
                  {byPayment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip {...tip} formatter={(v) => som(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section icon={Award} title="Kassirlar reytingi">
          <div className="space-y-2">
            {topCashiers.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className={`h-7 w-7 grid place-items-center rounded-lg text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{c.name}</p>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${topCashiers[0] ? (c.revenue / topCashiers[0].revenue) * 100 : 0}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{somShort(c.revenue)}</p>
                  <p className="text-xs text-slate-400">{c.count} savdo</p>
                </div>
              </div>
            ))}
            {topCashiers.length === 0 && <p className="text-center text-sm text-slate-400 py-6">Ma'lumot yo'q</p>}
          </div>
        </Section>

        <Section icon={Crown} title="Mijozlar darajalari">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tiers} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {tiers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip {...tip} formatter={(v) => `${num(v)} mijoz`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>
    </div>
  )
}
