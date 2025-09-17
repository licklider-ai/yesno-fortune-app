import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

import { HashRouter, Routes, Route } from 'react-router-dom'
import AdminStats from './pages/AdminStats'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminStats />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
