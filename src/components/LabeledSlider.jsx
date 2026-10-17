/**
 * LabeledSlider — CurioLabs Editorial styled range slider for all experiments.
 * Props:
 * - label: string
 * - value: number
 * - onChange: (value) => void
 * - min, max, step: numbers
 * - unit: string (e.g. 'V', 'Ω', '°C')
 * - accentColor: CSS color string
 * - disabled: boolean
 */
export default function LabeledSlider({
  label = 'Value',
  value = 50,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  accentColor = '#221611',
  disabled = false,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-display font-bold text-[#221611] tracking-wide">{label}</label>
        <span 
          className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#221611]/20 text-[#221611] shadow-2xs"
        >
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ '--slider-color': accentColor }}
      />
      <div className="flex justify-between text-[10px] font-mono font-medium text-[#754F40]">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
