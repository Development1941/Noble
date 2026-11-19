import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#faf9f8]">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
