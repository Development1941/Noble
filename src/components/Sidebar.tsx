import { Bot, CalendarDays, ExternalLink, FolderKanban, LayoutList } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { NobleLogo } from './NobleLogo'

const SHAREPOINT_URL =
  'https://noblecorp1-my.sharepoint.com/personal/msingal_noblecorp_com/Lists/Transaction%20Golden%20Record/AllItems.aspx?env=WebViewList'

export function Sidebar() {
  const { counts } = useProjects()

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r border-noble-border bg-noble-sidebar">
      <div className="flex items-center justify-center border-b border-noble-border px-3 py-4">
        <NobleLogo size="lg" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2">
        <NavLink
          to="/"
          end
          className={({ isActive }) => navClass(isActive)}
        >
          <LayoutList className="mt-0.5 h-4 w-4 shrink-0 text-noble-muted" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-noble-text">Pipeline</span>
            <span className="block text-xs text-noble-muted">{counts.vetting} Vetting</span>
          </span>
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => navClass(isActive)}>
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-noble-muted" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-noble-text">Calendar</span>
            <span className="block text-xs text-noble-muted">{counts.locked} Locked</span>
          </span>
        </NavLink>

        <a
          href={SHAREPOINT_URL}
          target="_blank"
          rel="noreferrer"
          className={navClass(false)}
        >
          <FolderKanban className="mt-0.5 h-4 w-4 shrink-0 text-noble-muted" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-noble-text">All Projects</span>
            <span className="flex items-center gap-1 text-xs text-noble-muted">
              SharePoint list <ExternalLink className="h-3 w-3" />
            </span>
          </span>
        </a>

        <button type="button" className={`${navClass(false)} text-left`}>
          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-noble-muted" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-noble-text">Teams</span>
            <span className="block text-xs text-noble-muted">Open channel</span>
          </span>
        </button>

        <button type="button" className={`${navClass(false)} text-left`}>
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-noble-muted" />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-noble-text">Chatbot</span>
            <span className="block text-xs text-noble-muted">Ask Noble</span>
          </span>
        </button>
      </nav>

      <div className="border-t border-noble-border p-3 text-[10px] leading-snug text-noble-muted">
        Proposed flow: Informal builds plan → Formal reviews &amp; locks → Calendar. Execution drafting
        removed.
      </div>
    </aside>
  )
}

function navClass(isActive: boolean) {
  return [
    'flex items-start gap-2 rounded-md px-2.5 py-2.5 transition-colors',
    isActive
      ? 'border-l-[3px] border-noble-blue bg-[#deecf9] pl-[7px]'
      : 'border-l-[3px] border-transparent hover:bg-black/5',
  ].join(' ')
}
