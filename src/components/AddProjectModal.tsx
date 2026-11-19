import { X } from 'lucide-react'
import { useState } from 'react'
import { useProjects } from '../context/ProjectContext'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddProjectModal({ open, onClose }: Props) {
  const { addProject } = useProjects()
  const today = new Date().toISOString().slice(0, 10)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [targetCompletion, setTargetCompletion] = useState(today)
  const [formalReviewBy, setFormalReviewBy] = useState(today)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function reset() {
    setTitle('')
    setStartDate(today)
    setTargetCompletion(today)
    setFormalReviewBy(today)
    setError(null)
  }

  function submit() {
    if (!title.trim()) {
      setError('Enter a project name.')
      return
    }
    if (formalReviewBy < startDate || formalReviewBy > targetCompletion) {
      setError('Formal review must fall between the start date and the target completion date.')
      return
    }
    if (targetCompletion < startDate) {
      setError('Target completion must be on or after the start date.')
      return
    }
    addProject({
      title: title.trim(),
      startDate,
      targetCompletion,
      formalReviewBy,
    })
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-noble-border px-5 py-4">
          <h2 className="text-lg font-bold text-noble-text">Add to pipeline</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              reset()
              onClose()
            }}
            className="rounded p-1.5 text-[#a4262c] hover:bg-[#fde7e9]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <label className="block text-xs font-semibold text-noble-muted">
            Project Name
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project name"
              className="mt-1 w-full rounded border border-noble-border px-3 py-2 text-sm text-noble-text"
              autoFocus
            />
          </label>
          <label className="block text-xs font-semibold text-noble-muted">
            Start Date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded border border-noble-border px-3 py-2 text-sm text-noble-text"
            />
          </label>
          <label className="block text-xs font-semibold text-noble-muted">
            Target Completion Date
            <input
              type="date"
              value={targetCompletion}
              onChange={(e) => setTargetCompletion(e.target.value)}
              className="mt-1 w-full rounded border border-noble-border px-3 py-2 text-sm text-noble-text"
            />
          </label>
          <label className="block text-xs font-semibold text-noble-muted">
            Formal Review By
            <input
              type="date"
              value={formalReviewBy}
              onChange={(e) => setFormalReviewBy(e.target.value)}
              className="mt-1 w-full rounded border border-noble-border px-3 py-2 text-sm text-noble-text"
            />
          </label>

          <p className="text-xs text-noble-muted">
            Starts at Informal Vetting. Formal review must fall between the start date and the
            target completion date.
          </p>

          {error && <p className="text-xs text-[#a4262c]">{error}</p>}
        </div>

        <div className="flex justify-center border-t border-noble-border px-5 py-4">
          <button
            type="button"
            onClick={submit}
            className="text-sm font-semibold text-noble-blue hover:underline"
          >
            Add to pipeline
          </button>
        </div>
      </div>
    </div>
  )
}
