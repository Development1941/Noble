import { useMemo } from 'react'
import { StatusBadge } from '../components/StatusBadge'
import { useProjects } from '../context/ProjectContext'
import { addDays, daysBetween } from '../lib/dates'
import type { Project, StepStatus } from '../types'

const LEGEND: { label: string; status: StepStatus | 'Blackout' }[] = [
  { label: 'Completed', status: 'Completed' },
  { label: 'On Track', status: 'On Track' },
  { label: 'At Risk', status: 'At Risk' },
  { label: 'Blocked', status: 'Blocked' },
  { label: 'Blackout', status: 'Blackout' },
]

const LABEL_W = 160

export function CalendarPage() {
  const { calendarProjects, openExecution, setLocked } = useProjects()

  const range = useMemo(() => {
    const starts = calendarProjects.flatMap((p) => p.steps.map((s) => s.start)).filter(Boolean)
    const ends = calendarProjects.flatMap((p) => p.steps.map((s) => s.due)).filter(Boolean)
    const min = starts.length
      ? starts.reduce((a, b) => (a < b ? a : b))
      : new Date().toISOString().slice(0, 10)
    const max = ends.length
      ? ends.reduce((a, b) => (a > b ? a : b))
      : addDays(min, 90)
    const start = addDays(min, -7)
    const end = addDays(max, 14)
    const totalDays = Math.max(daysBetween(start, end), 1)
    const ticks: string[] = []
    for (let d = 0; d <= totalDays; d += 7) {
      ticks.push(addDays(start, d))
    }
    return { start, end, totalDays, ticks }
  }, [calendarProjects])

  const today = new Date().toISOString().slice(0, 10)
  const todayPct = Math.min(
    100,
    Math.max(0, (daysBetween(range.start, today) / range.totalDays) * 100),
  )

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-noble-text sm:text-2xl">Project Calendar</h1>
        <p className="mt-1 text-xs text-noble-muted sm:text-sm">
          Locked projects after Formal Approval (Tax/Legal/Accounting/Finance).
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-noble-border bg-white shadow-sm">
        {calendarProjects.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-noble-muted">
            No locked projects yet. Complete Formal Approval, then Lock to Calendar.
          </div>
        )}

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="relative border-b border-noble-border bg-[#faf9f8] px-3 py-2 sm:px-4">
              <div className="relative h-8" style={{ marginLeft: LABEL_W }}>
                {range.ticks.map((t) => {
                  const left = (daysBetween(range.start, t) / range.totalDays) * 100
                  return (
                    <div
                      key={t}
                      className="absolute top-0 -translate-x-1/2 text-[10px] text-noble-muted"
                      style={{ left: `${left}%` }}
                    >
                      {new Date(t + 'T12:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute top-0 bottom-0 z-10 w-px bg-noble-blue"
                style={{
                  left: `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${todayPct / 100})`,
                }}
              />

              {calendarProjects.map((project) => (
                <CalendarRow
                  key={project.id}
                  project={project}
                  range={range}
                  labelWidth={LABEL_W}
                  onOpen={() => openExecution(project.id)}
                  onUnlock={() => setLocked(project.id, false)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-noble-border bg-[#faf9f8] px-3 py-3 sm:gap-3 sm:px-4">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarRow({
  project,
  range,
  labelWidth,
  onOpen,
  onUnlock,
}: {
  project: Project
  range: { start: string; totalDays: number }
  labelWidth: number
  onOpen: () => void
  onUnlock: () => void
}) {
  const steps = project.steps.length
    ? project.steps
    : [
        {
          id: 'fallback',
          name: project.title,
          responsible: '',
          start: project.formalReviewBy || range.start,
          due: project.targetCompletion || addDays(range.start, 30),
          status: 'On Track' as StepStatus,
          necessary: '',
        },
      ]

  return (
    <div className="flex border-b border-noble-border last:border-b-0">
      <div
        className="shrink-0 border-r border-noble-border px-2 py-3 text-left sm:px-3"
        style={{ width: labelWidth }}
      >
        <button
          type="button"
          onClick={onOpen}
          className="w-full text-left hover:text-noble-blue"
        >
          <div className="truncate text-sm font-semibold text-noble-text">{project.title}</div>
          <div className="truncate text-xs text-noble-muted">
            {project.calendarLabel ?? `${project.steps.length} milestones`}
          </div>
        </button>
        <button
          type="button"
          className="mt-1 text-[11px] font-semibold text-noble-blue hover:underline"
          onClick={onUnlock}
        >
          Unlock to edit
        </button>
      </div>

      <div className="relative min-h-[64px] flex-1 px-2 py-3">
        {steps.map((step) => {
          const left = (daysBetween(range.start, step.start) / range.totalDays) * 100
          const width = Math.max(
            (daysBetween(step.start, step.due) / range.totalDays) * 100,
            2,
          )
          const color =
            step.status === 'Completed'
              ? 'bg-[#107c10]'
              : step.status === 'At Risk'
                ? 'bg-[#ffb900]'
                : step.status === 'Blocked'
                  ? 'bg-[#d13438]'
                  : 'bg-[#0078d4]'
          return (
            <div key={step.id} className="relative mb-1 h-7">
              <div
                className={`absolute top-0 flex h-7 items-center overflow-hidden rounded ${color} px-2 text-[10px] font-semibold text-white shadow-sm`}
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${step.name} (${step.status})`}
              >
                <span className="truncate">{step.name}</span>
              </div>
              <div
                className="absolute top-0 hidden sm:block"
                style={{ left: `calc(${left}% + ${width}% + 4px)` }}
              >
                <StatusBadge status={step.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
