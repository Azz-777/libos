import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)
let idCounter = 0

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}
const STYLES = {
  success: 'border-l-4 border-emerald-500',
  error: 'border-l-4 border-rose-500',
  info: 'border-l-4 border-brand-500',
}
const ICON_COLOR = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-brand-500',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  const push = useCallback((type, message) => {
    const id = ++idCounter
    setToasts(t => [...t, { id, type, message }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  const toast = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-80 max-w-[calc(100vw-2.5rem)]">
        {toasts.map(t => {
          const Icon = ICONS[t.type]
          return (
            <div key={t.id} className={`card ${STYLES[t.type]} px-4 py-3 flex items-start gap-3 animate-fade-up`}>
              <Icon size={18} className={`${ICON_COLOR[t.type]} mt-0.5 shrink-0`} />
              <p className="text-sm text-slate-700 flex-1">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600">
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
