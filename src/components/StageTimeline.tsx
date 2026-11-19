import { Check } from 'lucide-react'
import { STAGE_LABELS, type Project, type Stage } from '../types'

const DATE_KEYS: Record<Stage, keyof Project['stageDates']> = {
  New: 'new',
  'Informal Vetting': 'informal',
  'Formal Vetting': 'formal',
  Execution: 'execution',
  'Locked in': 'lockedIn',
}

const FLOW_STAGES: Stage[] = [
  'New',
  'Informal Vetting',
  'Formal Vetting',
  'Execution',
  'Locked in',
]

export function StageTimeline({ project }: { project: Project }) {
  const displayIndex = FLOW_STAGES.indexOf(project.stage)

  return (
    <div className="border-t border-noble-border bg-[#faf9f8] px-4 py-4">
      <div className="mb-3 text-sm font-semibold text-noble-text">
        Stage Timeline — {project.title}
      </div>
      <div className="flex items-start justify-between gap-2">
        {FLOW_STAGES.map((stage, i) => {
          const done = i < displayIndex || (project.locked && stage === 'Locked in')
          const active = i === displayIndex && !done
          const date = project.stageDates[DATE_KEYS[stage]]
          return (
            <div key={stage} className="relative flex flex-1 flex-col items-center">
              {i < FLOW_STAGES.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 h-0.5 w-full ${
                    i < displayIndex ? 'bg-stage-done' : 'bg-[#c8c6c4]'
                  }`}
                />
              )}
              <div
                className={[
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                  done
                    ? 'bg-stage-done text-white'
                    : active
                      ? 'bg-stage-current text-white'
                      : 'bg-[#c8c6c4] text-white',
                ].join(' ')}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </div>
              <div className="mt-2 text-center text-xs font-semibold text-noble-text">
                {STAGE_LABELS[stage]}
              </div>
              <div className="mt-0.5 text-center text-[11px] text-noble-muted">
                {date ?? '—'}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-noble-muted">
        Flow: Informal builds plan → Formal (Tax/Legal/Accounting/Finance) → Execution (CFO/GC) →
        Calendar.
      </p>
    </div>
  )
}
