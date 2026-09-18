import { createContext, useContext, useEffect, useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const OfflineAccessContext = createContext(null)

const CACHE_NAME = 'curiolabs-lab-cache-v1'

export function OfflineAccessProvider({ children }) {
  const isOnline = useOnlineStatus()
  const [cachedLabs, setCachedLabs] = useState([])

  useEffect(() => {
    loadCachedLabs()
  }, [])

  const loadCachedLabs = async () => {
    try {
      const stored = localStorage.getItem('curiolabs_cached_labs')
      if (stored) setCachedLabs(JSON.parse(stored))
    } catch {
      setCachedLabs([])
    }
  }

  const cacheLabVisit = async (labId, labName, labPath) => {
    try {
      const labs = [...cachedLabs]
      if (!labs.find(l => l.id === labId)) {
        labs.push({ id: labId, name: labName, path: labPath, cachedAt: Date.now() })
        setCachedLabs(labs)
        localStorage.setItem('curiolabs_cached_labs', JSON.stringify(labs))
      }
      // Cache the current page resources via service worker
      if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME)
        await cache.add(labPath)
      }
    } catch (err) {
      console.log('Cache failed:', err)
    }
  }

  return (
    <OfflineAccessContext.Provider value={{ isOnline, cachedLabs, cacheLabVisit }}>
      {children}
    </OfflineAccessContext.Provider>
  )
}

export function useOfflineAccess() {
  const ctx = useContext(OfflineAccessContext)
  if (!ctx) throw new Error('useOfflineAccess must be used within OfflineAccessProvider')
  return ctx
}
