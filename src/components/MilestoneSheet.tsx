import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'
import { formatMonthDay } from '../lib/dates'
import type { ExecutionStep, StepStatus } from '../types'
import { StatusBadge } from './StatusBadge'

const OWNERS = ['Carey Fraser', 'David D.', 'Lisa', 'Tax', 'Legal', 'Accounting', 'Finance', 'MS']
const STATUSES: StepStatus[] = ['Pending', 'On Track', 'At Risk', 'Blocked', 'Completed']

interface Props {
  readOnly?: boolean
  title?: string
}

export function MilestoneSheet({ readOnly = false, title }: Props) {
  const { selected, closeModal, upsertStep, deleteStep, updateProject } = useProjects()
  const [draft, setDraft] = useState({
    name: '',
    responsible: OWNERS[0],
    start: new Date().toISOString().slice(0, 10),
    due: new Date().toISOString().slice(0, 10),
    necessary: '',
    status: 'On Track' as StepStatus,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!selected) return null

  function addOrSave() {
    if (!selected || !draft.name.trim()) return
    const step: ExecutionStep = {
      id: editingId ?? `${selected.id}-${Date.now()}`,
      name: draft.name.trim(),
      responsible: draft.responsible,
      start: draft.start,
      due: draft.due,
      status: draft.status,
      necessary: draft.necessary.trim(),
    }
    upsertStep(selected.id, step)
    setEditingId(null)
    setDraft({
      name: '',
      responsible: OWNERS[0],
      start: new Date().toISOString().slice(0, 10),
      due: new Date().toISOString().slice(0, 10),
      necessary: '',
      status: 'On Track',
    })
  }

  function startEdit(step: ExecutionStep) {
    setEditingId(step.id)
    setDraft({
      name: step.name,
      responsible: step.responsible,
      start: step.start,
      due: step.due,
      necessary: step.necessary,
      status: step.status,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-8">
      <div className="my-4 w-full max-w-5xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-noble-border px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-noble-text">{selected.title}</h2>
              <StatusBadge status={selected.projectStatus} />
            </div>
            <p className="mt-1 text-sm text-noble-muted">
              {title ??
                (readOnly
                  ? 'Plan preview (read-only).'
                  : 'Informal Vetting — build milestones, then advance to Formal when ready.')}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={closeModal}
            className="rounded p-1.5 text-[#a4262c] hover:bg-[#fde7e9]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-noble-border px-5 py-3">
          <label className="text-xs font-semibold text-noble-muted">
            Target
            <input
              type="date"
              value={selected.targetCompletion}
              disabled={readOnly}
              onChange={(e) =>
                updateProject(selected.id, { targetCompletion: e.target.value })
              }
              className="mt-1 block rounded border border-noble-border px-2 py-1.5 text-sm text-noble-text disabled:bg-[#f3f2f1]"
            />
          </label>
          <label className="text-xs font-semibold text-noble-muted">
            Formal review
            <input
              type="date"
              value={selected.formalReviewBy}
              disabled={readOnly}
              onChange={(e) =>
                updateProject(selected.id, { formalReviewBy: e.target.value })
              }
              className="mt-1 block rounded border border-noble-border px-2 py-1.5 text-sm text-noble-text disabled:bg-[#f3f2f1]"
            />
          </label>
        </div>

        <div className="px-5 py-4">
          <h3 className="mb-2 text-sm font-bold text-noble-text">
            {readOnly ? 'Milestone plan (read-only)' : 'Milestone plan (define the steps)'}
          </h3>

          <div className="overflow-x-auto rounded border border-noble-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f3f2f1] text-xs font-semibold uppercase tracking-wide text-noble-muted">
                <tr>
                  <th className="px-3 py-2">Milestone</th>
                  <th className="px-3 py-2">Responsible</th>
                  <th className="px-3 py-2">Start</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Why this step is necessary</th>
                  {!readOnly && <th className="px-3 py-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {selected.steps.length === 0 && (
                  <tr>
                    <td
                      colSpan={readOnly ? 6 : 7}
                      className="px-3 py-6 text-center text-noble-muted"
                    >
                      No milestones yet.
                      {!readOnly && ' Add at least one before advancing to Formal.'}
                    </td>
                  </tr>
                )}
                {selected.steps.map((step) => (
                  <tr key={step.id} className="border-t border-noble-border">
                    <td className="px-3 py-2 font-medium">{step.name}</td>
                    <td className="px-3 py-2">{step.responsible}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatMonthDay(step.start)}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{formatMonthDay(step.due)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={step.status} />
                    </td>
                    <td className="px-3 py-2 text-noble-muted">{step.necessary || '—'}</td>
                    {!readOnly && (
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="mr-2 text-noble-blue hover:underline"
                          onClick={() => startEdit(step)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-[#a4262c] hover:underline"
                          onClick={() => deleteStep(selected.id, step.id)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!readOnly && (
            <div className="mt-3 grid gap-2 rounded border border-dashed border-noble-border bg-[#faf9f8] p-3 md:grid-cols-6">
              <input
                placeholder="Step name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                className="rounded border border-noble-border px-2 py-1.5 text-sm md:col-span-2"
              />
              <select
                value={draft.responsible}
                onChange={(e) => setDraft((d) => ({ ...d, responsible: e.target.value }))}
                className="rounded border border-noble-border px-2 py-1.5 text-sm"
              >
                {OWNERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <input
                type="date"
                value={draft.start}
                onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                className="rounded border border-noble-border px-2 py-1.5 text-sm"
              />
              <input
                type="date"
                value={draft.due}
                onChange={(e) => setDraft((d) => ({ ...d, due: e.target.value }))}
                className="rounded border border-noble-border px-2 py-1.5 text-sm"
              />
              <select
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, status: e.target.value as StepStatus }))
                }
                className="rounded border border-noble-border px-2 py-1.5 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                placeholder="Why this step is necessary"
                value={draft.necessary}
                onChange={(e) => setDraft((d) => ({ ...d, necessary: e.target.value }))}
                className="rounded border border-noble-border px-2 py-1.5 text-sm md:col-span-4"
              />
              <button
                type="button"
                onClick={addOrSave}
                className="inline-flex items-center justify-center gap-1 rounded bg-noble-blue px-3 py-1.5 text-sm font-semibold text-white hover:bg-noble-blue-dark md:col-span-2"
              >
                {editingId ? (
                  'Save step'
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add Step
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setDraft({
                      name: '',
                      responsible: OWNERS[0],
                      start: new Date().toISOString().slice(0, 10),
                      due: new Date().toISOString().slice(0, 10),
                      necessary: '',
                      status: 'On Track',
                    })
                  }}
                  className="inline-flex items-center justify-center gap-1 rounded border border-noble-border px-3 py-1.5 text-sm"
                >
                  <Trash2 className="h-4 w-4" /> Cancel edit
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
