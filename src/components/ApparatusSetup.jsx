import { useState } from 'react'
import { RotateCcw, Check, Sparkles, Play } from 'lucide-react'

/**
 * Reusable Drag & Drop Apparatus Setup Component
 * Matches CurioLabs design palette with deep espresso (#221611), warm cream (#FAF5EB),
 * and electric lime (#A4C93B).
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
    const targetWithItem = Object.entries(placedItems).find(([_, id]) => id === item.id)
    if (targetWithItem) {
      onRemove(targetWithItem[0])
      return
    }

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
      onRemove(target.id)
    }
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-[#221611] shadow-[3px_3px_0px_#221611] p-4 sm:p-5 flex flex-col gap-4 font-sans">
      {/* Header: Title + Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-[#221611] uppercase tracking-wide">
          {title}
        </h3>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5EB] hover:bg-white text-[#221611] font-bold text-xs transition-all border-2 border-[#221611] shadow-xs cursor-pointer active:scale-95"
          title="Reset Apparatus Setup"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* Apparatus Tray Box */}
      <div className="bg-[#FAF5EB] border-2 border-[#221611]/15 rounded-2xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black uppercase text-[#221611]">Apparatus Inventory:</span>
          <span className="text-xs font-mono font-bold bg-[#221611] text-[#A4C93B] px-2.5 py-0.5 rounded-full">
            {Object.keys(placedItems).length} / {targets.length} Placed
          </span>
        </div>

        {/* Tray Items Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {apparatusList.map((item) => {
            const isPlaced = Object.values(placedItems).includes(item.id)
            const isSelected = selectedItemId === item.id

            return (
              <div
                key={item.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleItemClick(item)}
                className={`group flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-pointer select-none text-center ${
                  isPlaced
                    ? 'bg-slate-100 border-[#221611]/20 opacity-40 cursor-default'
                    : isSelected
                    ? 'bg-[#A4C93B]/20 border-[#221611] shadow-md ring-2 ring-[#A4C93B]'
                    : 'bg-white border-[#221611]/25 hover:border-[#221611] hover:shadow-[2px_2px_0px_#221611] active:scale-95'
                }`}
              >
                {/* Apparatus Icon Box */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-[#221611] transition-transform group-hover:scale-110">
                  {item.icon}
                </div>
                {/* Label */}
                <span className="text-[10px] sm:text-[11px] font-bold text-[#221611] leading-tight mt-1 line-clamp-1">
                  {item.name}
                </span>
                {isPlaced && (
                  <span className="text-[9px] font-mono font-bold text-[#221611] bg-[#A4C93B] px-1.5 py-0.2 rounded mt-1 flex items-center gap-0.5">
                    <Check size={9} /> OK
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bench Drop Zone Canvas */}
      <div className="relative w-full h-[320px] sm:h-[350px] rounded-2xl overflow-hidden bg-[#FAF5EB] border-2 border-[#221611] p-3 shadow-inner">
        {/* Subtle Laboratory Bench Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#221611_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#221611]/10 to-transparent pointer-events-none border-t border-[#221611]/10" />

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
                  ? 'border-2 border-[#221611] bg-[#A4C93B]/25 shadow-sm'
                  : feedback && !feedback.valid
                  ? 'border-2 border-dashed border-rose-500 bg-rose-50 animate-shake'
                  : selectedItemId === target.accepts
                  ? 'border-2 border-dashed border-[#221611] bg-[#A4C93B]/30 animate-pulse'
                  : target.className || 'border-2 border-dashed border-[#221611]/30 bg-white/70 hover:bg-white hover:border-[#221611]'
              }`}
            >
              {isPlaced ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-1 relative group">
                  {target.renderPlaced ? (
                    target.renderPlaced()
                  ) : (
                    <div className="text-[#221611] flex flex-col items-center justify-center">
                      <span className="font-bold text-xs">{target.label}</span>
                      <Check size={16} className="text-[#221611] mt-1" />
                    </div>
                  )}
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#A4C93B] text-[#221611] border-2 border-[#221611] flex items-center justify-center text-[10px] font-black shadow-xs">
                    ✓
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-1 pointer-events-none">
                  <span className="text-[11px] font-bold text-[#221611]/70 uppercase tracking-wide">
                    {target.label}
                  </span>
                  <span className="text-[9px] text-[#221611]/50 font-mono mt-0.5">DROP HERE</span>
                </div>
              )}
            </div>
          )
        })}

        {/* Step Guidance Overlay at bottom of canvas */}
        <div className="absolute bottom-2.5 inset-x-3 text-center pointer-events-none">
          <span className="text-[11px] font-bold text-[#221611] bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full border-2 border-[#221611] shadow-[2px_2px_0px_#221611]">
            {isAllPlaced ? '✓ Apparatus fully assembled! Ready to start.' : hint}
          </span>
        </div>
      </div>

      {/* Action Button: Start Experiment */}
      <button
        onClick={onStart}
        disabled={!isAllPlaced}
        className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 border-2 border-[#221611] ${
          isStarted
            ? 'bg-[#221611] hover:bg-[#332219] text-[#FAF5EB] shadow-[3px_3px_0px_#221611] cursor-pointer'
            : isAllPlaced
            ? 'bg-[#A4C93B] hover:bg-[#93b533] text-[#221611] shadow-[3px_3px_0px_#221611] hover:shadow-[1px_1px_0px_#221611] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
            : 'bg-[#FAF5EB] text-[#221611]/30 border-[#221611]/20 cursor-not-allowed opacity-60'
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
