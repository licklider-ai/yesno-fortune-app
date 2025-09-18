import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080'

// =============================================================
// 3種類の診断から選択して、5問に答えて結果を表示する実装
// - 惑星診断（既存）
// - 花診断
// - 恋愛診断
// 既存の App.css をそのまま利用できます。
// =============================================================

type Answer = 'YES' | 'NO'

type Fortune = {
  title: string
  summary: string
  luckyColor: string
  luckyAction: string
  scores: { work: number; love: number; money: number }
}

type Question = {
  id: string
  text: string
  onYes: string[]
  onNo: string[]
}

type Quiz = {
  id: string
  name: string
  description: string
  hashtag: string
  questions: Question[]
  fortunes: Record<string, Fortune>
  priority: string[]
}

const REQUIRED_QUESTIONS = 5

// ------------------------ 惑星診断 ------------------------
const planet: Quiz = {
  id: 'planet',
  name: '惑星診断',
  description: 'エネルギーやリズムの傾向を判定',
  hashtag: '#惑星診断 #YESNO占い',
  questions: [
    { id: 'p1', text: '最近、新しいことにワクワクしますか？', onYes: ['sun', 'thunder', 'star'], onNo: ['moon', 'mountain', 'sea'] },
    { id: 'p2', text: '計画を立てるのが好きですか？', onYes: ['mountain'], onNo: ['sea', 'flower'] },
    { id: 'p3', text: '初対面でもすぐ打ち解けますか？', onYes: ['sun', 'flower'], onNo: ['star', 'moon'] },
    { id: 'p4', text: '思い立ったらすぐ行動しますか？', onYes: ['thunder', 'sun'], onNo: ['moon', 'sea'] },
    { id: 'p5', text: '一人の時間が充実していますか？', onYes: ['star', 'moon'], onNo: ['flower', 'sun'] },
  ],
  fortunes: {
    sun: { title: '太陽タイプ', summary: '勢いと発信力が高まり、挑戦への追い風。小さく始めてスケールを。', luckyColor: 'ゴールド', luckyAction: '朝の散歩で深呼吸', scores: { work: 5, love: 4, money: 3 } },
    sea: { title: '海タイプ', summary: '柔軟性と受容力が高まる時。意見を取り込み最適解へ。', luckyColor: 'ターコイズ', luckyAction: '水分補給を意識', scores: { work: 4, love: 3, money: 4 } },
    mountain: { title: '山タイプ', summary: '粘り強さが光る時。計画通りに積み上げて成果に。', luckyColor: 'フォレストグリーン', luckyAction: 'ToDoを3つに絞る', scores: { work: 5, love: 3, money: 3 } },
    moon: { title: '月タイプ', summary: '内省が冴える時。静かな場所で考えを整理。', luckyColor: 'シルバー', luckyAction: '夜に10分だけ日記', scores: { work: 3, love: 4, money: 3 } },
    thunder: { title: '雷タイプ', summary: '瞬発力MAX。あなたの一手が周囲を動かす。', luckyColor: 'イエロー', luckyAction: '思いつきを即1分だけ実行', scores: { work: 4, love: 3, money: 5 } },
    star: { title: '星タイプ', summary: 'マイペースが最強。自分のリズムで直感が冴える。', luckyColor: 'ネイビー', luckyAction: '通知を1時間ミュート', scores: { work: 4, love: 5, money: 3 } },
    flower: { title: '花タイプ', summary: 'つながり運が開花。小さな気遣いが大きな実りに。', luckyColor: 'ピンク', luckyAction: '感謝を一言メッセージ', scores: { work: 3, love: 5, money: 4 } },
  },
  priority: ['sun', 'thunder', 'mountain', 'sea', 'moon', 'star', 'flower'],
}

