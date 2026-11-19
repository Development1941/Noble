export type Stage =
  | 'New'
  | 'Informal Vetting'
  | 'Formal Vetting'
  | 'Execution'
  | 'Locked in'

export type StepStatus = 'Completed' | 'On Track' | 'At Risk' | 'Blocked' | 'Pending'

export type ApprovalKey =
  | 'tax'
  | 'legal'
  | 'accounting'
  | 'finance'
  | 'cfo'
  | 'gc'
  | 'window30'

export type ApprovalState = 'Approved' | 'Pending' | 'OK'

export interface ExecutionStep {
  id: string
  name: string
  responsible: string
  start: string
  due: string
  status: StepStatus
  necessary: string
}

export interface StageDates {
  new?: string
  informal?: string
  formal?: string
  execution?: string
  lockedIn?: string
}

export interface Project {
  id: string
  title: string
  stage: Stage
  startDate: string
  targetCompletion: string
  formalReviewBy: string
  projectStatus: string
  locked: boolean
  approvals: Record<ApprovalKey, ApprovalState>
  steps: ExecutionStep[]
  stageDates: StageDates
  calendarLabel?: string
}

export interface NewProjectInput {
  title: string
  startDate: string
  targetCompletion: string
  formalReviewBy: string
}

export const STAGES: Stage[] = [
  'New',
  'Informal Vetting',
  'Formal Vetting',
  'Execution',
  'Locked in',
]

export const STAGE_LABELS: Record<Stage, string> = {
  New: 'New',
  'Informal Vetting': 'Informal Vetting',
  'Formal Vetting': 'Formal Vetting',
  Execution: 'Execution',
  'Locked in': 'Locked In',
}

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage)
}

export function prevStage(stage: Stage): Stage | null {
  const i = stageIndex(stage)
  return i > 0 ? STAGES[i - 1] : null
}

export function nextStage(stage: Stage): Stage | null {
  const i = stageIndex(stage)
  return i >= 0 && i < STAGES.length - 1 ? STAGES[i + 1] : null
}

export function shortStageLabel(stage: Stage): string {
  switch (stage) {
    case 'New':
      return 'New'
    case 'Informal Vetting':
      return 'Informal'
    case 'Formal Vetting':
      return 'Formal'
    case 'Execution':
      return 'Execution'
    case 'Locked in':
      return 'Locked In'
  }
}
