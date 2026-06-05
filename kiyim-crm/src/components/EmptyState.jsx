import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Ma\'lumot yo\'q', sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
        <Icon size={32} />
      </div>
      <p className="mt-4 font-semibold text-slate-700">{title}</p>
      {sub && <p className="mt-1 text-sm text-slate-400 max-w-sm">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