// ------------------------ 花診断 ------------------------
const flower: Quiz = {
  id: 'flower',
  name: '花診断',
  description: 'あなたを花に例えると？性質やムードを判定',
  hashtag: '#花診断 #YESNO占い',
  questions: [
    { id: 'f1', text: '朝型の生活リズムですか？', onYes: ['sunflower', 'tulip'], onNo: ['lavender', 'rose'] },
    { id: 'f2', text: '繊細な気配りに自信がありますか？', onYes: ['rose', 'sakura'], onNo: ['sunflower'] },
    { id: 'f3', text: '新しい場所や人との出会いにワクワクしますか？', onYes: ['tulip', 'sunflower'], onNo: ['lavender'] },
    { id: 'f4', text: '香りでリラックスすることが多いですか？', onYes: ['lavender'], onNo: ['sunflower'] },
    { id: 'f5', text: '季節の移ろいを大切にしますか？', onYes: ['sakura', 'rose'], onNo: ['tulip'] },
  ],
  fortunes: {
    sakura: { title: '桜タイプ', summary: 'さりげない上品さ。節目で力を発揮し、人の心を和ませます。', luckyColor: '薄桃色', luckyAction: '季節の行事を楽しむ', scores: { work: 4, love: 5, money: 3 } },
    rose: { title: 'バラタイプ', summary: '存在感と情熱。こだわりを磨くほど魅力が際立ちます。', luckyColor: 'ボルドー', luckyAction: '好きな物に投資', scores: { work: 4, love: 5, money: 4 } },
    sunflower: { title: 'ひまわりタイプ', summary: '明るく前向き。周囲を巻き込みながら物事を進めます。', luckyColor: 'サンイエロー', luckyAction: '朝活を始める', scores: { work: 5, love: 4, money: 3 } },
    lavender: { title: 'ラベンダータイプ', summary: '落ち着きと癒し。丁寧なペースで質を高めます。', luckyColor: 'ラベンダー', luckyAction: '香りでリラックス', scores: { work: 3, love: 4, money: 4 } },
    tulip: { title: 'チューリップタイプ', summary: '好奇心と親しみやすさ。新しい出会いがチャンスに。', luckyColor: 'レッド', luckyAction: '小さな挑戦を積む', scores: { work: 4, love: 4, money: 3 } },
  },
  priority: ['sunflower', 'rose', 'sakura', 'tulip', 'lavender'],
}

// ------------------------ 恋愛診断 ------------------------
const love: Quiz = {
  id: 'love',
  name: '恋愛診断',
  description: '恋のアプローチ傾向と相性アップのコツ',
  hashtag: '#恋愛診断 #YESNO占い',
  questions: [
    { id: 'l1', text: '好きになったら自分から誘うほうですか？', onYes: ['leader', 'romantic'], onNo: ['steady', 'independent'] },
    { id: 'l2', text: 'サプライズや記念日を大切にしますか？', onYes: ['romantic', 'caregiver'], onNo: ['independent'] },
    { id: 'l3', text: 'メッセージの返信は早い方ですか？', onYes: ['steady', 'caregiver'], onNo: ['independent'] },
    { id: 'l4', text: '一人時間もかなり大事だと感じますか？', onYes: ['independent'], onNo: ['leader', 'romantic'] },
    { id: 'l5', text: '相手の話をじっくり聴くのが得意ですか？', onYes: ['caregiver', 'steady'], onNo: ['leader'] },
  ],
  fortunes: {
    leader: { title: 'リーダータイプ', summary: '積極的なアプローチで関係を前に進めます。主導しつつ相手のペース配慮を。', luckyColor: 'コーラル', luckyAction: 'デートの提案を先に出す', scores: { work: 4, love: 5, money: 3 } },
    romantic: { title: 'ロマンチストタイプ', summary: 'ドラマチックな演出で心を動かす達人。サプライズは控えめ×継続が鍵。', luckyColor: 'ワインレッド', luckyAction: '手書きのメッセージ', scores: { work: 3, love: 5, money: 3 } },
    steady: { title: '堅実タイプ', summary: '安心感と誠実さが魅力。小さな積み重ねで深い信頼を育てます。', luckyColor: 'オリーブ', luckyAction: '週1の連絡習慣', scores: { work: 5, love: 4, money: 4 } },
    independent: { title: 'マイペースタイプ', summary: '自立心が強く距離感バランスに長ける。共有時間は「質」を大切に。', luckyColor: 'ネイビー', luckyAction: '1人時間の予定化', scores: { work: 4, love: 4, money: 4 } },
    caregiver: { title: 'サポータータイプ', summary: '気配り上手で寄り添い力抜群。自分の希望も言葉にするほど好循環。', luckyColor: 'ペールピンク', luckyAction: 'お願いを1つ相手に伝える', scores: { work: 4, love: 5, money: 3 } },
  },
  priority: ['leader', 'romantic', 'steady', 'independent', 'caregiver'],
}

