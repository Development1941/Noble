export function NobleLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims =
    size === 'sm' ? 'h-7 w-16 text-[10px]' : size === 'lg' ? 'h-12 w-28 text-sm' : 'h-9 w-20 text-xs'

  return (
    <div
      className={`relative inline-flex items-center justify-center ${dims}`}
      aria-label="Noble"
    >
      <svg viewBox="0 0 120 48" className="absolute inset-0 h-full w-full" aria-hidden>
        <ellipse cx="60" cy="24" rx="56" ry="22" fill="#00205b" />
        <ellipse cx="60" cy="24" rx="52" ry="19" fill="none" stroke="#ffd100" strokeWidth="2.5" />
      </svg>
      <span className="relative z-10 font-bold tracking-[0.12em] text-[#ffd100]">NOBLE</span>
    </div>
  )
}
