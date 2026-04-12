// Extracted compare feature reference for future app migration.
// Not connected to current browser runtime yet.

function ComparePage({ compareList, setCompareList }) {
  const items = compareList.map(n => DATA.find(d => d.n === n)).filter(Boolean);
  const allHerbs = {};
  items.forEach(fm => fm.hd.forEach(h => {
    if (!allHerbs[h.n]) allHerbs[h.n] = {};
    allHerbs[h.n][fm.n] = h;
  }));
  const herbNames = Object.keys(allHerbs);
  const shared = herbNames.filter(h => items.every(fm => fm.hd.some(x => x.n === h)));
  const unique = {};
  items.forEach(fm => {
    unique[fm.n] = fm.hd.filter(h => !shared.includes(h.n)).map(h => h.n);
  });

  return (
    <div style={{ padding: "20px 24px", maxWidth: 960, margin: "0 auto" }}>
      {/* Preset groups */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>預設比較組</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COMPARE_GROUPS.map((g, i) => (
            <button key={i} onClick={() => setCompareList(g.formulas)}
              style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
              <span style={{ fontWeight: 600 }}>{g.title}</span>
              <br /><span style={{ color: "#999", fontSize: 10 }}>{g.formulas.length}方</span>
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, padding: 40, border: "1px solid #eee", textAlign: "center", color: "#aaa" }}>
          <p style={{ fontSize: 16, marginBottom: 12 }}>選擇要比較的方劑</p>
          <p style={{ fontSize: 13 }}>從上方預設組選取，或在「方劑分析」頁點擊方劑詳情中的「加入比較」按鈕</p>
        </div>
      ) : (
        <div>
          {/* Selected pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {items.map(fm => (
              <span key={fm.n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 20, background: "#2c3e50", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                {fm.n}
                <span onClick={() => setCompareList(compareList.filter(n => n !== fm.n))}
                  style={{ cursor: "pointer", opacity: 0.6, fontSize: 11 }}>✕</span>
              </span>
            ))}
            <button onClick={() => setCompareList([])} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid #ddd", background: "#fff", fontSize: 12, cursor: "pointer", color: "#888" }}>清空</button>
          </div>

          {/* Radar overlay */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>五味分佈疊合</div>
            <svg viewBox="0 0 340 300" style={{ width: "100%", maxWidth: 400, display: "block", margin: "0 auto" }}>
              {(() => {
                const cx = 170, cy = 140, R = 100;
                const angles = FLAVORS.map((_, i) => Math.PI / 2 + 2 * Math.PI * i / 5);
                const toXY = (a, r) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
                const colors = ["#C94435", "#2E86C1", "#27AE60", "#8E44AD"];
                const levels = [20, 40, 60, 80, 100];
                return (
                  <g>
                    {levels.map(l => <polygon key={l} points={angles.map(a => toXY(a, R * l / 100).join(",")).join(" ")} fill="none" stroke="#eee" strokeWidth={0.5} />)}
                    {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={toXY(a, R)[0]} y2={toXY(a, R)[1]} stroke="#eee" strokeWidth={0.5} />)}
                    {items.map((fm, fi) => {
                      const pts = FLAVORS.map((f, i) => toXY(angles[i], (fm.fp[f] || 0) / 100 * R));
                      return <polygon key={fi} points={pts.map(p => p.join(",")).join(" ")} fill={colors[fi % 4]} fillOpacity={0.12} stroke={colors[fi % 4]} strokeWidth={2} />;
                    })}
                    {FLAVORS.map((f, i) => {
                      const [lx, ly] = toXY(angles[i], R + 24);
                      return <text key={f} x={lx} y={ly} textAnchor="middle" fontSize={13} fontWeight={700} fill={f === "辛" ? "#666" : FLAVOR_COLORS[f]}>{f}</text>;
                    })}
                    {items.map((fm, fi) => (
                      <g key={fi}>
                        <rect x={10} y={260 + fi * 16} width={10} height={10} rx={2} fill={colors[fi % 4]} />
                        <text x={24} y={269 + fi * 16} fontSize={11} fill="#666">{fm.n}</text>
                      </g>
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Nature index comparison */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>寒熱指數對比</div>
            {items.map(fm => (
              <div key={fm.n} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{fm.n}</span>
                  <span style={{ color: TENDENCY_COLORS[fm.nt], fontWeight: 700 }}>{fm.ns > 0 ? "+" : ""}{fm.ns} ({fm.nt})</span>
                </div>
                <NatureGauge score={fm.ns} />
              </div>
            ))}
          </div>

          {/* Herb comparison table */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee", marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>藥物組成比較</div>
            {shared.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "#3A8F5C", fontWeight: 600, marginBottom: 6 }}>共同藥物（{shared.length}味）</div>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px", color: "#888" }}>藥物</th>
                    {items.map(fm => <th key={fm.n} style={{ textAlign: "center", padding: "6px 8px", color: "#888" }}>{fm.n}</th>)}
                  </tr></thead>
                  <tbody>{shared.map(h => (
                    <tr key={h} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600 }}>{h}</td>
                      {items.map(fm => {
                        const herb = fm.hd.find(x => x.n === h);
                        return <td key={fm.n} style={{ textAlign: "center", padding: "6px 8px" }}>{herb ? herb.w + "兩" : "-"}</td>;
                      })}
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {items.map(fm => unique[fm.n].length > 0 && (
              <div key={fm.n} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "#C94435", fontWeight: 600, marginBottom: 4 }}>{fm.n} 獨有（{unique[fm.n].length}味）</div>
                <div style={{ fontSize: 12, color: "#666" }}>{unique[fm.n].map(h => {
                  const herb = fm.hd.find(x => x.n === h);
                  return herb ? `${h}(${herb.w}兩)` : h;
                }).join("、")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
