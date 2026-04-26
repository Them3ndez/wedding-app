import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainSite from './pages/MainSite'
import StarWarsApp from './pages/starwars/StarWarsApp'
import GotApp from './pages/got/GotApp'
import BBTApp from './pages/bbt/BBTApp'
import GoodPlaceApp from './pages/goodplace/GoodPlaceApp'
import CatchTheBouquet from './pages/game/CatchTheBouquet'
import { TransitionOverlayProvider } from './components/TransitionOverlay'

export default function App() {
  return (
    <BrowserRouter>
      <TransitionOverlayProvider>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/starwars/*" element={<StarWarsApp />} />
          <Route path="/got/*" element={<GotApp />} />
          <Route path="/bbt/*" element={<BBTApp />} />
          <Route path="/goodplace/*" element={<GoodPlaceApp />} />
          <Route path="/game" element={<CatchTheBouquet />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TransitionOverlayProvider>
    </BrowserRouter>
  )
}
