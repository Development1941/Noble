import { RefreshCw, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../context/ProjectContext'
import { formatMonthDay } from '../lib/dates'
import type { ApprovalKey, ApprovalState } from '../types'
import { StatusBadge } from './StatusBadge'

const DEPT: { key: ApprovalKey; label: string }[] = [
  { key: 'tax', label: 'Tax' },
  { key: 'legal', label: 'Legal' },
  { key: 'accounting', label: 'Accounting' },
  { key: 'finance', label: 'Finance' },
]

function chipClass(state: ApprovalState) {
  if (state === 'Approved' || state === 'OK') {
    return 'bg-[#dff6dd] text-[#0b6a0b] border-[#107c10]'
  }
  return 'bg-[#fde7e9] text-[#a4262c] border-[#d13438]'
}

/** Formal Approval configure — dept tags, then Lock to Calendar. */
export function FormalApprovalModal() {
  const navigate = useNavigate()
  const { selected, closeModal, setApproval, setLocked, canLock, updateProject } = useProjects()

  if (!selected) return null

  const ready = canLock(selected)
  const pendingDepts = DEPT.filter(({ key }) => selected.approvals[key] !== 'Approved')

  function toggle(key: ApprovalKey) {
    if (!selected || selected.locked) return
    const cur = selected.approvals[key]
    const next: ApprovalState =
      key === 'window30'
        ? cur === 'OK'
          ? 'Pending'
          : 'OK'
        : cur === 'Approved'
          ? 'Pending'
          : 'Approved'
    setApproval(selected.id, key, next)
  }

  function lockToCalendar() {
    if (!selected || !ready) return
    setLocked(selected.id, true)
    closeModal()
    navigate('/calendar')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-4 sm:p-6">
      <div className="my-2 flex w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-noble-border px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-noble-text">{selected.title}</h2>
              <StatusBadge status={selected.projectStatus} />
              <span className="rounded bg-[#deecf9] px-2 py-0.5 text-xs font-semibold text-[#004578]">
                Formal Approval
              </span>
            </div>
            <p className="mt-1 text-sm text-noble-muted">
              Approve Tax, Legal, Accounting &amp; Finance. Then Lock to Calendar.
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

        <div className="border-b border-noble-border bg-[#faf9f8] px-5 py-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-noble-text">Formal Approval</h3>
            <span
              className={`text-xs font-semibold ${
                pendingDepts.length === 0 ? 'text-[#0b6a0b]' : 'text-[#a4262c]'
              }`}
            >
              {pendingDepts.length === 0
                ? 'All departments approved'
                : `${pendingDepts.length} pending in review: ${pendingDepts.map((d) => d.label).join(', ')}`}
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {DEPT.map(({ key, label }) => {
              const state = selected.approvals[key]
              const isPending = state !== 'Approved'
              return (
                <button
                  key={key}
                  type="button"
                  disabled={selected.locked}
                  onClick={() => toggle(key)}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left disabled:cursor-not-allowed ${chipClass(state)}`}
                >
                  <span className="text-sm font-semibold">{label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      isPending ? 'bg-[#a4262c]/15' : 'bg-[#107c10]/15'
                    }`}
                  >
                    {state}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="max-h-[32vh] overflow-auto px-5 py-4">
          <h3 className="mb-2 text-sm font-bold text-noble-text">Milestone plan</h3>
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

        <div className="space-y-3 border-t border-noble-border px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-noble-muted">
              30-day window
            </span>
            <button
              type="button"
              disabled={selected.locked}
              onClick={() => toggle('window30')}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed ${chipClass(selected.approvals.window30)}`}
            >
              {selected.approvals.window30 === 'OK' ? 'OK' : 'Pending'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className={selected.locked ? 'text-noble-muted' : 'font-semibold'}>
                Unlocked
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={selected.locked}
                onClick={() => {
                  if (selected.locked) setLocked(selected.id, false)
                  else if (ready) lockToCalendar()
                }}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  selected.locked ? 'bg-noble-blue' : 'bg-[#c8c6c4]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    selected.locked ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <span className={selected.locked ? 'font-semibold' : 'text-noble-muted'}>
                Lock to Calendar
              </span>
            </div>

            <button
              type="button"
              disabled={!ready}
              onClick={lockToCalendar}
              className="rounded bg-noble-navy px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#a19f9d]"
            >
              Lock to Calendar →
            </button>
          </div>

          {!ready && (
            <p className="text-xs text-[#a4262c]">
              {pendingDepts.length > 0
                ? `Still pending: ${pendingDepts.map((d) => d.label).join(', ')}.`
                : 'Clear the 30-day window before Lock to Calendar.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
