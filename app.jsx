// 傷寒論方劑性味分析 - 主程式
// Data loaded from separate JSON files via <script> tags
// FORMULAS, HERBS_BT, CLAUSES are set as window globals before this script runs

const { useState, useMemo } = React;

const CATEGORIES = ["全部","太陽病","陽明病","少陽病","太陰病","少陰病","厥陰病","霍亂病","差後病"];
const TENDENCIES = ["全部","大溫","偏溫","平性","偏寒","大寒"];
const FLAVORS = ["辛","甘","苦","酸","鹹"];
const FLAVOR_COLORS = { "辛":"#A0A0A0", "甘":"#D4A017", "苦":"#C94435", "酸":"#3A8F5C", "鹹":"#34495E" };
const TENDENCY_COLORS = { "大溫":"#C0392B", "偏溫":"#E67E22", "平性":"#7F8C8D", "偏寒":"#3498DB", "大寒":"#2471A3" };

// Merge data: attach bt and clauses to each formula
const DATA = (window.FORMULAS || []).map(fm => {
  const hd = fm.hd.map(h => ({ ...h, bt: (window.HERBS_BT || {})[h.n] || '' }));
  const cl = (window.CLAUSES || {})[fm.n] || [];
  return { ...fm, hd, cl };
});

function RadarChart({ fp, fp2, label, label2, size = 280 }) {
  const cx = size / 2, cy = size / 2;
  const R = size * 0.32;
  const angles = FLAVORS.map((_, i) => (Math.PI / 2) + (2 * Math.PI * i) / 5);
  const toXY = (angle, r) => [cx + r * Math.cos(angle), cy - r * Math.sin(angle)];

  const levels = [20, 40, 60, 80, 100];
  const maxVal = 100;

  const getPoints = (data) => {
    return FLAVORS.map((f, i) => {
      const val = data[f] || 0;
      const r = (val / maxVal) * R;
      return toXY(angles[i], r);
    });
  };

  const pts = getPoints(fp);
  const pathStr = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  
  let pathStr2 = null;
  if (fp2) {
    const pts2 = getPoints(fp2);
    pathStr2 = pts2.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  }

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size }}>
      {/* Grid levels */}
      {levels.map(lv => {
        const r = (lv / maxVal) * R;
        const gridPts = angles.map(a => toXY(a, r));
        const d = gridPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
        return <path key={lv} d={d} fill="none" stroke="#e0ddd8" strokeWidth={0.8} opacity={0.7} />;
      })}
      {/* Axis lines */}
      {angles.map((a, i) => {
        const [ex, ey] = toXY(a, R);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#d5d0c8" strokeWidth={0.6} />;
      })}
      {/* Comparison fill (if exists) */}
      {pathStr2 && (
        <path d={pathStr2} fill="#3498DB" fillOpacity={0.12} stroke="#3498DB" strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      {/* Data fill */}
      <path d={pathStr} fill="#C94435" fillOpacity={fp2 ? 0.15 : 0.12} stroke="#C94435" strokeWidth={2} />
      {/* Data points */}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={FLAVOR_COLORS[FLAVORS[i]]}
          stroke={FLAVORS[i]==="辛" ? "#666" : "#fff"} strokeWidth={1.5} />
      ))}
      {fp2 && getPoints(fp2).map((p, i) => (
        <circle key={`c${i}`} cx={p[0]} cy={p[1]} r={2.5} fill="#3498DB" stroke="#fff" strokeWidth={1} />
      ))}
      {/* Labels */}
      {FLAVORS.map((f, i) => {
        const labelR = R + 28;
        const [lx, ly] = toXY(angles[i], labelR);
        const val = fp[f] || 0;
        const labelColor = f==="辛" ? "#666" : FLAVOR_COLORS[f];
        return (
          <g key={f}>
            <text x={lx} y={ly - 6} textAnchor="middle" fontSize={14} fontWeight={700} fill={labelColor}>{f}</text>
            <text x={lx} y={ly + 8} textAnchor="middle" fontSize={10} fill="#999">{val > 0 ? `${val}%` : "-"}</text>
          </g>
        );
      })}
      {/* Legend */}
      {label && (
        <g>
          <rect x={4} y={size - 16} width={8} height={8} rx={2} fill="#C94435" opacity={0.6} />
          <text x={16} y={size - 9} fontSize={9} fill="#888">{label}</text>
        </g>
      )}
      {label2 && fp2 && (
        <g>
          <rect x={4} y={size - 28} width={8} height={8} rx={2} fill="#3498DB" opacity={0.6} />
          <text x={16} y={size - 21} fontSize={9} fill="#888">{label2}</text>
        </g>
      )}
    </svg>
  );
}

function FlavorBar({ fp, height = 24 }) {
  const ordered = FLAVORS.filter(f => fp[f]);
  return (
    <div style={{ display:"flex", borderRadius:4, overflow:"hidden", height, width:"100%", border:"1px solid #e0e0e0" }}>
      {ordered.map(f => (
        <div key={f} title={`${f} ${fp[f]}%`} style={{
          width: `${fp[f]}%`, background: FLAVOR_COLORS[f],
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize: fp[f] > 12 ? 11 : 0, color: f==="辛" || f==="甘" ? "#333" : "#fff", fontWeight:600, letterSpacing:1
        }}>{fp[f] > 12 ? `${f}${fp[f]}%` : ""}</div>
      ))}
    </div>
  );
}

function NatureGauge({ score }) {
  const pct = Math.max(0, Math.min(100, (score + 2.5) / 5 * 100));
  return (
    <div style={{ position:"relative", height:12, background:"linear-gradient(90deg, #2471A3 0%, #3498DB 25%, #95A5A6 50%, #E67E22 75%, #C0392B 100%)", borderRadius:6 }}>
      <div style={{
        position:"absolute", top:-2, left:`${pct}%`, transform:"translateX(-50%)",
        width:16, height:16, borderRadius:"50%", background:"#fff", border:"2px solid #2c3e50",
        boxShadow:"0 1px 4px rgba(0,0,0,0.3)"
      }} />
    </div>
  );
}

