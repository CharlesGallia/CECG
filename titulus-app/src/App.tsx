import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FunnelProvider } from './lib/FunnelContext'

import IdentitePage from './pages/IdentitePage'
import AdhesionPage from './pages/AdhesionPage'
import DeclaratioPage from './pages/DeclaratioPage'
import SignaturePage from './pages/SignaturePage'
import KycPage from './pages/KycPage'
import ConfirmationPage from './pages/ConfirmationPage'

import MentionsLegales from './pages/legal/MentionsLegales'
import Confidentialite from './pages/legal/Confidentialite'
import CGV from './pages/legal/CGV'
import Contact from './pages/legal/Contact'

export default function App() {
  return (
    <FunnelProvider>
      <BrowserRouter>
        <Routes>
          {/* Funnel — 6 étapes */}
          <Route path="/" element={<IdentitePage />} />
          <Route path="/identite" element={<Navigate to="/" replace />} />
          <Route path="/adhesion" element={<AdhesionPage />} />
          <Route path="/declaratio" element={<DeclaratioPage />} />
          <Route path="/signature" element={<SignaturePage />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />

          {/* Pages légales */}
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FunnelProvider>
  )
}
