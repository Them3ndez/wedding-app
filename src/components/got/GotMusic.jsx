import { useRef, useEffect } from 'react'

export default function GotMusic({ isMuted }) {
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio('/audio/Winterfell-theme.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.15
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return
      if (document.hidden) {
        audioRef.current.pause()
      } else {
        if (!isMuted) {
          audioRef.current.play().catch(() => {})
        }
      }
    }

    const handlePageHide = () => {
      audioRef.current?.pause()
    }

    const handlePageShow = () => {
      if (!audioRef.current || isMuted) return
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [isMuted])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted
  }, [isMuted])

  return null
}
