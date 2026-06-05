import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-7xl font-extrabold bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">404</p>
        <p className="mt-3 text-lg font-semibold text-ink">Sahifa topilmadi</p>
        <p className="text-slate-500 text-sm mt-1">Siz qidirayotgan sahifa mavjud emas.</p>
        <Link to="/panel" className="btn-primary mt-6"><Home size={18} /> Bosh sahifaga</Link>
      </div>
    </div>
  )
}
