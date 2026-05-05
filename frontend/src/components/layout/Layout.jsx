import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main className="app-main">{children}</main>
    </>
  )
}
