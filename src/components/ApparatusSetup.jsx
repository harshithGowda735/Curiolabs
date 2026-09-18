import { useState } from 'react'
import { RotateCcw, Check, Sparkles, Play } from 'lucide-react'

/**
 * Reusable Drag & Drop Apparatus Setup Component
 * Matches the user's uploaded laboratory apparatus layout.
 * Supports:
 * - HTML5 Desktop Drag-and-Drop
 * - Click-to-Place for touchscreens & trackpads
 * - Visual dashed target dropzones with apparatus silhouettes
 * - Real-time placement validation & "Start Experiment" unlocking
 */
export default function ApparatusSetup({
  title = 'Setup Your Apparatus',
  apparatusList = [],
  targets = [],
  placedItems = {},
  onPlace = () => {},
  onRemove = () => {},
  onReset = () => {},
  onStart = () => {},
  isStarted = false,
  startLabel = 'Start Experiment',
  hint = 'Drag each piece of apparatus from the tray onto its marked position on the bench.'
}) {
  const [draggedItemId, setDraggedItemId] = useState(null)
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [dropFeedback, setDropFeedback] = useState(null)

  const isAllPlaced = targets.every(target => placedItems[target.id])

  // Drag handlers
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item.id)
    setDraggedItemId(item.id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, target) => {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId
    if (!itemId) return

    if (target.accepts === itemId) {
      onPlace(target.id, itemId)
      setDropFeedback({ targetId: target.id, valid: true })
      setTimeout(() => setDropFeedback(null), 1200)
    } else {
      setDropFeedback({ targetId: target.id, valid: false })
      setTimeout(() => setDropFeedback(null), 1200)
    }
    setDraggedItemId(null)
    setSelectedItemId(null)
  }

  // Click-to-place handler (Touch & Click friendly)
  const handleItemClick = (item) => {
    // If already placed, do nothing or find target
    const targetWithItem = Object.entries(placedItems).find(([_, id]) => id === item.id)
    if (targetWithItem) {
      onRemove(targetWithItem[0])
      return
    }

    // Auto-place into matching target if empty
    const matchingTarget = targets.find(t => t.accepts === item.id)
    if (matchingTarget) {
      onPlace(matchingTarget.id, item.id)
      setDropFeedback({ targetId: matchingTarget.id, valid: true })
      setTimeout(() => setDropFeedback(null), 1200)
      setSelectedItemId(null)
    } else {
      setSelectedItemId(item.id)
    }
  }

  const handleTargetClick = (target) => {
    if (selectedItemId) {
      if (target.accepts === selectedItemId) {
        onPlace(target.id, selectedItemId)
        setDropFeedback({ targetId: target.id, valid: true })
        setTimeout(() => setDropFeedback(null), 1200)
      } else {
        setDropFeedback({ targetId: target.id, valid: false })
        setTimeout(() => setDropFeedback(null), 1200)
      }
      setSelectedItemId(null)
    } else if (placedItems[target.id]) {
      // Remove item on click
      onRemove(target.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col gap-4 font-sans">
      {/* Header: Title + Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition-colors border border-rose-200/80"
          title="Reset Apparatus Setup"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Apparatus Tray Box */}
      <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 sm:p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">Apparatus:</span>
          <span className="text-[11px] text-slate-500">
            {Object.keys(placedItems).length} of {targets.length} Placed
          </span>
        </div>

        {/* Tray Items Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {apparatusList.map((item) => {
            const isPlaced = Object.values(placedItems).includes(item.id)
            const isSelected = selectedItemId === item.id

            return (
              <div
                key={item.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleItemClick(item)}
                className={`group flex flex-col items-center justify-between p-2 rounded-xl border transition-all cursor-pointer select-none text-center ${
                  isPlaced
                    ? 'bg-slate-100/80 border-slate-200 opacity-40 cursor-default'
                    : isSelected
                    ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200/90 hover:border-emerald-400 hover:shadow-xs active:scale-95'
                }`}
              >
                {/* Apparatus Icon Box */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-slate-700 group-hover:text-emerald-600 transition-colors">
                  {item.icon}
                </div>
                {/* Label */}
                <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 leading-tight mt-1 line-clamp-1">
                  {item.name}
                </span>
                {isPlaced && (
                  <span className="text-[9px] font-bold text-emerald-600 mt-0.5 flex items-center gap-0.5">
                    <Check size={10} /> Placed
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bench Drop Zone Canvas */}
      <div className="relative w-full h-[320px] sm:h-[350px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-50/70 via-sky-50/30 to-emerald-50/40 border border-slate-200/80 p-3 shadow-inner">
        {/* Subtle Laboratory Bench Depth Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.75px,transparent_0.75px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-slate-200/60 to-transparent pointer-events-none" />

        {/* Drop Targets on the Canvas */}
        {targets.map((target) => {
          const isPlaced = Boolean(placedItems[target.id])
          const feedback = dropFeedback?.targetId === target.id ? dropFeedback : null

          return (
            <div
              key={target.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, target)}
              onClick={() => handleTargetClick(target)}
              style={{
                position: 'absolute',
                left: target.x,
                top: target.y,
                width: target.width,
                height: target.height,
                transform: 'translate(-50%, -50%)'
              }}
              className={`flex flex-col items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer ${
                isPlaced
                  ? 'border-2 border-emerald-400/80 bg-emerald-50/70 shadow-sm'
                  : feedback && !feedback.valid
                  ? 'border-2 border-dashed border-rose-400 bg-rose-50/60 animate-shake'
                  : selectedItemId === target.accepts
                  ? 'border-2 border-dashed border-emerald-500 bg-emerald-100/50 animate-pulse'
                  : target.className || 'border-2 border-dashed border-slate-300/90 bg-white/50 hover:bg-white/80 hover:border-slate-400'
              }`}
            >
              {isPlaced ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 relative group">
                  {target.renderPlaced ? (
                    target.renderPlaced()
                  ) : (
                    <div className="text-emerald-700 flex flex-col items-center justify-center">
                      <span className="font-semibold text-xs">{target.label}</span>
                      <Check size={16} className="text-emerald-500 mt-1" />
                    </div>
                  )}
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    ✓
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                  <span className="text-[11px] font-semibold text-slate-500/90 lowercase tracking-wide">
                    {target.label}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">drop here</span>
                </div>
              )}
            </div>
          )
        })}

        {/* Step Guidance Overlay at bottom of canvas */}
        <div className="absolute bottom-2 inset-x-3 text-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-600 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
            {isAllPlaced ? 'Apparatus fully assembled! Ready to start.' : hint}
          </span>
        </div>
      </div>

      {/* Action Button: Start Experiment */}
      <button
        onClick={onStart}
        disabled={!isAllPlaced}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
          isStarted
            ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10'
            : isAllPlaced
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 hover:scale-[1.01] cursor-pointer'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isStarted ? (
          <>
            <RotateCcw size={16} />
            <span>Reset & Run Again</span>
          </>
        ) : (
          <>
            <Play size={16} className={isAllPlaced ? 'fill-current' : ''} />
            <span>{isAllPlaced ? startLabel : 'Place All Apparatus to Start'}</span>
          </>
        )}
      </button>
    </div>
  )
}
