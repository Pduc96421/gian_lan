export default function Header() {
  return (
    <header className="app-header">
      <a className="header-logo" href="/">
        <div className="header-logo-icon">🎓</div>
        <div>
          <div className="header-logo-name">Phát hiện Gian lận</div>
          <div className="header-logo-sub">Hệ thống giám sát thi cử</div>
        </div>
      </a>
      <div className="header-spacer" />
      <span className="header-chip">Admin Panel</span>
    </header>
  )
}
