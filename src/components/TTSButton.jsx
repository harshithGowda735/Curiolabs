import { Volume2, VolumeX } from 'lucide-react'
import { useTTS } from '../hooks/useTTS'

/**
 * TTSButton — speaker icon button for text-to-speech.
 * Props:
 * - text: string to read aloud
 * - size: 'sm' | 'md'
 */
export default function TTSButton({ text, size = 'md' }) {
  const { toggle, isSpeaking } = useTTS()

  const sizeClasses = size === 'sm' 
    ? 'w-7 h-7' 
    : 'w-8 h-8'
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      onClick={() => toggle(text)}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all ${
        isSpeaking 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-green-100 text-green-600 hover:bg-green-200'
      }`}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
    >
      {isSpeaking ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
    </button>
  )
}
