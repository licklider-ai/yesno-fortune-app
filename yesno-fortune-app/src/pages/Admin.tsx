import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Stats = {
  quizzes: Record<string, number>
  questions: Record<string, { yes: number; no: number }>
}

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080'

export default function Admin() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/stats/summary`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setStats(data))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container">
      <div className="card">
        <div className="card-body">
          <h1>統計ダッシュボード</h1>

          {loading && <p>読み込み中...</p>}
          {error && <p style={{ color: 'crimson' }}>エラー: {error}</p>}

          {stats && (
            <>
              <h2 style={{ marginTop: 12 }}>クイズ別合計</h2>
              <ul>
                {Object.entries(stats.quizzes).map(([quiz, count]) => (
                  <li key={quiz}>
                    {quiz}: {count} 回
                  </li>
                ))}
              </ul>

              <h2 style={{ marginTop: 12 }}>設問別 YES/NO</h2>
              <ul>
                {Object.entries(stats.questions).map(([qid, v]) => (
                  <li key={qid}>
                    {qid} → YES: {v.yes} / NO: {v.no}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="actions" style={{ marginTop: 12 }}>
            <Link className="btn-secondary" to="/">
              ← フロントへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
