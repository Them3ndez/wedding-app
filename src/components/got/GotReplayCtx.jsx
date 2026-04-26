import { createContext, useContext } from 'react'

export const GotReplayCtx = createContext(null)
export const useGotReplay = () => useContext(GotReplayCtx)