function HerbPill({ herb, expanded, onToggle }) {
  const bg = herb.t === "溫" ? "#FDEBD0" : herb.t === "微溫" ? "#FEF5E7" :
    herb.t === "寒" ? "#D6EAF8" : herb.t === "微寒" ? "#EBF5FB" :
    herb.t === "小寒" ? "#EBF5FB" : herb.t === "涼" ? "#E8F8F5" : "#F2F3F4";
  return (
    <div style={{ display:"inline-block", margin:"2px 3px", verticalAlign:"top" }}>
      <span onClick={onToggle} style={{
        display:"inline-flex", alignItems:"center", gap:4, padding:"3px 10px", borderRadius:20,
        background: expanded ? "#2c3e50" : bg, color: expanded ? "#fff" : "inherit",
        fontSize:13, border: expanded ? "1px solid #2c3e50" : "1px solid rgba(0,0,0,0.08)",
        cursor: herb.bt ? "pointer" : "default", transition:"all 0.15s",
      }}>
        <span style={{ fontWeight:600 }}>{herb.n}</span>
        <span style={{ opacity:0.6, fontSize:11 }}>{herb.w}兩</span>
        {herb.f.map(f => <span key={f} style={{ color: expanded ? "#ffd" : FLAVOR_COLORS[f], fontWeight:700, fontSize:11 }}>{f}</span>)}
        {herb.t && <span style={{ opacity:0.6, fontSize:10 }}>{herb.t}</span>}
        {herb.bt && <span style={{ fontSize:9, opacity:0.5 }}>{expanded ? "▲" : "▼"}</span>}
      </span>
      {expanded && herb.bt && (
        <div style={{
          marginTop:4, padding:"10px 14px", borderRadius:8,
          background:"#faf8f5", border:"1px solid #e8e4df",
          fontSize:13, lineHeight:2, color:"#555", maxWidth:400,
        }}>
          {herb.bt.split("\\n").map((part, i) => {
            if (i === 0) return <div key={i}><span style={{ fontSize:10, color:"#999", fontWeight:600 }}>《神農本草經》</span><br/>{part}</div>;
            return <div key={i} style={{ marginTop:8, padding:"8px 10px", borderRadius:6, background:"#f0ede8", fontSize:12, lineHeight:1.8, color:"#777" }}>{part}</div>;
          })}
        </div>
      )}
    </div>
  );
}

