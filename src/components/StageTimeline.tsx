import { Check } from 'lucide-react'
import { STAGE_LABELS, shortStageLabel, type Project, type Stage } from '../types'

const DATE_KEYS: Record<Stage, keyof Project['stageDates']> = {
  New: 'new',
  'Informal Vetting': 'informal',
  'Formal Review': 'formal',
  'Formal Approval': 'approval',
  'Locked in': 'lockedIn',
}

const FLOW_STAGES: Stage[] = [
  'New',
  'Informal Vetting',
  'Formal Review',
  'Formal Approval',
  'Locked in',
]

export function StageTimeline({ project }: { project: Project }) {
  const displayIndex = FLOW_STAGES.indexOf(project.stage)

  return (
    <div className="border-t border-noble-border bg-[#faf9f8] px-3 py-4 sm:px-4">
      <div className="mb-3 text-sm font-semibold text-noble-text">
        Stage Timeline — <span className="font-normal text-noble-muted">{project.title}</span>
      </div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex min-w-[520px] items-start justify-between gap-1 sm:min-w-0 sm:gap-2">
          {FLOW_STAGES.map((stage, i) => {
            const done = i < displayIndex || (project.locked && stage === 'Locked in')
            const active = i === displayIndex && !done
            const date = project.stageDates[DATE_KEYS[stage]]
            return (
              <div key={stage} className="relative flex flex-1 flex-col items-center px-0.5">
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
                <div className="mt-2 text-center text-[10px] font-semibold text-noble-text sm:text-xs">
                  <span className="sm:hidden">{shortStageLabel(stage)}</span>
                  <span className="hidden sm:inline">{STAGE_LABELS[stage]}</span>
                </div>
                <div className="mt-0.5 text-center text-[10px] text-noble-muted sm:text-[11px]">
                  {date ?? '—'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <p className="mt-3 hidden text-xs text-noble-muted sm:block">
        1 New → 2 Informal → 3 Formal Review → 4 Formal Approval → 5 Lock to Calendar
      </p>
    </div>
  )
}
