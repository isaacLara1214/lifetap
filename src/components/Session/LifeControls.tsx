type Props = {
  onChange: (delta: number) => void
}

export function LifeControls({ onChange }: Props) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <button
        onClick={() => onChange(-10)}
        className="w-12 h-12 bg-red-600 hover:bg-red-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        -10
      </button>
      <button
        onClick={() => onChange(-5)}
        className="w-12 h-12 bg-red-600 hover:bg-red-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        -5
      </button>
      <button
        onClick={() => onChange(-1)}
        className="w-12 h-12 bg-red-600 hover:bg-red-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        -1
      </button>
      <button
        onClick={() => onChange(1)}
        className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        +1
      </button>
      <button
        onClick={() => onChange(5)}
        className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        +5
      </button>
      <button
        onClick={() => onChange(10)}
        className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 border-2 border-black text-white text-xl font-bold rounded-lg transition-colors"
      >
        +10
      </button>
    </div>
  )
}
