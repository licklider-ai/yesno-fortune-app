import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'
import AdminStats from './pages/AdminStats'

// 最小のハッシュルーター
function getHashPath() {
  return window.location.hash.replace(/^#/, '') || '/'
}
function RootRouter() {
  const [path, setPath] = React.useState(getHashPath())
  React.useEffect(() => {
    const onHash = () => setPath(getHashPath())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (path.startsWith('/admin')) return <AdminStats />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>,
)
