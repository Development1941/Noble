import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { sampleProjects } from '../data/sampleProjects'
import {
  nextStage,
  prevStage,
  type ApprovalKey,
  type ApprovalState,
  type ExecutionStep,
  type Project,
  type Stage,
} from '../types'

type ModalMode = 'plan' | 'review' | 'execution' | null

const FORMAL_KEYS: ApprovalKey[] = ['tax', 'legal', 'accounting', 'finance']
const EXEC_KEYS: ApprovalKey[] = ['cfo', 'gc']

interface ProjectContextValue {
  projects: Project[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  selected: Project | null
  modalMode: ModalMode
  setModalMode: (mode: ModalMode) => void
  openPlan: (id: string) => void
  openReview: (id: string) => void
  openExecution: (id: string) => void
  closeModal: () => void
  updateProject: (id: string, patch: Partial<Project>) => void
  moveStage: (id: string, direction: 'back' | 'next') => { ok: boolean; reason?: string }
  deleteProject: (id: string) => void
  addProject: (input?: {
    title?: string
    startDate?: string
    targetCompletion?: string
    formalReviewBy?: string
  }) => void
  upsertStep: (projectId: string, step: ExecutionStep) => void
  deleteStep: (projectId: string, stepId: string) => void
  setApproval: (projectId: string, key: ApprovalKey, state: ApprovalState) => void
  setLocked: (projectId: string, locked: boolean) => void
  canAdvanceToFormal: (project: Project) => boolean
  canAdvanceToExecution: (project: Project) => boolean
  canLock: (project: Project) => boolean
  pipelineProjects: Project[]
  executionProjects: Project[]
  calendarProjects: Project[]
  counts: { vetting: number; drafting: number; locked: number }
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

function stampStageDate(project: Project, stage: Stage): Project {
  const today = new Date().toISOString().slice(0, 10)
  const stageDates = { ...project.stageDates }
  switch (stage) {
    case 'New':
      stageDates.new = today
      break
    case 'Informal Vetting':
      stageDates.informal = today
      break
    case 'Formal Vetting':
      stageDates.formal = today
      break
    case 'Execution':
      stageDates.execution = today
      break
    case 'Locked in':
      stageDates.lockedIn = today
      break
  }
  return { ...project, stage, stageDates }
}

function statusForStage(stage: Stage): string {
  switch (stage) {
    case 'New':
      return 'Created by Tax'
    case 'Informal Vetting':
      return 'Building plan'
    case 'Formal Vetting':
      return 'In formal review'
    case 'Execution':
      return 'Still drafting'
    case 'Locked in':
      return 'On Track'
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(sampleProjects)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>(null)

  const closeModal = useCallback(() => {
    setModalMode(null)
    setSelectedId(null)
  }, [])

  const openPlan = useCallback((id: string) => {
    setSelectedId(id)
    setModalMode('plan')
  }, [])

  const openReview = useCallback((id: string) => {
    setSelectedId(id)
    setModalMode('review')
  }, [])

  const openExecution = useCallback((id: string) => {
    setSelectedId(id)
    setModalMode('execution')
  }, [])

  const updateProject = useCallback((id: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const canAdvanceToFormal = useCallback((project: Project) => project.steps.length >= 1, [])

  const canAdvanceToExecution = useCallback((project: Project) => {
    const deptsOk = FORMAL_KEYS.every((k) => project.approvals[k] === 'Approved')
    const windowOk =
      project.approvals.window30 === 'OK' || project.approvals.window30 === 'Approved'
    return deptsOk && windowOk && project.steps.length >= 1
  }, [])

  const canLock = useCallback((project: Project) => {
    const execOk = EXEC_KEYS.every((k) => project.approvals[k] === 'Approved')
    return canAdvanceToExecution(project) && execOk
  }, [canAdvanceToExecution])

  const moveStage = useCallback(
    (id: string, direction: 'back' | 'next') => {
      const project = projects.find((p) => p.id === id)
      if (!project) return { ok: false, reason: 'Project not found' }

      if (direction === 'next' && project.stage === 'Informal Vetting') {
        if (!canAdvanceToFormal(project)) {
          return {
            ok: false,
            reason: 'Add at least one milestone before advancing to Formal Vetting.',
          }
        }
      }

      if (direction === 'next' && project.stage === 'Formal Vetting') {
        if (!canAdvanceToExecution(project)) {
          return {
            ok: false,
            reason:
              'Approve Tax, Legal, Accounting, Finance and clear the 30-day window before Execution.',
          }
        }
      }

      if (direction === 'next' && project.stage === 'Execution') {
        return {
          ok: false,
          reason: 'Use Configure — CFO & GC must approve, then lock to Calendar.',
        }
      }

      const target =
        direction === 'next' ? nextStage(project.stage) : prevStage(project.stage)
      if (!target) return { ok: false, reason: 'No further stage in that direction.' }

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p
          const updated = stampStageDate(p, target)
          if (target === 'Locked in') {
            return { ...updated, locked: true, projectStatus: 'On Track' }
          }
          return {
            ...updated,
            locked: false,
            projectStatus: statusForStage(target),
          }
        }),
      )
      return { ok: true }
    },
    [projects, canAdvanceToFormal, canAdvanceToExecution],
  )

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id))
      if (selectedId === id) closeModal()
    },
    [selectedId, closeModal],
  )

  const addProject = useCallback((input?: {
    title?: string
    startDate?: string
    targetCompletion?: string
    formalReviewBy?: string
  }) => {
    const id = String(Date.now())
    const today = new Date().toISOString().slice(0, 10)
    const startDate = input?.startDate ?? today
    const project: Project = {
      id,
      title: input?.title?.trim() || 'New Project',
      stage: 'Informal Vetting',
      startDate,
      targetCompletion: input?.targetCompletion ?? today,
      formalReviewBy: input?.formalReviewBy ?? today,
      projectStatus: 'Building plan',
      locked: false,
      approvals: {
        tax: 'Pending',
        legal: 'Pending',
        accounting: 'Pending',
        finance: 'Pending',
        cfo: 'Pending',
        gc: 'Pending',
        window30: 'OK',
      },
      steps: [],
      stageDates: { new: startDate, informal: startDate },
    }
    setProjects((prev) => [project, ...prev])
  }, [])

  const upsertStep = useCallback((projectId: string, step: ExecutionStep) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p
        const exists = p.steps.some((s) => s.id === step.id)
        const steps = exists
          ? p.steps.map((s) => (s.id === step.id ? step : s))
          : [...p.steps, step]
        return { ...p, steps }
      }),
    )
  }, [])

  const deleteStep = useCallback((projectId: string, stepId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, steps: p.steps.filter((s) => s.id !== stepId) } : p,
      ),
    )
  }, [])

  const setApproval = useCallback(
    (projectId: string, key: ApprovalKey, state: ApprovalState) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, approvals: { ...p.approvals, [key]: state } }
            : p,
        ),
      )
    },
    [],
  )

  const setLocked = useCallback(
    (projectId: string, locked: boolean) => {
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p
          if (locked) {
            if (!canLock(p)) return p
            return stampStageDate(
              { ...p, locked: true, projectStatus: 'On Track' },
              'Locked in',
            )
          }
          return {
            ...stampStageDate(p, 'Execution'),
            locked: false,
            projectStatus: 'Unlocked — re-approve',
            approvals: {
              ...p.approvals,
              cfo: 'Pending',
              gc: 'Pending',
            },
          }
        }),
      )
      if (locked) {
        setModalMode(null)
        setSelectedId(null)
      }
    },
    [canLock],
  )

  const pipelineProjects = useMemo(
    () =>
      projects.filter((p) =>
        ['New', 'Informal Vetting', 'Formal Vetting'].includes(p.stage),
      ),
    [projects],
  )

  const executionProjects = useMemo(
    () => projects.filter((p) => p.stage === 'Execution'),
    [projects],
  )

  const calendarProjects = useMemo(
    () => projects.filter((p) => p.stage === 'Locked in' || p.locked),
    [projects],
  )

  const counts = useMemo(
    () => ({
      vetting: pipelineProjects.length,
      drafting: executionProjects.length,
      locked: calendarProjects.length,
    }),
    [pipelineProjects, executionProjects, calendarProjects],
  )

  const selected = useMemo(
    () => projects.find((p) => p.id === selectedId) ?? null,
    [projects, selectedId],
  )

  const value: ProjectContextValue = {
    projects,
    selectedId,
    setSelectedId,
    selected,
    modalMode,
    setModalMode,
    openPlan,
    openReview,
    openExecution,
    closeModal,
    updateProject,
    moveStage,
    deleteProject,
    addProject,
    upsertStep,
    deleteStep,
    setApproval,
    setLocked,
    canAdvanceToFormal,
    canAdvanceToExecution,
    canLock,
    pipelineProjects,
    executionProjects,
    calendarProjects,
    counts,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProjects() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider')
  return ctx
}