const QUIZZES: Quiz[] = [planet, flower, love]

function Stars({ value }: { value: number }) {
  return (
    <div className="stars" aria-label={`スコア ${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < value ? 1 : 0.3 }}>★</span>
      ))}
    </div>
  )
}

// --------- StatsView（統計画面）---------
function StatsView({ onClose }: { onClose: () => void }) {
  const [totals, setTotals] = useState<Record<string, { yes: number; no: number }>>({})
  const [detail, setDetail] = useState<{ quizId: string; items: { questionId: string; yes: number; no: number }[] } | null>(null)
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
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h2 style={{ margin:0 }}>統計ダッシュボード</h2>
        <button className="btn-secondary" onClick={onClose}>← メニューへ戻る</button>
      </div>

      {err && <div className="tile" style={{ color:'#b00020' }}>{err}</div>}
      {loading && <div className="tile">読み込み中…</div>}

      <div className="grid" style={{ marginTop: 8 }}>
        {QUIZZES.map(q => {
          const t = totals[q.id] ?? { yes: 0, no: 0 }
          const total = t.yes + t.no
          return (
            <div key={q.id} className="tile" style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ fontWeight: 800 }}>{q.name}</div>
              <div className="result-summary">{q.description}</div>
              <div style={{ display:'flex', gap:12 }}>
                <div>YES: <b>{t.yes}</b></div>
                <div>NO: <b>{t.no}</b></div>
                <div>合計: <b>{total}</b></div>
              </div>
              <div className="actions" style={{ justifyContent:'flex-start' }}>
                <button className="btn-secondary" onClick={() => loadDetail(q.id)}>設問内訳を見る</button>
              </div>
            </div>
          )
        })}
      </div>

      {detail && (
        <div className="tile" style={{ marginTop:12 }}>
          <div className="kicker">{QUIZZES.find(q=>q.id===detail.quizId)?.name} の設問内訳</div>
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
  )
}

// --------- App本体 ---------
export default function App() {
  const [quizId, setQuizId] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const [history, setHistory] = useState<{ q: string; a: Answer }[]>([])
  const [scores, setScores] = useState<Record<string, number>>({})
  const [finalType, setFinalType] = useState<string | null>(null)

  const quiz = QUIZZES.find(q => q.id === quizId) || null
  const isMenu = !quiz
  const isDone = !!quiz && step >= REQUIRED_QUESTIONS

  const startQuiz = (id: string) => {
    setQuizId(id)
    setStep(0)
    setHistory([])
    setScores({})
    setFinalType(null)
  }

  const onAnswer = (ans: Answer) => {
    if (!quiz) return
    const q = quiz.questions[step]

    // クリックログをAPIへ送信
    void fetch(`${API_BASE}/api/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId: quiz.id, questionId: q.id, answer: ans }),
    }).catch(() => {})

    const targets = ans === 'YES' ? q.onYes : q.onNo
    setScores(prev => {
      const next = { ...prev }
      targets.forEach(t => { next[t] = (next[t] ?? 0) + 1 })
      return next
    })
    setHistory(h => [...h, { q: q.text, a: ans }])

    const nextStep = step + 1
    if (nextStep >= REQUIRED_QUESTIONS) {
      setFinalType(prev => {
        const entries = Object.entries(scores) as [string, number][]
        targets.forEach(t => {
          const idx = entries.findIndex(([k]) => k === t)
          if (idx >= 0) entries[idx] = [t, entries[idx][1] + 1]
          else entries.push([t, 1])
        })
        const max = Math.max(...entries.map(([, v]) => v))
        const cands = entries.filter(([, v]) => v === max).map(([k]) => k)
        const order = quiz.priority
        for (const p of order) if (cands.includes(p)) return p
        return cands[0] || order[0]
      })
    }
    setStep(nextStep)
  }

  const resetSameQuiz = () => {
    setStep(0); setHistory([]); setScores({}); setFinalType(null)
  }
  const backToMenu = () => {
    setQuizId(null); setStep(0); setHistory([]); setScores({}); setFinalType(null)
  }

  const shareText = useMemo(() => {
    if (!quiz || !finalType) return ''
    const f = quiz.fortunes[finalType]
    return [
      `${quiz.name}の結果：${f.title}`,
      f.summary,
      `ラッキーカラー: ${f.luckyColor}`,
      `ラッキーアクション: ${f.luckyAction}`,
      quiz.hashtag,
    ].join('\n')
  }, [quiz, finalType])

  return (
    <div className="container">
      <div className="card">
        <div className="card-body">
          {/* ヘッダー */}
          <div style={{ textAlign:'left' }}>
            <h1 style={{ margin:'0 0 4px' }}>YES/NO占いコレクション</h1>
            <p className="lead" style={{ margin:0 }}>3種類から選んで、5問で診断</p>
          </div>

          <AnimatePresence mode="wait">
            {isMenu ? (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="grid" style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}>
                  {QUIZZES.map(q => (
                    <div key={q.id} className="tile" style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{q.name}</div>
                      <div className="result-summary">{q.description}</div>
                      <div className="actions" style={{ justifyContent:'flex-start' }}>
                        <button className="btn-primary" onClick={() => startQuiz(q.id)}>この診断を始める</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : !isDone && quiz ? (
              <motion.div
                key={`quiz-${quiz.id}-${step}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <div className="kicker">{quiz.name}</div>
                <div className="question">
                  {step + 1}/{REQUIRED_QUESTIONS}：{quiz.questions[step].text}
                </div>
                <div className="btns">
                  <button className="btn-primary" onClick={() => onAnswer('YES')}>YES</button>
                  <button className="btn-secondary" onClick={() => onAnswer('NO')}>NO</button>
                </div>
                {history.length > 0 && (
                  <div className="muted">これまで: {history.map((h, i) => `${i + 1}.${h.a}`).join(' ')}</div>
                )}
                <div className="actions" style={{ marginTop: 8 }}>
                  <button className="btn-secondary" onClick={backToMenu}>← 診断一覧に戻る</button>
                </div>
              </motion.div>
            ) : quiz ? (
              <motion.div
                key={`result-${quiz.id}-${finalType ?? 'none'}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {finalType && (
                  <>
                    <div className="kicker">{quiz.name}｜診断結果</div>
                    <div className="result-title" style={{ textAlign:'center' }}>{quiz.fortunes[finalType].title}</div>
                    <p className="result-summary" style={{ textAlign:'center' }}>{quiz.fortunes[finalType].summary}</p>

                    <div className="grid">
                      <div className="tile">
                        <div className="kicker">ラッキーカラー</div>
                        <div className="val">{quiz.fortunes[finalType].luckyColor}</div>
                      </div>
                      <div className="tile" style={{ gridColumn: 'span 2' }}>
                        <div className="kicker">ラッキーアクション</div>
                        <div className="val">{quiz.fortunes[finalType].luckyAction}</div>
                      </div>
                    </div>

                    <div className="tile" style={{ marginTop: 12 }}>
                      <div className="kicker" style={{ marginBottom: 6 }}>運勢</div>
                      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                        <div style={{ textAlign:'center' }}>
                          <div>仕事運</div>
                          <Stars value={quiz.fortunes[finalType].scores.work} />
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div>恋愛運</div>
                          <Stars value={quiz.fortunes[finalType].scores.love} />
                        </div>
                        <div style={{ textAlign:'center' }}>
                          <div>金運</div>
                          <Stars value={quiz.fortunes[finalType].scores.money} />
                        </div>
                      </div>
                    </div>

                    <div className="actions">
                      <button className="btn-primary" onClick={resetSameQuiz}>同じ診断でもう一度</button>
                      <button className="btn-secondary" onClick={backToMenu}>診断一覧に戻る</button>
                      <button className="btn-secondary" onClick={async () => { try { await navigator.clipboard.writeText(shareText); alert('シェア用テキストをコピーしました！') } catch {} }}>結果をコピー</button>
                    </div>
                    <textarea className="share" readOnly rows={4} value={shareText} />
                  </>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
