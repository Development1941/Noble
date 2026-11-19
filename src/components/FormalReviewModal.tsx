import { RefreshCw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { formatMonthDay } from '../lib/dates'
import { StatusBadge } from './StatusBadge'

/** Formal Review — read milestones, then send to Formal Approval. */
export function FormalReviewModal() {
  const navigate = useNavigate()
  const { selected, closeModal, canAdvanceToExecution, moveStage, updateProject } = useProjects()

  if (!selected) return null

  const ready = canAdvanceToExecution(selected)

  function sendToExecution() {
    if (!selected || !ready) return
    const result = moveStage(selected.id, 'next')
    if (!result.ok) return
    closeModal()
    navigate('/approval')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-6">
      <div className="my-2 flex w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-noble-border px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-noble-text">{selected.title}</h2>
              <span className="rounded bg-[#deecf9] px-2 py-0.5 text-xs font-semibold text-[#004578]">
                Formal Review
              </span>
            </div>
            <p className="mt-1 text-sm text-noble-muted">
              Review the milestone plan, then send to Formal Approval and Lock to Calendar.
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Refresh"
              className="rounded p-1.5 text-noble-blue hover:bg-[#deecf9]"
              onClick={() =>
                updateProject(selected.id, { projectStatus: selected.projectStatus })
              }
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Close"
              onClick={closeModal}
              className="rounded p-1.5 text-[#a4262c] hover:bg-[#fde7e9]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-noble-border px-5 py-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-noble-muted">Target</span>
            <div className="font-medium">{selected.targetCompletion}</div>
          </div>
          <div>
            <span className="text-xs font-semibold text-noble-muted">Formal Review By</span>
            <div className="font-medium">{selected.formalReviewBy}</div>
          </div>
        </div>

        <div className="max-h-[48vh] overflow-auto px-5 py-4">
          <h3 className="mb-2 text-sm font-bold text-noble-text">Milestone plan (read-only)</h3>
          <div className="overflow-x-auto rounded border border-noble-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f3f2f1] text-xs font-semibold uppercase tracking-wide text-noble-muted">
                <tr>
                  <th className="px-3 py-2">Milestone</th>
                  <th className="px-3 py-2">Responsible</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Why necessary</th>
                </tr>
              </thead>
              <tbody>
                {selected.steps.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-noble-muted">
                      No milestones — send back to Informal to build the plan.
                    </td>
                  </tr>
                )}
                {selected.steps.map((step) => (
                  <tr key={step.id} className="border-t border-noble-border">
                    <td className="px-3 py-2 font-medium">{step.name}</td>
                    <td className="px-3 py-2">{step.responsible}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {formatMonthDay(step.start)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatMonthDay(step.due)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={step.status} />
                    </td>
                    <td className="px-3 py-2 text-noble-muted">{step.necessary || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-noble-border px-5 py-4">
          <p className="text-xs text-noble-muted">
            Next: Formal Approval (Tax, Legal, Accounting, Finance) → Lock to Calendar.
          </p>
          <button
            type="button"
            disabled={!ready}
            onClick={sendToExecution}
            className="rounded bg-noble-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#a19f9d]"
          >
            Send to Formal Approval →
          </button>
        </div>
      </div>
    </div>
  )
}
