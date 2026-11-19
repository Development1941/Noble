import type { StepStatus } from '../types'

const STYLES: Record<string, string> = {
  Completed: 'bg-[#dff6dd] text-[#0b6a0b]',
  'On Track': 'bg-[#deecf9] text-[#004578]',
  'At Risk': 'bg-[#fff4ce] text-[#6c5700]',
  Blocked: 'bg-[#fde7e9] text-[#a4262c]',
  Pending: 'bg-[#fde7e9] text-[#a4262c]',
  'Still drafting': 'bg-[#f3f2f1] text-[#605e5c]',
  'Awaiting approvals': 'bg-[#fde7e9] text-[#a4262c]',
  Blackout: 'bg-[#e1dfdd] text-[#323130]',
}

export function StatusBadge({ status }: { status: StepStatus | string }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${STYLES[status] ?? STYLES.Pending}`}
    >
      {status}
    </span>
  )
}
