import { useEffect, useState } from 'react'
import { Search, Receipt, RotateCcw, Eye } from 'lucide-react'
import { Sales } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { som, dateTime } from '../utils/format.js'
import { PAYMENTS } from '../data/categories.js'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const PAY_LABEL = Object.fromEntries(PAYMENTS.map(p => [p.id, p.name]))

export default function SalesPage() {
  const { can } = useAuth()
  const toast = useToast()
  const [list, setList] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [payment, setPayment] = useState('all')
  const [view, setView] = useState(null)

  const load = () => Sales.list({ search, status, payment }).then(setList).catch(() => {})
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [search, status, payment])

  const refund = async (s) => {
    if (!confirm(`${s.receiptNumber} chekini qaytarasizmi? Mahsulotlar omborga qaytariladi.`)) return
    try { await Sales.refund(s.id); toast.success('Savdo qaytarildi'); load() }
    catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Savdolar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Barcha cheklar va savdolar tarixi</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chek raqami yoki mijoz..." className="input pl-10" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input sm:w-40">
          <option value="all">Barcha holat</option>
          <option value="completed">Yakunlangan</option>
          <option value="refunded">Qaytarilgan</option>
        </select>
        <select value={payment} onChange={e => setPayment(e.target.value)} className="input sm:w-40">
          <option value="all">Barcha to'lov</option>
          {PAYMENTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {list.length === 0 ? <EmptyState icon={Receipt} title="Savdolar topilmadi" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="px-4 py-3 font-semibold">Chek</th>
                  <th className="px-4 py-3 font-semibold">Mijoz</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Kassir</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">To'lov</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Sana</th>
                  <th className="px-4 py-3 font-semibold text-right">Summa</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {list.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-semibold text-ink">{s.receiptNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{s.customerName}</td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{s.cashierName}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className="chip bg-slate-100 text-slate-600">{PAY_LABEL[s.paymentMethod]}</span></td>
                    <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{dateTime(s.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${s.status === 'refunded' ? 'text-rose-400 line-through' : 'text-ink'}`}>{som(s.total)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setView(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600" title="Ko'rish"><Eye size={16} /></button>
                        {can('owner', 'manager') && s.status === 'completed' && (
                          <button onClick={() => refund(s)} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500" title="Qaytarish"><RotateCcw size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view?.receiptNumber} size="sm"
        footer={<button onClick={() => setView(null)} className="btn-ghost">Yopish</button>}>
        {view && (
          <div className="text-sm space-y-3">
            <div className="flex justify-between"><span className="text-slate-400">Mijoz</span><span className="font-medium">{view.customerName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Kassir</span><span className="font-medium">{view.cashierName}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Sana</span><span className="font-medium">{dateTime(view.createdAt)}</span></div>
            <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5">
              {view.items.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-600">{it.productName} {[it.size, it.color].filter(Boolean).join('/')} ×{it.quantity}</span>
                  <span className="font-medium">{som(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3">
              <div className="flex justify-between font-extrabold text-base"><span>Jami</span><span>{som(view.total)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
