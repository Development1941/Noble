import { Bell, CircleHelp, Settings } from 'lucide-react'
import { NobleLogo } from './NobleLogo'

export function Header() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-noble-navy px-3 text-white">
      <NobleLogo size="sm" />
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <span className="truncate opacity-95">Noble TLSP App</span>
        <span className="hidden text-white/50 sm:inline">|</span>
        <span className="hidden truncate text-white/80 sm:inline">Transaction Pipeline</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="hidden rounded px-2 py-1 text-xs text-white/90 hover:bg-white/10 md:inline"
        >
          Noble Drilling Services
        </button>
        <IconBtn label="Notifications">
          <Bell className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Settings">
          <Settings className="h-4 w-4" />
        </IconBtn>
        <IconBtn label="Help">
          <CircleHelp className="h-4 w-4" />
        </IconBtn>
        <div
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#5b5fc7] text-xs font-semibold"
          title="MS"
        >
          MS
        </div>
      </div>
    </header>
  )
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded p-1.5 text-white/90 hover:bg-white/10"
    >
      {children}
    </button>
  )
}
