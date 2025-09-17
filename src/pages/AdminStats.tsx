import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'

type Totals = Record<string, { yes: number; no: number }>
type Detail = { quizId: string; items: { questionId: string; yes: number; no: number }[] }

const QUIZZES = [
  { id: 'planet', name: '惑星診断', description: 'エネルギーやリズムの傾向を判定' },
  { id: 'flower', name: '花診断', description: 'あなたを花に例えると？性質やムードを判定' },
  { id: 'love',   name: '恋愛診断', description: '恋のアプローチ傾向と相性アップのコツ' },
]

export default function AdminStats() {
  const [totals, setTotals] = useState<Totals>({})
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        setLoading(true); setErr(null)
        const pairs = await Promise.all(
          QUIZZES.map(async (q) => {
            const r = await fetch(`${API_BASE}/api/stats/quiz/${q.id}`)
            const d = await r.json()
            return [q.id, { yes: d.yes ?? 0, no: d.no ?? 0 }] as const
          })
        )
        if (!canceled) setTotals(Object.fromEntries(pairs))
      } catch {
        if (!canceled) setErr('統計の取得に失敗しました')
      } finally {
        if (!canceled) setLoading(false)
      }
    })()
    return () => { canceled = true }
  }, [])

  const loadDetail = async (quizId: string) => {
    try {
      setLoading(true); setErr(null)
      const r = await fetch(`${API_BASE}/api/stats/question/${quizId}`)
      const d = await r.json()
      setDetail({ quizId, items: d.items ?? [] })
    } catch {
      setErr('内訳の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-body">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h1 style={{margin:0}}>管理：統計ダッシュボード</h1>
            <a className="btn-secondary" href="#/">← フロントへ</a>
          </div>

          {err && <div className="tile" style={{ color:'#b00020' }}>{err}</div>}
          {loading && <div className="tile">読み込み中…</div>}

          <div className="grid" style={{ marginTop: 8 }}>
            {QUIZZES.map(q => {
              const t = totals[q.id] ?? { yes: 0, no: 0 }
              const total = t.yes + t.no
              return (
                <motion.div key={q.id} className="tile" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
                  <div style={{ fontWeight: 800 }}>{q.name}</div>
                  <div className="result-summary">{q.description}</div>
                  <div style={{ display:'flex', gap:12, marginTop:6 }}>
                    <div>YES: <b>{t.yes}</b></div>
                    <div>NO: <b>{t.no}</b></div>
                    <div>合計: <b>{total}</b></div>
                  </div>
                  <div className="actions" style={{ justifyContent:'flex-start', marginTop:6 }}>
                    <button className="btn-secondary" onClick={() => loadDetail(q.id)}>設問内訳を見る</button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {detail && (
            <div className="tile" style={{ marginTop:12 }}>
              <div className="kicker">
                {QUIZZES.find(q=>q.id===detail.quizId)?.name} の設問内訳
              </div>
              <div className="grid" style={{ gridTemplateColumns:'repeat(1, minmax(0,1fr))' }}>
                {detail.items.length === 0 && <div>まだデータがありません</div>}
                {detail.items.map(it => (
                  <div key={it.questionId} className="tile" style={{ margin:0 }}>
                    <div style={{ fontWeight:600 }}>Q: {it.questionId}</div>
                    <div style={{ display:'flex', gap:12 }}>
                      <div>YES: <b>{it.yes}</b></div>
                      <div>NO: <b>{it.no}</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
