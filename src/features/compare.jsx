// Extracted compare feature reference for future app migration.
// Not connected to current browser runtime yet.
// Exported as an importable module with injected dependencies.

export function ComparePage({
  compareList,
  setCompareList,
  data = [],
  compareGroups = [],
  flavors = [],
  flavorColors = {},
  tendencyColors = {},
  NatureGaugeComponent = null,
}) {
  const EXTRA_COMPARE_GROUPS = [
    { title: "發汗方", desc: "解表發汗代表方", formulas: ["麻黃湯", "桂枝湯", "桂枝加葛根湯", "葛根湯", "大青龍湯", "小青龍湯"] },
    { title: "水氣方", desc: "利水化氣與治水代表方", formulas: ["五苓散", "真武湯", "茯苓桂枝白朮甘草湯", "豬苓湯"] },
    { title: "瀉下方", desc: "攻下通腑代表方", formulas: ["大承氣湯", "小承氣湯", "調胃承氣湯", "麻子仁丸", "蜜煎導"] },
    { title: "少陽和解", desc: "和解少陽代表方", formulas: ["小柴胡湯", "大柴胡湯", "柴胡桂枝湯", "柴胡加龍骨牡蠣湯"] },
    { title: "溫中補虛", desc: "溫中散寒、補虛調中", formulas: ["小建中湯", "理中丸", "吳茱萸湯"] },
    { title: "清氣分熱", desc: "清陽明氣分熱", formulas: ["白虎湯", "白虎加人參湯"] },
  ];
  const compareGroupOptions = [...compareGroups, ...EXTRA_COMPARE_GROUPS];
  const items = compareList.map(n => data.find(d => d.n === n)).filter(Boolean);
  const allHerbs = {};
  items.forEach(fm => fm.hd.forEach(h => { if (!allHerbs[h.n]) allHerbs[h.n] = {}; allHerbs[h.n][fm.n] = h; }));
  const herbNames = Object.keys(allHerbs);
  const shared = herbNames.filter(h => items.every(fm => fm.hd.some(x => x.n === h)));
  const unique = {};
  items.forEach(fm => { unique[fm.n] = fm.hd.filter(h => !shared.includes(h.n)).map(h => h.n); });
  const formatNum = (v) => {
    const n = Math.round(v * 10) / 10;
    return `${n}`.replace(/\.0$/, "");
  };
  const buildDeltaSummary = (base, target) => {
    const baseMap = Object.fromEntries(base.hd.map(h => [h.n, h.w]));
    const targetMap = Object.fromEntries(target.hd.map(h => [h.n, h.w]));
    const added = target.hd.filter(h => !(h.n in baseMap)).map(h => h.n);
    const removed = base.hd.filter(h => !(h.n in targetMap)).map(h => h.n);
    const adjusted = target.hd
      .filter(h => h.n in baseMap)
      .map(h => ({ name: h.n, diff: h.w - baseMap[h.n] }))
      .filter(x => Math.abs(x.diff) >= 0.5)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .map(x => `${x.name}${x.diff > 0 ? "增" : "減"}${formatNum(Math.abs(x.diff))}兩`);
    const parts = [];
    if (added.length) parts.push(`增${added.slice(0, 3).join("、")}`);
    if (removed.length) parts.push(`去${removed.slice(0, 3).join("、")}`);
    if (adjusted.length) parts.push(`並調整${adjusted.slice(0, 3).join("、")}`);
    const nsDiff = target.ns - base.ns;
    const tendency = nsDiff > 0.35 ? "寒熱傾向較溫" : nsDiff < -0.35 ? "寒熱傾向較寒" : "寒熱傾向接近";
    if (parts.length === 0) return `相較${base.n}，${target.n}藥物組成近似，${tendency}。`;
    return `相較${base.n}，${target.n}${parts.join("，")}，${tendency}。`;
  };
  const comparisonSummary = items.length > 1 ? items.slice(1).map(target => buildDeltaSummary(items[0], target)) : [];

  return (
    <div style={{ padding:"20px 24px", maxWidth:960, margin:"0 auto" }}>
      {/* Preset groups */}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:13, color:"#888", marginBottom:8 }}>預設比較組</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {compareGroupOptions.map((g,i) => (
            <button key={i} onClick={() => setCompareList(g.formulas)}
              style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #ddd", background:"#fff",
                fontSize:12, cursor:"pointer", textAlign:"left", lineHeight:1.4 }}>
              <span style={{ fontWeight:600 }}>{g.title}</span>
              <br/><span style={{ color:"#999", fontSize:10 }}>{g.formulas.length}方</span>
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:12, padding:40, border:"1px solid #eee", textAlign:"center", color:"#aaa" }}>
          <p style={{ fontSize:16, marginBottom:12 }}>選擇要比較的方劑</p>
          <p style={{ fontSize:13 }}>從上方預設組選取，或在「方劑分析」頁點擊方劑詳情中的「加入比較」按鈕</p>
        </div>
      ) : (
        <div>
          {/* Selected pills */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {items.map(fm => (
              <span key={fm.n} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"4px 12px",
                borderRadius:20, background:"#2c3e50", color:"#fff", fontSize:13, fontWeight:600 }}>
                {fm.n}
                <span onClick={() => setCompareList(compareList.filter(n => n !== fm.n))}
                  style={{ cursor:"pointer", opacity:0.6, fontSize:11 }}>✕</span>
              </span>
            ))}
            <button onClick={() => setCompareList([])} style={{ padding:"4px 12px", borderRadius:20,
              border:"1px solid #ddd", background:"#fff", fontSize:12, cursor:"pointer", color:"#888" }}>清空</button>
          </div>

          {/* Radar overlay */}
          <div style={{ background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#888", marginBottom:8 }}>五味分佈疊合</div>
            <svg
              viewBox={`0 0 340 ${Math.max(320, 264 + (Math.max(1, Math.ceil(items.length / 3)) - 1) * 20 + 32)}`}
              style={{ width:"100%", maxWidth:400, display:"block", margin:"0 auto" }}
            >
              {(() => {
                const cx=170,cy=140,R=100;
                const angles = flavors.map((_,i) => Math.PI/2 + 2*Math.PI*i/5);
                const toXY = (a,r) => [cx+r*Math.cos(a), cy-r*Math.sin(a)];
                const colors = ["#C94435","#2E86C1","#27AE60","#8E44AD","#F39C12","#16A085","#7D3C98","#2C3E50"];
                const levels = [20,40,60,80,100];
                const legendCols = 3;
                const legendColWidth = 108;
                const legendStartY = 264;
                const legendRowHeight = 20;
                return (
                  <g>
                    {levels.map(l => <polygon key={l} points={angles.map(a => toXY(a,R*l/100).join(",")).join(" ")} fill="none" stroke="#eee" strokeWidth={0.5} />)}
                    {angles.map((a,i) => <line key={i} x1={cx} y1={cy} x2={toXY(a,R)[0]} y2={toXY(a,R)[1]} stroke="#eee" strokeWidth={0.5} />)}
                    {items.map((fm,fi) => {
                      const pts = flavors.map((f,i) => toXY(angles[i], (fm.fp[f]||0)/100*R));
                      return <polygon key={fi} points={pts.map(p=>p.join(",")).join(" ")} fill={colors[fi%8]} fillOpacity={0.12} stroke={colors[fi%8]} strokeWidth={2} />;
                    })}
                    {flavors.map((f,i) => {
                      const [lx,ly] = toXY(angles[i], R+24);
                      return <text key={f} x={lx} y={ly} textAnchor="middle" fontSize={13} fontWeight={700} fill={f==="辛"?"#666":flavorColors[f]}>{f}</text>;
                    })}
                    {items.map((fm,fi) => {
                      const col = fi % legendCols;
                      const row = Math.floor(fi / legendCols);
                      const rowStartIndex = row * legendCols;
                      const rowItemCount = Math.min(legendCols, items.length - rowStartIndex);
                      const rowStartX = (340 - rowItemCount * legendColWidth) / 2;
                      const x = rowStartX + col * legendColWidth;
                      const y = legendStartY + row * legendRowHeight;
                      return (
                        <g key={fi}>
                          <rect x={x} y={y} width={10} height={10} rx={2} fill={colors[fi%8]} />
                          <text x={x + 14} y={y + 9} fontSize={11} fill="#666">{fm.n}</text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Nature index comparison */}
          <div style={{ background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#888", marginBottom:12 }}>寒熱指數對比</div>
            {items.map(fm => (
              <div key={fm.n} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4 }}>
                  <span style={{ fontWeight:600 }}>{fm.n}</span>
                  <span style={{ color: tendencyColors[fm.nt], fontWeight:700 }}>{fm.ns > 0 ? "+" : ""}{fm.ns} ({fm.nt})</span>
                </div>
                {NatureGaugeComponent ? <NatureGaugeComponent score={fm.ns} /> : null}
              </div>
            ))}
          </div>

          {/* Key summary */}
          {comparisonSummary.length > 0 && (
            <div style={{ background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", marginBottom:16 }}>
              <div style={{ fontSize:12, color:"#888", marginBottom:10 }}>關鍵變化摘要（以 {items[0].n} 為基準）</div>
              <div style={{ display:"grid", gap:8 }}>
                {comparisonSummary.map((line, i) => (
                  <div key={i} style={{ fontSize:13, lineHeight:1.75, color:"#555", background:"#faf8f5", border:"1px solid #efeae3", borderRadius:8, padding:"10px 12px" }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Herb comparison table */}
          <div style={{ background:"#fff", borderRadius:12, padding:20, border:"1px solid #eee", marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#888", marginBottom:12 }}>藥物組成比較</div>
            {shared.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#3A8F5C", fontWeight:600, marginBottom:6 }}>共同藥物（{shared.length}味）</div>
                <table style={{ width:"100%", fontSize:12, borderCollapse:"collapse" }}>
                  <thead><tr style={{ borderBottom:"2px solid #eee" }}>
                    <th style={{ textAlign:"left", padding:"6px 8px", color:"#888" }}>藥物</th>
                    {items.map(fm => <th key={fm.n} style={{ textAlign:"center", padding:"6px 8px", color:"#888" }}>{fm.n}</th>)}
                  </tr></thead>
                  <tbody>{shared.map(h => (
                    <tr key={h} style={{ borderBottom:"1px solid #f5f5f5" }}>
                      <td style={{ padding:"6px 8px", fontWeight:600 }}>{h}</td>
                      {items.map(fm => {
                        const herb = fm.hd.find(x => x.n === h);
                        return <td key={fm.n} style={{ textAlign:"center", padding:"6px 8px" }}>{herb ? herb.w + "兩" : "-"}</td>;
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {items.map(fm => unique[fm.n].length > 0 && (
              <div key={fm.n} style={{ marginBottom:8 }}>
                <div style={{ fontSize:11, color:"#C94435", fontWeight:600, marginBottom:4 }}>{fm.n} 獨有（{unique[fm.n].length}味）</div>
                <div style={{ fontSize:12, color:"#666" }}>{unique[fm.n].map(h => { const herb = fm.hd.find(x=>x.n===h); return herb ? `${h}(${herb.w}兩)` : h; }).join("、")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
