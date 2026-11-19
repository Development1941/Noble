import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddProjectModal } from '../components/AddProjectModal'
import { StageTimeline } from '../components/StageTimeline'
import { useProjects } from '../context/ProjectContext'
import { formatInputDate } from '../lib/dates'
import { prevStage, shortStageLabel, type Project } from '../types'

const COLS =
  'grid grid-cols-[minmax(180px,1.4fr)_140px_140px_minmax(150px,1fr)_minmax(160px,1.1fr)_40px_36px] items-center gap-x-3'

export function PipelinePage() {
  const {
    pipelineProjects,
    deleteProject,
    updateProject,
    moveStage,
    openPlan,
    openReview,
    canAdvanceToFormal,
  } = useProjects()
  const [expanded, setExpanded] = useState<string | null>(pipelineProjects[0]?.id ?? null)
  const [toast, setToast] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 3200)
  }

  function onBack(project: Project) {
    const result = moveStage(project.id, 'back')
    if (!result.ok && result.reason) showToast(result.reason)
  }

  function onNext(project: Project) {
    if (project.stage === 'Formal Review') {
      openReview(project.id)
      return
    }
    const fromStage = project.stage
    const result = moveStage(project.id, 'next')
    if (!result.ok) {
      if (result.reason) showToast(result.reason)
      return
    }
    if (fromStage === 'Informal Vetting') {
      openReview(project.id)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-noble-text">Pipeline</h1>
          <p className="mt-1 text-sm text-noble-muted">
            Informal → Formal Review → Formal Approval → Lock to Calendar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded bg-noble-blue px-3 py-2 text-sm font-semibold text-white hover:bg-noble-blue-dark"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <AddProjectModal open={addOpen} onClose={() => setAddOpen(false)} />

      {toast && (
        <div className="mb-3 rounded border border-[#fde7e9] bg-[#fde7e9] px-3 py-2 text-sm text-[#a4262c]">
          {toast}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-noble-border bg-white shadow-sm">
        <div
          className={`${COLS} border-b border-noble-border bg-[#f3f2f1] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-noble-muted`}
        >
          <div>Project</div>
          <div>Target Completion</div>
          <div>Formal Review By</div>
          <div>Back Action</div>
          <div>Next Action</div>
          <div />
          <div />
        </div>

        {pipelineProjects.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-noble-muted">
            No projects in vetting. Click + New to create one.
          </div>
        )}

        {pipelineProjects.map((project) => {
          const isOpen = expanded === project.id
          const datesLocked = project.stage === 'Formal Review'
          return (
            <div key={project.id} className="border-b border-noble-border last:border-b-0">
              <div className={`${COLS} px-4 py-3`}>
                <button
                  type="button"
                  className="truncate text-left text-sm font-semibold text-noble-text hover:text-noble-blue"
                  onClick={() => {
                    setExpanded(project.id)
                    openPlan(project.id)
                  }}
                  title={project.title}
                >
                  {project.title}
                </button>

                <DateCell
                  value={project.targetCompletion}
                  onChange={(v) => updateProject(project.id, { targetCompletion: v })}
                  disabled={datesLocked}
                />
                <DateCell
                  value={project.formalReviewBy}
                  onChange={(v) => updateProject(project.id, { formalReviewBy: v })}
                  disabled={datesLocked}
                />

                <div className="min-w-0">
                  <BackButton project={project} onBack={() => onBack(project)} />
                </div>

                <div className="min-w-0">
                  <NextButton
                    project={project}
                    canAdvance={
                      project.stage === 'Informal Vetting'
                        ? canAdvanceToFormal(project)
                        : true
                    }
                    onNext={() => onNext(project)}
                    onPlan={() => openPlan(project.id)}
                    onReview={() => openReview(project.id)}
                  />
                </div>

                <button
                  type="button"
                  aria-label="Delete project"
                  className="justify-self-center rounded p-1.5 text-[#a4262c] hover:bg-[#fde7e9]"
                  onClick={() => {
                    if (window.confirm(`Delete ${project.title}?`)) deleteProject(project.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  aria-label={isOpen ? 'Collapse' : 'Expand'}
                  className="justify-self-center rounded p-1.5 text-noble-muted hover:bg-black/5"
                  onClick={() => setExpanded(isOpen ? null : project.id)}
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isOpen && <StageTimeline project={project} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DateCell({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <input
      type="date"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      title={formatInputDate(value)}
      className="w-full min-w-0 rounded border border-noble-border bg-white px-2 py-1.5 text-sm text-noble-text disabled:bg-[#f3f2f1] disabled:text-noble-muted"
    />
  )
}

function BackButton({ project, onBack }: { project: Project; onBack: () => void }) {
  const back = prevStage(project.stage)
  if (!back || back === 'Formal Approval') {
    return <span className="text-xs text-noble-muted">—</span>
  }
  return (
    <button
      type="button"
      onClick={onBack}
      className="w-full truncate rounded border border-noble-border bg-white px-2.5 py-1.5 text-xs font-semibold text-noble-text hover:bg-[#f3f2f1]"
    >
      ← Back to {shortStageLabel(back)}
    </button>
  )
}

function NextButton({
  project,
  canAdvance,
  onNext,
  onPlan,
  onReview,
}: {
  project: Project
  canAdvance: boolean
  onNext: () => void
  onPlan: () => void
  onReview: () => void
}) {
  if (project.stage === 'New') {
    return (
      <button
        type="button"
        onClick={onNext}
        className="w-full truncate rounded bg-noble-blue px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-noble-blue-dark"
      >
        Next → Informal
      </button>
    )
  }

  if (project.stage === 'Informal Vetting') {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <button
          type="button"
          onClick={onPlan}
          className="w-full truncate rounded bg-noble-blue px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-noble-blue-dark"
        >
          Build / edit plan
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="w-full truncate rounded border border-noble-blue px-2.5 py-1.5 text-xs font-semibold text-noble-blue hover:bg-[#deecf9] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next → Formal Review
        </button>
      </div>
    )
  }

  if (project.stage === 'Formal Review') {
    return (
      <button
        type="button"
        onClick={onReview}
        className="w-full truncate rounded bg-noble-navy px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90"
      >
        Open Formal Review →
      </button>
    )
  }

  return <span className="text-xs text-noble-muted">—</span>
}
