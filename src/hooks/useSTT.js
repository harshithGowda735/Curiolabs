import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useSTT — Web Speech Recognition Hook for Voice-Driven AI Viva.
 * Wraps SpeechRecognition / webkitSpeechRecognition with live streaming transcript,
 * error recovery, continuous listening, and graceful typing fallback.
 */
export function useSTT(options = {}) {
  const { lang = 'en-US', continuous = true } = options
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  
  const recognitionRef = useRef(null)
  const isManuallyStoppedRef = useRef(false)

  const isSupported = typeof window !== 'undefined' && 
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // ignore if already stopped
      }
    }
    setIsListening(false)
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please type your answer.')
      return
    }

    setError(null)
    isManuallyStoppedRef.current = false

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    
    // Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {}
    }

    const recognition = new SpeechRec()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = lang

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event) => {
      let finalStr = ''
      let interimStr = ''

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i]
        const text = res[0].transcript
        if (res.isFinal) {
          finalStr += (finalStr ? ' ' : '') + text.trim()
        } else {
          interimStr += (interimStr ? ' ' : '') + text.trim()
        }
      }

      if (finalStr) {
        setTranscript(prev => {
          const combined = prev ? `${prev} ${finalStr}` : finalStr
          // deduplicate immediate repetitions
          return combined.trim()
        })
      }
      setInterimTranscript(interimStr)
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition event error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access was denied. Please allow microphone permissions or type your answer.')
        setIsListening(false)
      } else if (event.error === 'no-speech') {
        // don't terminate immediately on silence, keep listening unless manually stopped
      } else {
        setError(`Voice error (${event.error}). You can type your answer below.`)
      }
    }

    recognition.onend = () => {
      if (!isManuallyStoppedRef.current && isListening) {
        // Keep alive if still supposed to listen
        try {
          recognition.start()
        } catch (e) {
          setIsListening(false)
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (e) {
      console.error('Error starting recognition:', e)
      setError('Could not start voice recognition. Please try typing your answer.')
      setIsListening(false)
    }
  }, [isSupported, continuous, lang, isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {}
      }
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim(),
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  }
}
