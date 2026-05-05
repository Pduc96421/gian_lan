import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/models', label: 'Quản lý Mô hình' },
  { to: '/monitor', label: 'Giám Sát Thi Cử' },
]
const DISABLED = [
  { label: 'Quản lý Dataset' },
  { label: 'Cài đặt hệ thống' },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  return (
    <aside className="app-sidebar">
      <div className="sidebar-label">Chức năng</div>
      {NAV.map(({ to, icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`nav-item${pathname.startsWith(to) ? ' active' : ''}`}
        >
          {label}
        </Link>
      ))}
      <div className="divider" />
      <div className="sidebar-label">Hệ thống</div>
      {DISABLED.map(({ label }) => (
        <span key={label} className="nav-item disabled">
          {label}
        </span>
      ))}
    </aside>
  )
}
