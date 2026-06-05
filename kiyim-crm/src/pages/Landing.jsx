import { Link } from 'react-router-dom'
import { ShoppingBag, BarChart3, Users, Shirt, ArrowRight, Check } from 'lucide-react'
import { APP } from '../config.js'

const FEATURES = [
  { icon: ShoppingBag, title: 'Tezkor kassa', text: 'Bir necha soniyada savdoni rasmiylashtiring — savatcha, chegirma, chek.' },
  { icon: Shirt, title: 'Ombor nazorati', text: "O'lcham va ranglar bo'yicha qoldiqlar, kam qolgan mahsulotlar ogohlantirishi." },
  { icon: Users, title: 'Sodiq mijozlar', text: 'Bonus ballar, darajalar (bronza→platina) va mijozlar tarixi.' },
  { icon: BarChart3, title: 'Aniq hisobotlar', text: 'Kunlik tushum, eng ko\'p sotilganlar, kassirlar reytingi va boshqalar.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 grid place-items-center text-white font-extrabold">L</div>
          <span className="font-extrabold text-lg">{APP.name}</span>
        </div>
        <Link to="/kirish" className="btn-primary">Kirish</Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 text-center">
        <span className="chip bg-brand-50 text-brand-700 mb-5">Kiyim do'konlari uchun #1 yechim</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-ink leading-[1.05]">
          Kiyim do'koningizni<br />
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">aqlli boshqaring</span>
        </h1>
        <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
          {APP.tagline}. Kassa, ombor, mijozlar va hisobotlar — barchasi bitta yengil tizimda.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/kirish" className="btn-primary text-base px-6 py-3">
            Boshlash <ArrowRight size={18} />
          </Link>
          <a href="#imkoniyatlar" className="btn-ghost text-base px-6 py-3">Imkoniyatlar</a>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-slate-500">
          {['Bepul demo', 'O\'zbek tilida', 'Bulutli & xavfsiz'].map(t => (
            <span key={t} className="flex items-center gap-1.5"><Check size={16} className="text-emerald-500" />{t}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="imkoniyatlar" className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-3xl font-extrabold text-center text-ink">Hamma narsa bitta joyda</h2>
          <p className="text-center text-slate-500 mt-2">Do'koningizni yuritish uchun zarur bo'lgan barcha vositalar.</p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="card p-6 hover:shadow-card transition">
                <div className="rounded-xl bg-brand-50 text-brand-600 p-3 w-fit"><f.icon size={24} /></div>
                <h3 className="mt-4 font-bold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-accent-500 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-extrabold">Bugun boshlang</h2>
          <p className="mt-2 text-white/80 max-w-lg mx-auto">Demo akkaunt bilan tizimni hoziroq sinab ko'ring.</p>
          <Link to="/kirish" className="btn bg-white text-brand-700 hover:bg-white/90 mt-6 text-base px-6 py-3">
            Tizimga kirish <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        {APP.full} · Barcha huquqlar himoyalangan © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
