import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import {
  LayoutGrid, ShoppingBag, Receipt, Shirt, Users, Truck,
  BarChart3, UserCog, Activity as ActivityIcon, Settings,
  Menu, X, LogOut, ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { APP, ROLES } from '../config.js'
import { initials } from '../utils/format.js'

const NAV = [
  { to: '/panel',          label: 'Boshqaruv', icon: LayoutGrid,    roles: ['owner', 'manager', 'cashier'] },
  { to: '/kassa',          label: 'Kassa',     icon: ShoppingBag,   roles: ['owner', 'manager', 'cashier'] },
  { to: '/savdolar',       label: 'Savdolar',  icon: Receipt,       roles: ['owner', 'manager', 'cashier'] },
  { to: '/mahsulotlar',    label: 'Mahsulotlar', icon: Shirt,       roles: ['owner', 'manager', 'cashier'] },
  { to: '/mijozlar',       label: 'Mijozlar',  icon: Users,         roles: ['owner', 'manager', 'cashier'] },
  { to: '/yetkazuvchilar', label: 'Yetkazib beruvchilar', icon: Truck, roles: ['owner', 'manager'] },
  { to: '/hisobotlar',     label: 'Hisobotlar', icon: BarChart3,    roles: ['owner', 'manager'] },
  { to: '/xodimlar',       label: 'Xodimlar',  icon: UserCog,       roles: ['owner', 'manager'] },
  { to: '/faollik',        label: 'Faollik',   icon: ActivityIcon,  roles: ['owner', 'manager'] },
]

function Logo() {
  return (
    <Link to="/panel" className="flex items-center gap-2 shrink-0">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 grid place-items-center text-white font-extrabold">L</div>
      <span className="font-extrabold text-lg tracking-tight text-ink">{APP.name}</span>
    </Link>
  )
}

export default function Layout({ children }) {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const items = NAV.filter(n => n.roles.includes(user.role))

  const handleLogout = async () => { await logout(); navigate('/kirish') }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-2 flex-1 overflow-x-auto">
            {items.map(n => (
              <NavLink key={n.to} to={n.to}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                <n.icon size={17} />
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2 rounded-xl pl-1.5 pr-2 py-1.5 hover:bg-slate-100 transition">
                <div className="h-8 w-8 rounded-lg grid place-items-center text-white text-xs font-bold"
                  style={{ background: user.color || '#6366f1' }}>
                  {initials(user.name)}
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  <p className="text-[11px] text-slate-400">{ROLES[user.role]?.label}</p>
                </div>
                <ChevronDown size={15} className="text-slate-400 hidden sm:block" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 card p-1.5 z-20 animate-fade-up">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/profil" onClick={() => setMenuOpen(false)} className="nav-link w-full">
                      <UserCog size={16} /> Profilim
                    </Link>
                    {can('owner') && (
                      <Link to="/sozlamalar" onClick={() => setMenuOpen(false)} className="nav-link w-full">
                        <Settings size={16} /> Sozlamalar
                      </Link>
                    )}
                    <button onClick={handleLogout} className="nav-link w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                      <LogOut size={16} /> Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(v => !v)} className="lg:hidden rounded-xl p-2 hover:bg-slate-100">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-slate-100 px-4 py-3 grid grid-cols-2 gap-1.5 bg-white">
            {items.map(n => (
              <NavLink key={n.to} to={n.to} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
                <n.icon size={17} />
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 lg:px-6 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        {APP.full} · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
