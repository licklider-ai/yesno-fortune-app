// src/router.tsx
import { Routes, Route } from 'react-router-dom'
import App from './App'                  // そのままフロント画面として使う
import Admin from './pages/Admin'        // これを次で作成

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