function FormulaCard({ formula, onClick, selected }) {
  return (
    <div onClick={onClick} style={{
      padding:"14px 16px", cursor:"pointer", borderBottom:"1px solid #eee",
      background: selected ? "#FFF8F0" : "#fff",
      borderLeft: selected ? "3px solid #C94435" : "3px solid transparent",
      transition:"all 0.15s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <span style={{ fontWeight:700, fontSize:15, fontFamily:"'Noto Serif TC', serif" }}>{formula.n}</span>
        <span style={{
          fontSize:11, padding:"2px 8px", borderRadius:10, fontWeight:600,
          color: TENDENCY_COLORS[formula.nt], background: `${TENDENCY_COLORS[formula.nt]}18`
        }}>{formula.nt}</span>
      </div>
      <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>{formula.c}</div>
      <FlavorBar fp={formula.fp} height={18} />
    </div>
  );
}

function ScatterPlot({ data, selected, onSelect }) {
  const W = 680, H = 400, P = 50;
  const minS = -2.5, maxS = 2.5;
  const allFlavors = data.map(d => {
    const sorted = FLAVORS.filter(f => d.fp[f]).sort((a,b) => (d.fp[b]||0) - (d.fp[a]||0));
    return sorted[0] || "甘";
  });
  
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", maxHeight:400 }}>
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2471A3" stopOpacity="0.06" />
          <stop offset="50%" stopColor="#95A5A6" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#C0392B" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x={P} y={10} width={W-P*2} height={H-P-10} fill="url(#bgGrad)" rx={8} />
      
      {/* Axes */}
      <line x1={P} y1={H-P} x2={W-P} y2={H-P} stroke="#ccc" />
      <line x1={P} y1={10} x2={P} y2={H-P} stroke="#ccc" />
      
      {/* X labels */}
      {[-2,-1,0,1,2].map(v => {
        const x = P + (v - minS) / (maxS - minS) * (W - P*2);
        return <g key={v}>
          <line x1={x} y1={H-P} x2={x} y2={H-P+5} stroke="#999" />
          <text x={x} y={H-P+18} textAnchor="middle" fontSize={10} fill="#666">{v}</text>
        </g>;
      })}
      <text x={W/2} y={H-8} textAnchor="middle" fontSize={11} fill="#888" fontWeight={600}>← 寒涼 ─── 寒熱指數 ─── 溫熱 →</text>
      
      {/* Y label */}
      <text x={14} y={H/2-20} textAnchor="middle" fontSize={11} fill="#888" fontWeight={600} transform={`rotate(-90, 14, ${H/2-20})`}>藥物總用量（兩）</text>
      
      {/* Data points */}
      {data.map((d, i) => {
        const x = P + (d.ns - minS) / (maxS - minS) * (W - P*2);
        const maxW = Math.max(...data.map(dd => dd.tw));
        const y = H - P - (d.tw / maxW) * (H - P - 20);
        const r = Math.max(4, Math.min(12, d.hd.length * 1.5));
        const color = FLAVOR_COLORS[allFlavors[i]];
        const isSel = selected && selected.n === d.n;
        return (
          <g key={i} onClick={() => onSelect(d)} style={{ cursor:"pointer" }}>
            <circle cx={x} cy={y} r={isSel ? r + 3 : r} fill={color} opacity={isSel ? 1 : 0.7}
              stroke={isSel ? "#2c3e50" : "none"} strokeWidth={2} />
            {(isSel || d.tw > 30) && (
              <text x={x} y={y - r - 4} textAnchor="middle" fontSize={10} fill="#333" fontWeight={600}>{d.n}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function OverviewStats({ data }) {
  const tendCount = {};
  data.forEach(d => { tendCount[d.nt] = (tendCount[d.nt]||0)+1; });
  const flavorTotals = {};
  FLAVORS.forEach(f => { flavorTotals[f] = 0; });
  data.forEach(d => { FLAVORS.forEach(f => { if(d.fp[f]) flavorTotals[f] += d.fp[f]; }); });
  const flavorSum = Object.values(flavorTotals).reduce((a,b)=>a+b,0);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
      <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #eee" }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:10, fontWeight:600 }}>四氣偏性分佈</div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {TENDENCIES.slice(1).map(t => (
            <div key={t} style={{ textAlign:"center", flex:1, minWidth:50 }}>
              <div style={{ fontSize:22, fontWeight:800, color: TENDENCY_COLORS[t] }}>{tendCount[t]||0}</div>
              <div style={{ fontSize:11, color:"#666" }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #eee", display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:4, fontWeight:600, alignSelf:"flex-start" }}>五味累計分佈</div>
        {(() => {
          const fpNorm = {};
          const maxF = Math.max(...FLAVORS.map(f => flavorTotals[f]));
          FLAVORS.forEach(f => { fpNorm[f] = maxF > 0 ? Math.round(flavorTotals[f] / maxF * 100) : 0; });
          return <RadarChart fp={fpNorm} size={240} />;
        })()}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:"20px 24px", marginBottom:16, border:"1px solid #eee" }}>
      <h3 style={{ margin:"0 0 12px", fontSize:17, fontFamily:"'Noto Serif TC', serif", color:"#1a1a2e", borderBottom:"2px solid #C94435", paddingBottom:8, display:"inline-block" }}>{title}</h3>
      <div style={{ fontSize:14, lineHeight:2, color:"#444" }}>{children}</div>
    </div>
  );
}

function DefTable({ headers, rows }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse", margin:"12px 0", fontSize:13 }}>
      <thead>
        <tr>{headers.map((h,i) => <th key={i} style={{ textAlign:"left", padding:"8px 12px", background:"#f5f3f0", borderBottom:"2px solid #ddd", fontWeight:700, color:"#333" }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((row,i) => (
          <tr key={i} style={{ borderBottom:"1px solid #eee" }}>
            {row.map((cell,j) => <td key={j} style={{ padding:"8px 12px", verticalAlign:"top" }}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AboutPage() {
  return (
    <div style={{ padding:"20px 24px", maxWidth:800, margin:"0 auto" }}>

      <Section title="一、研究目的">
        <p>本研究以《神農本草經》記載的藥物性味（五味、四氣）為基礎數據，對趙開美翻刻宋本《傷寒論》中的方劑進行量化分析。透過將每味藥物的性味屬性乘以其在方劑中的用量（兩），計算出各方劑在五味（酸、苦、甘、辛、鹹）和四氣（寒、熱、溫、涼、平）上的加權分佈與整體偏性，以數據化方式呈現仲景組方的性味結構特徵。</p>
      </Section>

      <Section title="二、典籍版本">
        <p style={{ fontWeight:600, color:"#1a1a2e" }}>方劑來源——趙開美翻刻宋本《傷寒論》</p>
        <p>底本為明萬曆二十七年（1599年）趙開美刊刻《仲景全書》中之《傷寒論》十卷，原書依北宋治平二年（1065年）林億等校正之「治平本」翻刻，是目前學術界公認最具權威性的通行版本。全書以六經辨證為綱，系統整理東漢張仲景對外感疾病的論述，載方 113 首（含燒褌散），本研究收錄其中可進行性味分析的 {DATA.length} 首（燒褌散非標準藥方不納入）。宋本少陽病篇（卷第五）僅有條文而無獨立方劑，另「禹餘糧丸」原文載「禹餘糧方闕」，均未收錄。</p>

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:16 }}>比較版本——桂林古本《傷寒雜病論》</p>
        <p>據稱為張仲景第十二稿之世傳抄本，清末由張仲景後裔張紹祖傳予桂林左盛德，再傳羅哲初。1934年黃竹齋抄寫為《白雲閣藏本》，1939年校刊公世，1960年廣西人民出版社據羅哲初之子獻出的原稿排印出版。全書十六卷，較宋本多出六氣主客、傷暑病、熱病、濕病、傷燥病、傷風病、寒病等篇章，並將《金匱要略》內容整合其中，結構最為完整。學術界對其真偽仍有爭議——支持者認為其補足了宋本的殘缺，反對者認為部分條文反映了清代溫病學派的影響。本研究將桂林古本作為異文比較的參考版本之一。</p>

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:16 }}>比較版本——康平本（康治本）《傷寒論》</p>
        <p>日本傳本。康平本為日本丹波雅忠於康平三年（1060年）據家傳本抄寫，早於宋本定本時間（1065年）五年，被認為可能是唐代空海（弘法大師）於貞元二十一年（805年）傳入日本的古本。此本最重要的特徵是保留了「頂格、降一格、降兩格」的行格體例以及旁注、腳注的區分，可能反映了不同時期注解疊加的痕跡——頂格文字被認為是仲景原文，降格文字可能為後世注文。1858年由日本京都書林刊行，後經大塚敬節校正、葉橘泉重校。康治本為更早的殘本，僅存 50 首方，1849年為戶上重較氏發現。本研究將康平本作為異文比較的另一參考版本。</p>

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:16 }}>版本比較說明</p>
        <p>本研究的性味分析以宋本為唯一藍本，桂林古本與康平本僅用於條文異文的對照參考。在每首方劑的「相關條文」中，若該條文在桂林古本或康平本中有文字出入，可點擊「異文」按鈕展開比較。</p>

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:16 }}>性味來源——《神農本草經》</p>
        <p>藥物的五味與四氣數據以《神農本草經》原文記載為主。現存本草經為清代輯佚本（孫星衍輯本），主要從宋《證類本草》中還原。部分藥物因名稱差異需做對應（見下方藥名對應表）。</p>
        <p>本草經未獨立收錄的藥物，依以下文獻手動補充性味：</p>
        <p>
          <strong>《名醫別錄》</strong>（漢末魏晉）：補充細辛「味辛溫」等本草經缺載之品目。原書已佚，內容保存於《本草經集注》及《證類本草》中。<br/>
          <strong>《本草經集注》</strong>（南朝梁·陶弘景）：陶弘景以朱墨分書保存本草經原文與別錄增補，為判斷藥名對應及性味修訂的重要參考。<br/>
          <strong>歷代本草共識</strong>：如生薑與乾姜之鮮乾區分、桂枝兼具甘味、蔥白通陽散寒等，屬歷代本草學家及臨床家長期累積的公認見解，非取自單一文獻。<br/>
          <strong>藥食同源品目</strong>：粳米、膠飴（飴糖）、香豉（淡豆豉）、雞子（雞蛋）等食物性藥材，依傳統飲食療法文獻及中藥學教科書補充性味。
        </p>
      </Section>

      <Section title="三、操作型定義">
        <p style={{ fontWeight:600, color:"#1a1a2e" }}>3.1 五味定義與量化</p>
        <p>五味指酸、苦、甘、辛、鹹五種藥味，取自《神農本草經》原文「味X」之記載。每味藥可有一個或多個味（如桂枝辛甘）。</p>
        <p>量化方式：某方劑中，某味的權重 = 該方劑中所有含此味藥物的用量（兩）之和。五味百分比 = 某味權重 ÷ 方劑總用量 × 100%。因一味藥可兼具多味，故五味百分比之和可能超過 100%。</p>
        <p>五味以五角雷達圖（Pentagon Radar Chart）呈現，五個頂點分別代表酸、苦、甘、辛、鹹，數值越大表示該味在方劑中的佔比越高。</p>

        <DefTable
          headers={["五味", "色標", "代表藥例"]}
          rows={[
            [<span style={{fontWeight:700,color:"#666"}}>辛</span>, <span style={{display:"inline-block",width:14,height:14,borderRadius:3,background:"#A0A0A0",border:"1px solid #666",verticalAlign:"middle"}} />, "桂枝、生薑、附子、細辛、麻黃"],
            [<span style={{fontWeight:700,color:"#D4A017"}}>甘</span>, <span style={{display:"inline-block",width:14,height:14,borderRadius:3,background:"#D4A017",verticalAlign:"middle"}} />, "甘草、大棗、人參、茯苓、膠飴"],
            [<span style={{fontWeight:700,color:"#C94435"}}>苦</span>, <span style={{display:"inline-block",width:14,height:14,borderRadius:3,background:"#C94435",verticalAlign:"middle"}} />, "黃連、黃芩、大黃、梔子、厚朴"],
            [<span style={{fontWeight:700,color:"#3A8F5C"}}>酸</span>, <span style={{display:"inline-block",width:14,height:14,borderRadius:3,background:"#3A8F5C",verticalAlign:"middle"}} />, "烏梅、五味子、芍藥"],
            [<span style={{fontWeight:700,color:"#34495E"}}>鹹</span>, <span style={{display:"inline-block",width:14,height:14,borderRadius:3,background:"#34495E",verticalAlign:"middle"}} />, "牡蠣、龍骨、芒硝、水蛭"],
          ]}
        />

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:20 }}>3.2 四氣定義與量化</p>
        <p>四氣指藥物的寒、熱、溫、涼四種藥性，加上「平」共五類。取自《神農本草經》原文「味X寒/溫/平」等記載，含修飾語「微」「小」。</p>
        <p>量化方式：將四氣轉換為數值分數，再以用量加權計算方劑整體的「寒熱指數」。</p>

        <DefTable
          headers={["四氣", "量化分數", "說明"]}
          rows={[
            ["大寒", "-3", "極寒之性"],
            ["寒", "-2", "寒性"],
            ["微寒 / 小寒 / 涼", "-1", "偏寒"],
            ["平", "0", "平性，不偏寒熱"],
            ["微溫 / 小溫", "+1", "偏溫"],
            ["溫", "+2", "溫性"],
            ["大溫 / 熱", "+3", "極溫熱之性"],
          ]}
        />

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:20 }}>3.3 寒熱指數計算</p>
        <p>寒熱指數 = Σ（各藥四氣分數 × 該藥用量）÷ 方劑總用量</p>
        <p>例：四逆湯 = 甘草（平=0）×2兩 + 乾薑（溫=+2）×1.5兩 + 附子（溫=+2）×1.5兩 = (0×2 + 2×1.5 + 2×1.5) ÷ 5 = +1.2</p>

        <DefTable
          headers={["寒熱指數範圍", "偏性判定", "代表方劑"]}
          rows={[
            ["≤ -1.5", "大寒", "大陷胸湯、梔子豉湯、枳實梔子豉湯"],
            ["-1.5 ~ -0.5", "偏寒", "白虎湯、小承氣湯、炙甘草湯"],
            ["-0.5 ~ +0.5", "平性", "小柴胡湯、芍藥甘草湯、黃芩湯"],
            ["+0.5 ~ +1.5", "偏溫", "桂枝湯、四逆湯、理中丸"],
            ["≥ +1.5", "大溫", "麻黃湯、白通湯、乾薑附子湯"],
          ]}
        />

        <p style={{ fontWeight:600, color:"#1a1a2e", marginTop:20 }}>3.4 用量換算</p>
        <p>方劑中藥物用量以「兩」為統一基準單位，依東漢度量衡進行換算：</p>
        <DefTable
          headers={["原文單位", "換算為兩", "備註"]}
          rows={[
            ["兩", "1兩", "基準單位（東漢1兩 ≈ 15.6g）"],
            ["斤", "16兩", "1斤 = 16兩"],
            ["升", "≈ 5兩", "容量單位，依藥材密度估算"],
            ["合", "≈ 0.5兩", "1合 = 1/10升"],
            ["銖", "1/24兩", "24銖 = 1兩"],
            ["枚（大棗）", "≈ 0.2兩/枚", "依果實大小估算"],
            ["個（杏仁）", "≈ 0.02兩/個", "小粒藥物"],
            ["如雞子大", "≈ 3兩", "石膏等礦物"],
          ]}
        />
      </Section>

      <Section title="四、藥名對應表">
        <p>《傷寒論》與《神農本草經》成書時代不同，部分藥名有異。以下為本研究的對應規則：</p>
        <DefTable
          headers={["傷寒論用名", "本草經對應", "說明"]}
          rows={[
            ["桂枝", "牡桂（手動補充：辛甘溫）", "牡桂之嫩枝，本草經載牡桂味辛溫"],
            ["芍藥", "勺藥", "古字通用"],
            ["生薑", "手動補充：辛微溫", "與乾姜（辛溫）為同物鮮乾之別，性味不同"],
            ["柴胡", "茨胡", "古字通用"],
            ["梔子 / 肥梔子", "支子", "古字通用"],
            ["芒硝", "消石", "同物異名"],
            ["厚朴", "厚樸", "字形差異"],
            ["黃檗 / 黃柏", "蘗木", "同物異名"],
            ["杏仁", "杏核（甘溫）", "杏核之仁，本研究依本草經原文取甘溫"],
            ["烏梅", "梅實", "同物加工品"],
            ["萎蕤", "委萎", "即玉竹"],
            ["白朮", "术", "古今名異"],
            ["細辛", "手動補充：辛溫", "本草經無獨立條目"],
            ["生地黃", "乾地黃", "原文載「生者尤良」"],
          ]}
        />
        <p style={{ fontSize:12, color:"#888", marginTop:8 }}>手動補充：指《神農本草經》中未獨立收錄，依傳統本草學文獻補充性味的藥物。包括生薑、桂枝、細辛、粳米、膠飴、蔥白、香豉、赤小豆、雞子黃等。</p>
      </Section>

      <Section title="五、性味爭議藥物">
        <p>以下藥物的性味在《神農本草經》與後世本草之間存在差異，或本研究的處理方式需要特別說明。本研究原則上以《神農本草經》為準，但列出爭議供研究者參考。</p>
        <DefTable
          headers={["藥物", "本研究取值", "本草經原文", "後世觀點 / 爭議"]}
          rows={[
            ["杏仁", "甘溫", "杏核　味甘溫", "《名醫別錄》載味苦溫有毒。後世本草多以杏仁味苦，苦能降氣，主治咳喘。臨床上杏仁多歸於苦味，與本草經甘味之記載有顯著差異。"],
            ["桂枝", "辛甘溫（手動）", "牡桂　味辛溫", "本草經載牡桂味辛溫，桂枝為牡桂之嫩枝。後世多認為桂枝兼具甘味，本研究取辛甘溫。另箘桂（肉桂）亦味辛溫，與桂枝為同物不同部位，功效有別。"],
            ["生薑", "辛微溫（手動）", "（本草經僅載乾姜）", "本草經不分生薑、乾姜，僅載乾姜味辛溫。生薑為鮮品，性偏散表，乾姜為乾燥品，性偏溫中。本研究將生薑獨立設為辛微溫，以區別於乾姜之辛溫。"],
            ["芍藥", "苦（無四氣）", "勺藥　味苦", "本草經僅載味苦，未記四氣，故不納入寒熱指數計算。後世分白芍（苦酸微寒）、赤芍（苦微寒），性味有別。傷寒論中芍藥未區分赤白。"],
            ["芒硝", "苦寒", "消石　味苦寒", "本研究以芒硝對應消石。但消石與芒硝是否為同一物，歷代有爭議。一說消石為硝石（硝酸鉀），芒硝為朴硝（硫酸鈉），二者成分不同。"],
            ["細辛", "辛溫（手動）", "（本草經無獨立條目）", "本草經未見細辛獨立條目，本研究依《名醫別錄》「味辛溫」補充。後世有「細辛不過錢」之說，用量爭議亦大。"],
            ["赤石脂", "甘平", "五石脂　味甘平", "本草經將青石脂、赤石脂、黃石脂、白石脂、黑石脂合為一條，統稱味甘平。後世認為赤石脂味甘酸溫，與本草經有異。"],
            ["麻仁 / 麻子仁", "辛平", "麻蕡　味辛平", "本草經載麻蕡味辛平，但麻子仁為大麻種仁，後世多認為味甘平，潤腸通便。辛味與甘味之別影響方劑五味分析。"],
          ]}
        />
      </Section>

      <Section title="六、研究限制">
        <p>1. <strong>性味來源單一</strong>：僅取《神農本草經》之記載，未參照後世本草（如《本草經集注》《名醫別錄》等）的增補修訂。部分藥物在本草經中的四氣記載缺失（如芍藥僅載「味苦」無四氣），此類藥物在計算寒熱指數時不納入四氣權重。</p>
        <p>2. <strong>五味疊加</strong>：一味藥可兼具多味（如桂枝辛甘），計算時每個味分別乘以該藥用量，因此五味百分比之和可能超過 100%。此為設計選擇，旨在忠實反映藥物的複合味性。</p>
        <p>3. <strong>用量換算為估算</strong>：升、合等容量單位換算為兩時，因不同藥材密度差異，存在誤差。本研究取統一近似值，重在方劑內各藥的相對比例而非絕對重量。</p>
        <p>4. <strong>炮製部分納入</strong>：炮製（炙、炮、去皮尖等）可改變藥物性味。本研究已就影響最大的兩味藥物進行炮製後的性味調整：</p>
        <p style={{ paddingLeft:16 }}>
          <strong>甘草（炙 vs 生）</strong>：宋本 112 首方劑中，有 69 方使用炙甘草，僅甘草湯、桔梗湯 2 方用生甘草。甘草經蜜炙後，性質由甘平轉為甘溫，功效從清熱解毒轉為補中益氣。本研究將炙甘草設為甘溫（四氣分數 +2），生甘草維持甘平（四氣分數 0），依宋本原文炮製標註自動區分。
        </p>
        <p style={{ paddingLeft:16 }}>
          <strong>附子（生用 vs 炮）</strong>：傷寒論中附子有「炮，去皮，破八片」與「生用，去皮，破八片」兩種用法。生附子回陽力猛、毒性較大，本研究設為辛、大溫（四氣分數 +3）；炮附子毒性降低、溫性和緩，維持辛溫（四氣分數 +2）。如四逆湯、通脈四逆湯、白通湯等 8 方用生附子，真武湯、附子湯等 12 方用炮附子，依宋本原文炮製標註自動區分。
        </p>
        <p style={{ paddingLeft:16 }}>
          <strong>尚未納入的炮製</strong>：厚朴（炙，去皮）、枳實（炙）、半夏（洗）等藥物亦有炮製標註，但炮製後性味變化相對較小或文獻依據不足，本研究暫未調整，仍為潛在誤差來源。
        </p>
        <p style={{ paddingLeft:16 }}>
          <strong>未來改進方向</strong>：若能整合宋《證類本草》中保存的《名醫別錄》性味增補及《雷公炮炙論》炮製記載，可進一步建立更完整的炮製修正體系。惟此二書原書已佚，僅存轉引內容，需審慎考證後方可採用。
        </p>
        <p>5. <strong>歸經未納入</strong>：《神農本草經》未明確記載歸經，故本研究僅分析五味與四氣兩個維度。</p>
      </Section>

      <Section title="七、參考文獻">
        <p style={{ fontSize:13, lineHeight:2.2, color:"#555" }}>
          [1] 基于多维宏观量化方法解读《伤寒论》寒热错杂证组方规律. 中华中医药学会期刊, 2023. 該研究同樣以四氣五味計分×劑量的加權方法，分析傷寒論 7 首寒熱錯雜證方劑（黃連湯、半夏瀉心湯、烏梅丸等）的四氣五味作用度，為本研究的量化方法提供了學術先例。<br/>
          [2] 神農本草經. 清·孫星衍輯本. 本研究性味數據之主要來源。<br/>
          [3] 傷寒論. 趙開美翻刻宋本（明萬曆二十七年刊本）. 本研究方劑來源之底本。<br/>
          [4] 本草經集注. 南朝梁·陶弘景. 以朱墨分書保存本草經原文與名醫別錄增補，為後世本草學之樞紐。<br/>
          [5] 名醫別錄. 漢末魏晉間醫家撰，原書已佚. 記錄後世醫家對本草經藥物的四氣、性味增補意見，內容保存於《本草經集注》及《證類本草》中。<br/>
          [6] 雷公炮炙論. 南朝劉宋·雷斅，原書已佚. 中國最早炮製專書，記載藥物炮製方法及前後性味變化，內容散見於《證類本草》。<br/>
          [7] 經史證類備急本草（證類本草）. 宋·唐慎微. 分層收錄歷代本草文獻，為保存古本草資料最完整之著作，未來可作為多層性味分析之依據。
        </p>
      </Section>

      <div style={{ textAlign:"center", padding:"24px 0", fontSize:11, color:"#bbb", lineHeight:1.8 }}>
        方劑來源：趙開美翻刻宋本《傷寒論》（明萬曆二十七年刊本）<br/>
        性味來源：《神農本草經》<br/>
      </div>
    </div>
  );
}

function AuthorPage() {
  return (
    <div style={{ padding:"20px 24px", maxWidth:800, margin:"0 auto" }}>

      {/* Author Card */}
      <div style={{ background:"#fff", borderRadius:12, padding:"32px 28px", marginBottom:20, border:"1px solid #eee", textAlign:"center" }}>
        <div style={{
          width:80, height:80, borderRadius:"50%", margin:"0 auto 16px",
          background:"linear-gradient(135deg, #1a1a2e, #0f3460)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:36, color:"#fff", fontFamily:"'Noto Serif TC', serif"
        }}>吳</div>
        <h2 style={{ margin:"0 0 4px", fontSize:24, fontFamily:"'Noto Serif TC', serif", color:"#1a1a2e" }}>吳啓銘</h2>
        <p style={{ fontSize:14, color:"#888", margin:"0 0 16px" }}>中醫博士</p>
        <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
          {["教育部審定助理教授", "臻品中醫診所副院長"].map(t => (
            <span key={t} style={{
              fontSize:13, padding:"4px 14px", borderRadius:20,
              background:"#f5f3f0", color:"#555", border:"1px solid #e8e4df"
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <Section title="研究初心">
        <p>《傷寒論》是中醫臨床的根基之作，然而千年經典的研究從來不是一件容易的事。條文之間的邏輯、方劑組成的巧思、性味配伍的深意，往往需要反覆推敲、長年浸潤，才能略窺堂奧。</p>
        <p>近年人工智慧技術的發展，為經典研究開啟了新的可能。我開始嘗試以 AI 作為輔助工具，將《神農本草經》的性味數據與《傷寒論》的方劑組成進行系統性的量化分析——不是要取代傳統的讀書方法，而是希望透過數據化的視角，讓自己對每一首方劑的性味結構有更清晰、更直覺的理解。</p>
        <p>這個研究網頁是學習過程中的產物。將它整理出來與大家分享，一方面是希望能為同樣在研讀傷寒論的同道提供一個參考工具，另一方面也期待拋磚引玉，讓更多人一起探索經典與現代技術結合的可能性。</p>
        <p>中醫的學問博大精深，任何量化分析都有其局限。數據可以輔助思考，但無法取代臨床經驗與對經典的深入體悟。希望這個小小的工具，能成為大家學習路上的一個起點，而非終點。</p>
      </Section>

      {/* CC License */}
      <Section title="授權條款">
        <div style={{ display:"flex", gap:16, alignItems:"flex-start", flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:280 }}>
            <p>本網站內容採用 <strong>Creative Commons 姓名標示-非商業性-相同方式分享 4.0 國際授權條款</strong>（CC BY-NC-SA 4.0）授權。</p>
            <p style={{ marginTop:12 }}>您可以自由地：</p>
            <p>
              <strong>分享</strong> — 以任何媒介或格式重製及散布本素材。<br/>
              <strong>改作</strong> — 重混、轉換本素材、及依本素材建立新素材。
            </p>
            <p style={{ marginTop:12 }}>但須遵守以下條件：</p>
            <p>
              <strong>姓名標示</strong> — 您必須標示作者姓名（吳啓銘），並提供授權條款的連結。<br/>
              <strong>非商業性</strong> — 您不得將本素材用於商業目的。<br/>
              <strong>相同方式分享</strong> — 若您改作本素材，必須以相同授權條款散布。
            </p>
          </div>
          <div style={{ textAlign:"center", padding:16 }}>
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant" target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none" }}>
              <div style={{
                display:"flex", gap:4, justifyContent:"center", marginBottom:8
              }}>
                {["CC","BY","NC","SA"].map(icon => (
                  <span key={icon} style={{
                    width:32, height:32, borderRadius:"50%", background:"#333", color:"#fff",
                    display:"inline-flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:800
                  }}>{icon}</span>
                ))}
              </div>
              <span style={{ fontSize:12, color:"#888" }}>CC BY-NC-SA 4.0</span>
            </a>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <div style={{ background:"#fff", borderRadius:12, padding:"20px 24px", marginBottom:20, border:"1px solid #eee", textAlign:"center" }}>
        <a href="https://drwu.carrd.co" target="_blank" rel="noopener noreferrer" style={{
          display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px",
          background:"linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color:"#fff",
          borderRadius:8, textDecoration:"none", fontSize:14, fontWeight:600, letterSpacing:1,
          transition:"opacity 0.2s",
        }}>
          <span style={{ fontSize:18 }}>👨‍⚕️</span>
          <span>吳啓銘中醫師線上名片</span>
          <span style={{ fontSize:12, opacity:0.7 }}>↗</span>
        </a>
      </div>

      <div style={{ textAlign:"center", padding:"24px 0", fontSize:11, color:"#bbb", lineHeight:1.8 }}>
        © 2026 吳啓銘 中醫博士　　以 CC BY-NC-SA 4.0 授權釋出
      </div>
    </div>
  );
}

function ClauseItem({ cl, isLast }) {
  const [showDiffs, setShowDiffs] = useState(false);
  const hasDiffs = cl.d && cl.d.length > 0;
  return (
    <div style={{ padding:"10px 14px", borderBottom: isLast ? "none" : "1px solid #f0f0f0" }}>
      <div style={{ fontSize:13, lineHeight:1.8, color:"#444" }}>
        <span style={{
          display:"inline-block", fontSize:10, fontWeight:700, color:"#fff",
          background:"#1a1a2e", borderRadius:4, padding:"1px 8px", marginRight:8,
          verticalAlign:"middle", fontFamily:"monospace",
        }}>{cl.num}</span>
        <span>{cl.t}</span>
        {hasDiffs && (
          <span onClick={() => setShowDiffs(!showDiffs)} style={{
            display:"inline-block", fontSize:9, color:"#C94435", marginLeft:8,
            cursor:"pointer", verticalAlign:"middle", fontWeight:600,
            padding:"1px 6px", borderRadius:3, border:"1px solid #C94435",
          }}>{showDiffs ? "收合比較" : `異文 ${cl.d.length}`}</span>
        )}
      </div>
      {showDiffs && hasDiffs && (
        <div style={{ marginTop:6, paddingLeft:8, borderLeft:"2px solid #e0ddd8" }}>
          {cl.d.map((d, j) => (
            <div key={j} style={{ fontSize:12, lineHeight:1.7, color:"#777", marginBottom:4 }}>
              <span style={{
                display:"inline-block", fontSize:9, fontWeight:700,
                color: d.v === "桂" ? "#2E86C1" : "#E67E22",
                background: d.v === "桂" ? "#EBF5FB" : "#FEF5E7",
                borderRadius:3, padding:"0px 5px", marginRight:6,
              }}>{d.v === "桂" ? "桂林古本" : "康治本"}</span>
              <span>{d.t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ selected, compare, setCompare, onClose }) {
  const [expandedHerb, setExpandedHerb] = useState(null);
  return (
    <div style={{
      flex:1, background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee",
      alignSelf:"flex-start"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <div>
          <h2 style={{ margin:0, fontSize:22, fontFamily:"'Noto Serif TC', serif" }}>{selected.n}</h2>
          <div style={{ fontSize:13, color:"#888", marginTop:4 }}>{selected.c}</div>
        </div>
        <button onClick={onClose} style={{
          background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#aaa", padding:4
        }}>✕</button>
      </div>

      {/* Nature score */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"#888" }}>寒熱指數</span>
          <span style={{ fontSize:14, fontWeight:700, color: TENDENCY_COLORS[selected.nt] }}>
            {selected.ns > 0 ? "+" : ""}{selected.ns} ({selected.nt})
          </span>
        </div>
        <NatureGauge score={selected.ns} />
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#aaa", marginTop:4 }}>
          <span>大寒</span><span>偏寒</span><span>平</span><span>偏溫</span><span>大溫</span>
        </div>
      </div>

      {/* Flavor radar */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:12, color:"#888" }}>五味分佈</span>
          <select value={compare ? compare.n : ""} onChange={e => {
            const f = DATA.find(d => d.n === e.target.value);
            setCompare(f || null);
          }} style={{ fontSize:11, padding:"2px 6px", borderRadius:4, border:"1px solid #ddd", color:"#555", background:"#fafafa" }}>
            <option value="">對比方劑...</option>
            {DATA.filter(d => d.n !== selected.n).map(d => (
              <option key={d.n} value={d.n}>{d.n}</option>
            ))}
          </select>
        </div>
        <div style={{ display:"flex", justifyContent:"center" }}>
          <RadarChart fp={selected.fp} fp2={compare ? compare.fp : null}
            label={selected.n} label2={compare ? compare.n : null} size={300} />
        </div>
      </div>

      {/* Nature groups */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>四氣構成</div>
        <div style={{ display:"flex", gap:8 }}>
          {["寒涼","平","溫熱"].map(g => (
            <div key={g} style={{ flex:1, textAlign:"center", padding:"8px 0", borderRadius:8, background:"#f8f8f8" }}>
              <div style={{ fontSize:18, fontWeight:700, color: g==="寒涼"?"#3498DB":g==="溫熱"?"#E67E22":"#7F8C8D" }}>
                {selected.ng[g]}%
              </div>
              <div style={{ fontSize:11, color:"#888" }}>{g}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula original text */}
      {(selected.hl || selected.cm) && (
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:6 }}>組成與煎服法（原文）</div>
        <div style={{ padding:"12px 16px", borderRadius:8, background:"#faf8f5", border:"1px solid #e8e4df", fontSize:13, lineHeight:2, color:"#555" }}>
          {selected.hl && <p style={{ margin:"0 0 8px", fontWeight:600 }}>{selected.hl}</p>}
          {selected.cm && <p style={{ margin:0 }}>{selected.cm}</p>}
        </div>
      </div>
      )}

      {/* Herbs */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>
          藥物組成（{selected.hd.length} 味，總 {selected.tw} 兩）
          <span style={{ fontSize:10, color:"#bbb", marginLeft:8 }}>點擊藥物查看本草經原文</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap" }}>
          {[...selected.hd].sort((a,b) => b.w - a.w).map((h,i) => (
            <HerbPill key={i} herb={h}
              expanded={expandedHerb === h.n}
              onToggle={() => setExpandedHerb(expandedHerb === h.n ? null : h.n)} />
          ))}
        </div>
      </div>

      {/* Clauses */}
      {selected.cl && selected.cl.length > 0 && (
      <div>
        <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>
          相關條文（{selected.cl.length} 條）
        </div>
        <div style={{ maxHeight:400, overflowY:"auto", borderRadius:8, border:"1px solid #eee" }}>
          {selected.cl.map((cl, i) => (
            <ClauseItem key={i} cl={cl} isLast={i === selected.cl.length-1} />
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function App() {
  const [cat, setCat] = useState("全部");
  const [tend, setTend] = useState("全部");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [compare, setCompare] = useState(null);
  const [view, setView] = useState("list"); // list | scatter
  const [page, setPage] = useState("analysis"); // analysis | about | author

  const filtered = useMemo(() => {
    return DATA.filter(d => {
      if (cat !== "全部" && d.c !== cat) return false;
      if (tend !== "全部" && d.nt !== tend) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!d.n.includes(q) && !d.hd.some(h => h.n.includes(q))) return false;
      }
      return true;
    });
  }, [cat, tend, search]);

  return (
    <div style={{ fontFamily:"'Noto Sans TC', 'Hiragino Sans', sans-serif", background:"#F7F5F2", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", color:"#fff", padding:"32px 24px 24px" }}>
        <h1 style={{ margin:0, fontSize:26, fontWeight:800, fontFamily:"'Noto Serif TC', serif", letterSpacing:2 }}>
          傷寒論方劑性味分析
        </h1>
        <p style={{ margin:"8px 0 0", fontSize:13, opacity:0.65, lineHeight:1.8 }}>
          以《神農本草經》五味四氣數據為基礎，結合藥物用量加權計算，對趙開美翻刻宋本《傷寒論》{DATA.length} 首方劑進行性味結構量化分析。每首方劑附有組成原文、煎服法、宋桂康三版本條文異文比較，以及各藥物之《神農本草經》原文對照。
        </p>
        <div style={{ display:"flex", gap:4, marginTop:16 }}>
          {[["analysis","方劑分析"],["about","研究說明"],["author","關於作者"]].map(([k,label]) => (
            <button key={k} onClick={() => setPage(k)} style={{
              padding:"8px 20px", borderRadius:"8px 8px 0 0", border:"none", cursor:"pointer",
              fontSize:14, fontWeight:600, letterSpacing:1,
              background: page===k ? "#F7F5F2" : "rgba(255,255,255,0.12)",
              color: page===k ? "#1a1a2e" : "rgba(255,255,255,0.7)",
              transition:"all 0.2s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      {page === "about" ? <AboutPage /> : page === "author" ? <AuthorPage /> : (
      <div style={{ padding:"20px 24px", maxWidth:960, margin:"0 auto" }}>
        <OverviewStats data={filtered} />

        {/* Filters */}
        <div style={{ background:"#fff", borderRadius:12, padding:16, marginBottom:16, border:"1px solid #eee" }}>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", marginBottom:12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋方劑或藥物..."
              style={{ flex:1, minWidth:180, padding:"8px 14px", borderRadius:8, border:"1px solid #ddd", fontSize:14, outline:"none" }} />
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={() => setView("list")} style={{
                padding:"6px 14px", borderRadius:6, border:"1px solid #ddd", cursor:"pointer",
                background: view==="list" ? "#2c3e50" : "#fff", color: view==="list" ? "#fff" : "#333", fontSize:13, fontWeight:600
              }}>列表</button>
              <button onClick={() => setView("scatter")} style={{
                padding:"6px 14px", borderRadius:6, border:"1px solid #ddd", cursor:"pointer",
                background: view==="scatter" ? "#2c3e50" : "#fff", color: view==="scatter" ? "#fff" : "#333", fontSize:13, fontWeight:600
              }}>散佈圖</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            <span style={{ fontSize:12, color:"#888", lineHeight:"28px" }}>六經：</span>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:"4px 12px", borderRadius:16, border:"1px solid #ddd", cursor:"pointer", fontSize:12,
                background: cat===c ? "#2c3e50" : "#fff", color: cat===c ? "#fff" : "#555", fontWeight: cat===c ? 600 : 400
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:12, color:"#888", lineHeight:"28px" }}>偏性：</span>
            {TENDENCIES.map(t => (
              <button key={t} onClick={() => setTend(t)} style={{
                padding:"4px 12px", borderRadius:16, border:"1px solid #ddd", cursor:"pointer", fontSize:12,
                background: tend===t ? (TENDENCY_COLORS[t]||"#2c3e50") : "#fff",
                color: tend===t ? "#fff" : "#555", fontWeight: tend===t ? 600 : 400
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>
          共 {filtered.length} 首方劑
        </div>

        {/* Content */}
        {view === "scatter" ? (
          <div style={{ background:"#fff", borderRadius:12, padding:16, border:"1px solid #eee", marginBottom:16 }}>
            <div style={{ display:"flex", gap:12, marginBottom:10, justifyContent:"center", flexWrap:"wrap" }}>
              {FLAVORS.map(f => (
                <span key={f} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:FLAVOR_COLORS[f], display:"inline-block" }} />
                  {f}
                </span>
              ))}
            </div>
            <ScatterPlot data={filtered} selected={selected} onSelect={setSelected} />
          </div>
        ) : null}

        <div style={{ display:"flex", gap:16, flexDirection: view === "list" ? "row" : "column" }}>
          {/* Formula List */}
          <div style={{
            background:"#fff", borderRadius:12, border:"1px solid #eee", overflow:"hidden",
            width: view === "list" && selected ? "45%" : "100%",
            maxHeight: view === "list" ? 600 : "none", overflowY:"auto",
            transition:"width 0.2s"
          }}>
            {filtered.map(f => (
              <FormulaCard key={f.n} formula={f} selected={selected && selected.n === f.n}
                onClick={() => setSelected(selected && selected.n === f.n ? null : f)} />
            ))}
            {filtered.length === 0 && (
              <div style={{ padding:40, textAlign:"center", color:"#aaa" }}>無符合條件的方劑</div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <DetailPanel selected={selected} compare={compare} setCompare={setCompare} onClose={() => setSelected(null)} />
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", padding:"24px 0", fontSize:11, color:"#bbb", lineHeight:1.8 }}>
          © 2026 吳啓銘 中醫博士　　性味來源：《神農本草經》 · 方劑來源：趙開美翻刻宋本《傷寒論》
        </div>
      </div>
      )}
    </div>
  );
}
