import { useMemo, useState } from "react";

// Extracted quiz feature reference for future app migration.
// Not connected to current browser runtime yet.
// Exported as an importable module with injected dependencies.

export function QuizPage({
  favs = [],
  data = [],
  categories = [],
  storage = (typeof window !== "undefined" ? window.localStorage : null),
  createBrowserStorageAdapter,
  createWrongBookStore,
  createQuizQuestion,
  buildWrongEntry,
}) {
  const browserStorage = useMemo(() => {
    if (createBrowserStorageAdapter && storage) return createBrowserStorageAdapter(storage);
    return {
      readJson: (_, fallback) => fallback,
      writeJson: () => {},
      remove: () => {},
    };
  }, [createBrowserStorageAdapter, storage]);
  const wrongBookStore = useMemo(() => {
    if (createWrongBookStore) return createWrongBookStore(browserStorage);
    return {
      load: () => [],
      save: () => {},
      clear: () => {},
    };
  }, [createWrongBookStore, browserStorage]);
  const [mode, setMode] = useState(null);
  const [scope, setScope] = useState("all");
  const [q, setQ] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [score, setScore] = useState({ total:0, correct:0 });
  const [history, setHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [wrongBook, setWrongBook] = useState(() => wrongBookStore.load());

  const pool = useMemo(() => {
    if (scope === "fav") return data.filter(d => favs.includes(d.n));
    if (scope !== "all") return data.filter(d => d.c === scope);
    return data;
  }, [scope, favs, data]);

  const saveWrongBook = (next) => {
    setWrongBook(next);
    try { wrongBookStore.save(next); } catch(e) {}
  };
  const resetQuizState = () => {
    setQ(null);
    setChosen(null);
    setScore({total:0,correct:0});
    setHistory([]);
    setQuizStarted(false);
    setQuizFinished(false);
    setReviewTotal(0);
  };
  const reviewPool = useMemo(() => {
    if (!reviewWrongOnly) return [];
    return wrongBook;
  }, [reviewWrongOnly, wrongBook]);

  const genQuestion = () => {
    if (quizFinished || score.total >= questionCount) {
      setQuizFinished(true);
      setQ(null);
      return;
    }
    if (reviewWrongOnly) {
      if (reviewPool.length === 0) {
        if (!quizStarted) alert("目前沒有錯題可複習");
        else setQuizFinished(true);
        setQ(null);
        return;
      }
      setQuizStarted(true);
      if (!quizStarted) setReviewTotal(reviewPool.length);
      setChosen(null);
      const reviewQ = reviewPool[Math.floor(Math.random() * reviewPool.length)];
      setQ({ ...reviewQ, review: true });
      return;
    }
    if (pool.length < 4) { alert("方劑數量不足，請擴大範圍"); return; }
    setQuizStarted(true);
    setChosen(null);
    if (!createQuizQuestion || !buildWrongEntry) {
      alert("測驗模組依賴未注入，請確認 QuizPage props");
      return;
    }
    const nextQuestion = createQuizQuestion({ data, mode, scope, favorites: favs });
    if (nextQuestion.error) { alert(nextQuestion.error); return; }
    setQ(nextQuestion);
  };

  const handleAnswer = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    const isCorrect = idx === q.answer;
    const wrongEntry = buildWrongEntry(q);
    setScore(s => {
      const next = { total: s.total + 1, correct: s.correct + (isCorrect ? 1 : 0) };
      if (next.total >= questionCount) setQuizFinished(true);
      return next;
    });
    setHistory(h => [...h, { q: q.question.slice(0, 30), correct: isCorrect, formula: q.formulaName }]);
    if (isCorrect) {
      if (q.review) saveWrongBook(wrongBook.filter(item => item.key !== q.key));
    } else {
      if (!wrongBook.some(item => item.key === wrongEntry.key)) {
        saveWrongBook([...wrongBook, wrongEntry]);
      }
    }
  };

  if (!mode && !reviewWrongOnly) return (
    <div style={{ padding:"20px 24px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ fontSize:13, color:"#888", marginBottom:12 }}>選擇題型</div>
      <div style={{ position:"relative", marginBottom:20 }}>
      <div style={{
        display:"grid", gridTemplateColumns:"1fr 1fr", gap:12,
        opacity: reviewWrongOnly ? 0.45 : 1,
        pointerEvents: reviewWrongOnly ? "none" : "auto",
        filter: reviewWrongOnly ? "grayscale(0.2)" : "none",
      }}>
        {[
          ["random","隨機題型","每題隨機抽一種測驗方式","綜合"],
          ["f2h","方→藥","看方名，選出正確的藥物組成","基礎"],
          ["h2f","藥→方","看藥物組成，辨認方名","基礎"],
          ["clause","條文→方","讀條文，判斷用什麼方","進階"],
        ].map(([k,title,desc,level]) => (
          <div key={k} onClick={() => setMode(k)} style={{
            background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", cursor:"pointer",
            transition:"all 0.15s", ":hover":{ borderColor:"#C94435" }
          }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>{title}</div>
            <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>{desc}</div>
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"#f5f3f0", color:"#888" }}>{level}</span>
          </div>
        ))}
      </div>
      {wrongBook.length > 0 && !reviewWrongOnly && (
        <div style={{ marginTop:12 }}>
          <div
            onClick={() => { resetQuizState(); setReviewWrongOnly(true); setMode("review"); }}
            style={{
              background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", cursor:"pointer",
              transition:"all 0.15s"
            }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>複習錯題</div>
                <div style={{ fontSize:12, color:"#888" }}>依原題型重新練習先前答錯的題目</div>
              </div>
              <span style={{
                fontSize:11, padding:"4px 10px", borderRadius:999, background:"#f5f3f0", color:"#666", fontWeight:600
              }}>{wrongBook.length} 題</span>
            </div>
          </div>
        </div>
      )}
      {reviewWrongOnly && (
        <div style={{
          position:"absolute", right:0, top:-28, fontSize:12, color:"#888",
          background:"#F7F5F2", padding:"2px 8px", borderRadius:12, border:"1px solid #e5e0d8"
        }}>
          錯題複習會依原題型出題
        </div>
      )}
      </div>
      <div style={{ fontSize:13, color:"#888", marginBottom:8 }}>範圍設定</div>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {[["all","全部"],["fav","僅收藏"],...categories.slice(1).map(c=>[c,c])].map(([k,label]) => (
          <button key={k} onClick={() => setScope(k)} style={{
            padding:"4px 12px", borderRadius:16, border:"1px solid #ddd", cursor:"pointer", fontSize:12,
            background: scope===k ? "#2c3e50" : "#fff", color: scope===k ? "#fff" : "#555"
          }}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize:13, color:"#888", margin:"16px 0 8px" }}>題數設定</div>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        {[5,10,20,30].map(n => (
          <button key={n} onClick={() => setQuestionCount(n)} style={{
            padding:"4px 12px", borderRadius:16, border:"1px solid #ddd", cursor:"pointer", fontSize:12,
            background: questionCount===n ? "#2c3e50" : "#fff", color: questionCount===n ? "#fff" : "#555"
          }}>{n} 題</button>
        ))}
        <label style={{ fontSize:12, color:"#666", display:"flex", alignItems:"center", gap:6 }}>
          自訂
          <input
            type="number"
            min="1"
            max="100"
            value={questionCount}
            onChange={e => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              setQuestionCount(Math.max(1, Math.min(100, next)));
            }}
            style={{ width:72, padding:"4px 8px", borderRadius:8, border:"1px solid #ddd", fontSize:12 }}
          />
          題
        </label>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"20px 24px", maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={() => { setMode(null); setReviewWrongOnly(false); resetQuizState(); }}
          style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"#888" }}>← 返回選題</button>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {reviewWrongOnly && wrongBook.length > 0 && (
            <button
              onClick={() => {
                if (confirm("確定要清空全部錯題嗎？")) {
                  saveWrongBook([]);
                  setMode(null);
                  setReviewWrongOnly(false);
                  resetQuizState();
                }
              }}
              style={{
                padding:"6px 12px", borderRadius:16, border:"1px solid #e2b8b8", cursor:"pointer",
                fontSize:12, background:"#fff", color:"#C62828"
              }}
            >清空錯題本</button>
          )}
          <div style={{ fontSize:13, color:"#888" }}>
            {score.total > 0 && <span>{score.correct}/{score.total} 正確率 {Math.round(score.correct/score.total*100)}%</span>}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, fontSize:13, color:"#777", flexWrap:"wrap", gap:8 }}>
        <span>{reviewWrongOnly ? `錯題複習，本輪共 ${reviewTotal || reviewPool.length} 題` : `本次設定 ${questionCount} 題`}</span>
        <span>進度 {Math.min(score.total + (q && chosen === null ? 1 : 0), reviewWrongOnly ? (reviewTotal || reviewPool.length || questionCount) : questionCount)} / {reviewWrongOnly ? (reviewTotal || reviewPool.length || questionCount) : questionCount}</span>
      </div>

      {!quizStarted ? (
        <div style={{ textAlign:"center", padding:40 }}>
          <button onClick={genQuestion} style={{
            padding:"14px 40px", borderRadius:12, border:"none", cursor:"pointer",
            background:"linear-gradient(135deg, #1a1a2e, #0f3460)", color:"#fff",
            fontSize:16, fontWeight:700, letterSpacing:2
          }}>{reviewWrongOnly ? "開始複習" : "開始測驗"}</button>
        </div>
      ) : quizFinished ? (
        <div style={{ background:"#fff", borderRadius:12, padding:28, border:"1px solid #eee", textAlign:"center", marginBottom:16 }}>
          <div style={{ fontSize:22, fontWeight:700, marginBottom:10 }}>測驗完成</div>
          <div style={{ fontSize:15, color:"#555", marginBottom:8 }}>共 {questionCount} 題，答對 {score.correct} 題</div>
          <div style={{ fontSize:14, color:"#888", marginBottom:18 }}>正確率 {questionCount > 0 ? Math.round(score.correct / questionCount * 100) : 0}%</div>
          <button onClick={resetQuizState}
            style={{
              padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer",
              background:"#2c3e50", color:"#fff", fontSize:14, fontWeight:600
            }}>重新測驗</button>
        </div>
      ) : (
        <div>
          <div style={{ background:"#fff", borderRadius:12, padding:24, border:"1px solid #eee", marginBottom:16 }}>
            <div style={{ fontSize:15, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{q.question}</div>
          </div>

          <div style={{ display:"grid", gap:10, marginBottom:16 }}>
            {q.options.map((opt, i) => {
              const isAnswer = i === q.answer;
              const isChosen = i === chosen;
              let bg = "#fff", border = "1px solid #eee", color = "#333";
              if (chosen !== null) {
                if (isAnswer) { bg = "#E8F5E9"; border = "2px solid #4CAF50"; color = "#2E7D32"; }
                else if (isChosen) { bg = "#FFEBEE"; border = "2px solid #E53935"; color = "#C62828"; }
              }
              return (
                <div key={i} onClick={() => handleAnswer(i)} style={{
                  padding:"14px 18px", borderRadius:10, background: bg, border,
                  cursor: chosen === null ? "pointer" : "default", fontSize:14, lineHeight:1.6, color,
                  transition:"all 0.15s"
                }}>
                  <span style={{ fontWeight:600, marginRight:8, color:"#aaa" }}>{String.fromCharCode(65+i)}.</span>
                  {opt}
                </div>
              );
            })}
          </div>

          {chosen !== null && (
            <div style={{ textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:20, marginBottom:12 }}>
                {chosen === q.answer ? "✓ 正確！" : `✗ 答案是 ${String.fromCharCode(65+q.answer)}`}
              </div>
              {!reviewWrongOnly && chosen !== q.answer && (
                <div style={{ fontSize:12, color:"#C62828", marginBottom:12 }}>
                  這題已加入錯題本，可在「複習錯題」中重做
                </div>
              )}
              {reviewWrongOnly && chosen === q.answer && (
                <div style={{ fontSize:12, color:"#2E7D32", marginBottom:12 }}>
                  這題已從錯題本移除
                </div>
              )}
              <button onClick={genQuestion} style={{
                padding:"10px 30px", borderRadius:8, border:"none", cursor:"pointer",
                background:"#2c3e50", color:"#fff", fontSize:14, fontWeight:600
              }}>{score.total >= questionCount ? "查看結果" : "下一題"}</button>
            </div>
          )}

          {history.length > 0 && (
            <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #eee", marginTop:16 }}>
              <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>作答紀錄</div>
              {history.slice(-10).reverse().map((h,i) => (
                <div key={i} style={{ fontSize:12, padding:"4px 0", color: h.correct ? "#4CAF50" : "#E53935" }}>
                  {h.correct ? "✓" : "✗"} {h.formula} — {h.q}...
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
