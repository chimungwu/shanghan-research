// Extracted UI reference components for future app migration.
// These files are not wired into the current website runtime yet.

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
      {levels.map(lv => {
        const r = (lv / maxVal) * R;
        const gridPts = angles.map(a => toXY(a, r));
        const d = gridPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
        return <path key={lv} d={d} fill="none" stroke="#e0ddd8" strokeWidth={0.8} opacity={0.7} />;
      })}
      {angles.map((a, i) => {
        const [ex, ey] = toXY(a, R);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#d5d0c8" strokeWidth={0.6} />;
      })}
      {pathStr2 && (
        <path d={pathStr2} fill="#3498DB" fillOpacity={0.12} stroke="#3498DB" strokeWidth={1.5} strokeDasharray="4 3" />
      )}
      <path d={pathStr} fill="#C94435" fillOpacity={fp2 ? 0.15 : 0.12} stroke="#C94435" strokeWidth={2} />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3.5} fill={FLAVOR_COLORS[FLAVORS[i]]}
          stroke={FLAVORS[i] === "辛" ? "#666" : "#fff"} strokeWidth={1.5} />
      ))}
      {fp2 && getPoints(fp2).map((p, i) => (
        <circle key={`c${i}`} cx={p[0]} cy={p[1]} r={2.5} fill="#3498DB" stroke="#fff" strokeWidth={1} />
      ))}
      {FLAVORS.map((f, i) => {
        const labelR = R + 28;
        const [lx, ly] = toXY(angles[i], labelR);
        const val = fp[f] || 0;
        const labelColor = f === "辛" ? "#666" : FLAVOR_COLORS[f];
        return (
          <g key={f}>
            <text x={lx} y={ly - 6} textAnchor="middle" fontSize={14} fontWeight={700} fill={labelColor}>{f}</text>
            <text x={lx} y={ly + 8} textAnchor="middle" fontSize={10} fill="#999">{val > 0 ? `${val}%` : "-"}</text>
          </g>
        );
      })}
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
    <div style={{ display: "flex", borderRadius: 4, overflow: "hidden", height, width: "100%", border: "1px solid #e0e0e0" }}>
      {ordered.map(f => (
        <div key={f} title={`${f} ${fp[f]}%`} style={{
          width: `${fp[f]}%`, background: FLAVOR_COLORS[f],
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: fp[f] > 12 ? 11 : 0, color: f === "辛" || f === "甘" ? "#333" : "#fff", fontWeight: 600, letterSpacing: 1
        }}>{fp[f] > 12 ? `${f}${fp[f]}%` : ""}</div>
      ))}
    </div>
  );
}

function NatureGauge({ score }) {
  const pct = Math.max(0, Math.min(100, (score + 2.5) / 5 * 100));
  return (
    <div style={{ position: "relative", height: 12, background: "linear-gradient(90deg, #2471A3 0%, #3498DB 25%, #95A5A6 50%, #E67E22 75%, #C0392B 100%)", borderRadius: 6 }}>
      <div style={{
        position: "absolute", top: -2, left: `${pct}%`, transform: "translateX(-50%)",
        width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #2c3e50",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
      }} />
    </div>
  );
}

function HerbPill({ herb, expanded, onToggle }) {
  const bg = herb.t === "溫" ? "#FDEBD0" : herb.t === "微溫" ? "#FEF5E7" :
    herb.t === "寒" ? "#D6EAF8" : herb.t === "微寒" ? "#EBF5FB" :
    herb.t === "小寒" ? "#EBF5FB" : herb.t === "涼" ? "#E8F8F5" : "#F2F3F4";
  return (
    <div style={{ display: "inline-block", margin: "2px 3px", verticalAlign: "top" }}>
      <span onClick={onToggle} style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20,
        background: expanded ? "#2c3e50" : bg, color: expanded ? "#fff" : "inherit",
        fontSize: 13, border: expanded ? "1px solid #2c3e50" : "1px solid rgba(0,0,0,0.08)",
        cursor: herb.bt ? "pointer" : "default", transition: "all 0.15s",
      }}>
        <span style={{ fontWeight: 600 }}>{herb.n}</span>
        <span style={{ opacity: 0.6, fontSize: 11 }}>{herb.w}兩</span>
        {herb.f.map(f => <span key={f} style={{ color: expanded ? "#ffd" : FLAVOR_COLORS[f], fontWeight: 700, fontSize: 11 }}>{f}</span>)}
        {herb.t && <span style={{ opacity: 0.6, fontSize: 10 }}>{herb.t}</span>}
        {herb.bt && <span style={{ fontSize: 9, opacity: 0.5 }}>{expanded ? "▲" : "▼"}</span>}
      </span>
    </div>
  );
}

function FormulaCard({ formula, onClick, selected, isFav, onToggleFav }) {
  return (
    <div onClick={onClick} style={{
      padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid #eee",
      background: selected ? "#FFF8F0" : "#fff",
      borderLeft: selected ? "3px solid #C94435" : "3px solid transparent",
      transition: "all 0.15s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Noto Serif TC', serif" }}>{formula.n}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
            color: TENDENCY_COLORS[formula.nt], background: `${TENDENCY_COLORS[formula.nt]}18`
          }}>{formula.nt}</span>
          <span onClick={e => { e.stopPropagation(); onToggleFav && onToggleFav(formula.n); }}
            style={{ fontSize: 16, cursor: "pointer", color: isFav ? "#D4A017" : "#ddd", transition: "color 0.2s" }}
            title={isFav ? "移出收藏" : "加入收藏"}>{isFav ? "★" : "☆"}</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{formula.c}</div>
      <FlavorBar fp={formula.fp} height={18} />
    </div>
  );
}

function ScatterPlot({ data, selected, onSelect }) {}
function OverviewStats({ data }) {}
function Section({ title, children }) {}
function DefTable({ headers, rows }) {}
function ClauseItem({ cl, isLast }) {}
function DetailPanel({ selected, compare, setCompare, isFav, onToggleFav, onAddCompare, onClose }) {}
