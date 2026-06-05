import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/auth/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import POS from './pages/POS.jsx'
import Sales from './pages/Sales.jsx'
import Products from './pages/Products.jsx'
import Customers from './pages/Customers.jsx'
import Suppliers from './pages/Suppliers.jsx'
import Reports from './pages/Reports.jsx'
import Staff from './pages/Staff.jsx'
import Activity from './pages/Activity.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import NotFound from './pages/NotFound.jsx'

const page = (el, roles) => (
  <ProtectedRoute roles={roles}>
    <Layout>{el}</Layout>
  </ProtectedRoute>
)

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/kirish" element={<Login />} />

          <Route path="/panel"          element={page(<Dashboard />)} />
          <Route path="/kassa"          element={page(<POS />)} />
          <Route path="/savdolar"       element={page(<Sales />)} />
          <Route path="/mahsulotlar"    element={page(<Products />)} />
          <Route path="/mijozlar"       element={page(<Customers />)} />
          <Route path="/yetkazuvchilar" element={page(<Suppliers />, ['owner', 'manager'])} />
          <Route path="/hisobotlar"     element={page(<Reports />, ['owner', 'manager'])} />
          <Route path="/xodimlar"       element={page(<Staff />, ['owner', 'manager'])} />
          <Route path="/faollik"        element={page(<Activity />, ['owner', 'manager'])} />
          <Route path="/sozlamalar"     element={page(<Settings />, ['owner'])} />
          <Route path="/profil"         element={page(<Profile />)} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
