import { Link, useLocation } from 'react-router-dom'

const NAV = [
  { to: '/models', label: 'Quản lý Mô hình' },
  { to: '/monitor', label: 'Giám Sát Thi Cử' },
  { to: '/models/stats', label: 'Thống kê vận hành' },
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
    </aside>
  )
}
