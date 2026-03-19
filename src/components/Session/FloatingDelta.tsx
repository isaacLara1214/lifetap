type Props = {
  delta: number | null
  isFading: boolean
  onFadeComplete: () => void
}

export function FloatingDelta({ delta, isFading, onFadeComplete }: Props) {
  if (delta === null) return null

  const isPositive = delta > 0
  const displayValue = isPositive ? `+${delta}` : `${delta}`

  return (
    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-16 pointer-events-none overflow-visible">
      <span
        className={`text-3xl font-bold whitespace-nowrap ${
          isFading ? 'animate-float-up' : ''
        } ${
          isPositive ? 'text-emerald-300' : 'text-red-300'
        }`}
        onAnimationEnd={() => {
          if (isFading) {
            onFadeComplete()
          }
        }}
      >
        {displayValue}
      </span>
    </div>
  )
}
