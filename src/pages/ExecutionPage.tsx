import { Trash2 } from 'lucide-react'
import { StatusBadge } from '../components/StatusBadge'
import { useProjects } from '../context/ProjectContext'
import { formatShortDate } from '../lib/dates'

const COLS =
  'grid grid-cols-[minmax(220px,2fr)_140px_80px_minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-x-4'

export function ExecutionPage() {
  const { executionProjects, deleteProject, openExecution, updateProject } = useProjects()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-noble-text">Execution Plan</h1>
        <p className="mt-1 text-sm text-noble-muted">
          After Formal department approvals. Configure milestones, then CFO &amp; GC lock to Calendar.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-noble-border bg-white shadow-sm">
        <div
          className={`${COLS} border-b border-noble-border bg-[#f3f2f1] px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-noble-muted`}
        >
          <div>Project</div>
          <div>Target Completion</div>
          <div className="text-center">Steps</div>
          <div>Project Status</div>
          <div className="text-right">Action</div>
        </div>

        {executionProjects.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-noble-muted">
            No projects in Execution. Complete Formal department approvals from Pipeline.
          </div>
        )}

        {executionProjects.map((project) => (
          <div
            key={project.id}
            className={`${COLS} border-b border-noble-border px-4 py-3 last:border-b-0`}
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-noble-text">{project.title}</div>
              <div className="mt-0.5 text-xs text-noble-muted">
                Formal review {formatShortDate(project.formalReviewBy)}
              </div>
            </div>

            <input
              type="date"
              value={project.targetCompletion}
              onChange={(e) => updateProject(project.id, { targetCompletion: e.target.value })}
              className="w-full rounded border border-noble-border bg-white px-2 py-1.5 text-sm text-noble-text"
            />

            <div className="text-center text-sm font-semibold text-noble-text">
              {project.steps.length}
            </div>

            <div>
              <StatusBadge status={project.projectStatus} />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => openExecution(project.id)}
                className="text-sm font-semibold text-noble-blue hover:underline"
              >
                Configure
              </button>
              <button
                type="button"
                aria-label={`Delete ${project.title}`}
                className="rounded p-1.5 text-[#a4262c] hover:bg-[#fde7e9]"
                onClick={() => {
                  if (window.confirm(`Delete ${project.title}?`)) deleteProject(project.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
