import { useEffect, useState } from 'react'
import { Activity as ActivityIcon } from 'lucide-react'
import { Activities } from '../api/index.js'
import { timeAgo, initials, dateTime } from '../utils/format.js'
import EmptyState from '../components/EmptyState.jsx'

export default function ActivityPage() {
  const [list, setList] = useState([])
  useEffect(() => { Activities.list().then(setList).catch(() => {}) }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Faollik jurnali</h1>
        <p className="text-slate-500 text-sm mt-0.5">Xodimlar amallari tarixi</p>
      </div>

      <div className="card p-2">
        {list.length === 0 ? <EmptyState icon={ActivityIcon} title="Faollik yo'q" /> : (
          <div className="relative">
            {list.map((a, i) => (
              <div key={a.id} className="flex gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl transition">
                <div className="relative flex flex-col items-center">
                  <div className="h-9 w-9 rounded-xl bg-brand-100 text-brand-700 grid place-items-center text-xs font-bold shrink-0">{initials(a.userName || '?')}</div>
                  {i < list.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm text-ink"><span className="font-semibold">{a.userName}</span> <span className="text-slate-500">{a.action}</span></p>
                  <p className="text-xs text-slate-400 mt-0.5" title={dateTime(a.timestamp)}>{timeAgo(a.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
