/**
 * LabeledSlider — consistent styled range slider for all experiments.
 * Props:
 * - label: string
 * - value: number
 * - onChange: (value) => void
 * - min, max, step: numbers
 * - unit: string (e.g. 'V', 'Ω', '°C')
 * - accentColor: CSS color string (e.g. '#10b981')
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
  accentColor = '#10b981',
  disabled = false,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span 
          className="text-sm font-bold px-2 py-0.5 rounded-md"
          style={{ backgroundColor: accentColor + '15', color: accentColor }}
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
        className="w-full h-1.5 rounded-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ '--slider-color': accentColor }}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}
