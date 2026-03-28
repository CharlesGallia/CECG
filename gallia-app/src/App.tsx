import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Pages (to be implemented in subsequent prompts)
import RenaissancePage from './pages/RenaissancePage'
import CheminCECG from './pages/CheminCECG'
import KYCPage from './pages/KYCPage'
import Dashboard from './pages/Dashboard'
import CercleGallien from './pages/CercleGallien'
import CRMFilleuls from './pages/CRMFilleuls'
import MeritePage from './pages/MeritePage'
import Profil from './pages/Profil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RenaissancePage />} />
        <Route path="/cecg" element={<CheminCECG />} />
        <Route path="/kyc" element={<KYCPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cercle" element={<CercleGallien />} />
        <Route path="/filleuls" element={<CRMFilleuls />} />
        <Route path="/merite" element={<MeritePage />} />
        <Route path="/profil" element={<Profil />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
