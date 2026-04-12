const { useState, useMemo } = React;
const CATEGORIES = ["全部", "太陽病", "陽明病", "少陽病", "太陰病", "少陰病", "厥陰病", "霍亂病", "差後病"];
const TENDENCIES = ["全部", "大溫", "偏溫", "平性", "偏寒", "大寒"];
const FLAVORS = ["辛", "甘", "苦", "酸", "鹹"];
const FLAVOR_COLORS = { "辛": "#A0A0A0", "甘": "#D4A017", "苦": "#C94435", "酸": "#3A8F5C", "鹹": "#34495E" };
const TENDENCY_COLORS = { "大溫": "#C0392B", "偏溫": "#E67E22", "平性": "#7F8C8D", "偏寒": "#3498DB", "大寒": "#2471A3" };
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
    return (React.createElement("svg", { viewBox: `0 0 ${size} ${size}`, style: { width: "100%", maxWidth: size } },
        levels.map(lv => {
            const r = (lv / maxVal) * R;
            const gridPts = angles.map(a => toXY(a, r));
            const d = gridPts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
            return React.createElement("path", { key: lv, d: d, fill: "none", stroke: "#e0ddd8", strokeWidth: 0.8, opacity: 0.7 });
        }),
        angles.map((a, i) => {
            const [ex, ey] = toXY(a, R);
            return React.createElement("line", { key: i, x1: cx, y1: cy, x2: ex, y2: ey, stroke: "#d5d0c8", strokeWidth: 0.6 });
        }),
        pathStr2 && (React.createElement("path", { d: pathStr2, fill: "#3498DB", fillOpacity: 0.12, stroke: "#3498DB", strokeWidth: 1.5, strokeDasharray: "4 3" })),
        React.createElement("path", { d: pathStr, fill: "#C94435", fillOpacity: fp2 ? 0.15 : 0.12, stroke: "#C94435", strokeWidth: 2 }),
        pts.map((p, i) => (React.createElement("circle", { key: i, cx: p[0], cy: p[1], r: 3.5, fill: FLAVOR_COLORS[FLAVORS[i]], stroke: FLAVORS[i] === "辛" ? "#666" : "#fff", strokeWidth: 1.5 }))),
        fp2 && getPoints(fp2).map((p, i) => (React.createElement("circle", { key: `c${i}`, cx: p[0], cy: p[1], r: 2.5, fill: "#3498DB", stroke: "#fff", strokeWidth: 1 }))),
        FLAVORS.map((f, i) => {
            const labelR = R + 28;
            const [lx, ly] = toXY(angles[i], labelR);
            const val = fp[f] || 0;
            const labelColor = f === "辛" ? "#666" : FLAVOR_COLORS[f];
            return (React.createElement("g", { key: f },
                React.createElement("text", { x: lx, y: ly - 6, textAnchor: "middle", fontSize: 14, fontWeight: 700, fill: labelColor }, f),
                React.createElement("text", { x: lx, y: ly + 8, textAnchor: "middle", fontSize: 10, fill: "#999" }, val > 0 ? `${val}%` : "-")));
        }),
        label && (React.createElement("g", null,
            React.createElement("rect", { x: 4, y: size - 16, width: 8, height: 8, rx: 2, fill: "#C94435", opacity: 0.6 }),
            React.createElement("text", { x: 16, y: size - 9, fontSize: 9, fill: "#888" }, label))),
        label2 && fp2 && (React.createElement("g", null,
            React.createElement("rect", { x: 4, y: size - 28, width: 8, height: 8, rx: 2, fill: "#3498DB", opacity: 0.6 }),
            React.createElement("text", { x: 16, y: size - 21, fontSize: 9, fill: "#888" }, label2)))));
}
function FlavorBar({ fp, height = 24 }) {
    const ordered = FLAVORS.filter(f => fp[f]);
    return (React.createElement("div", { style: { display: "flex", borderRadius: 4, overflow: "hidden", height, width: "100%", border: "1px solid #e0e0e0" } }, ordered.map(f => (React.createElement("div", { key: f, title: `${f} ${fp[f]}%`, style: {
            width: `${fp[f]}%`, background: FLAVOR_COLORS[f],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: fp[f] > 12 ? 11 : 0, color: f === "辛" || f === "甘" ? "#333" : "#fff", fontWeight: 600, letterSpacing: 1
        } }, fp[f] > 12 ? `${f}${fp[f]}%` : "")))));
}
function NatureGauge({ score }) {
    const pct = Math.max(0, Math.min(100, (score + 2.5) / 5 * 100));
    return (React.createElement("div", { style: { position: "relative", height: 12, background: "linear-gradient(90deg, #2471A3 0%, #3498DB 25%, #95A5A6 50%, #E67E22 75%, #C0392B 100%)", borderRadius: 6 } },
        React.createElement("div", { style: {
                position: "absolute", top: -2, left: `${pct}%`, transform: "translateX(-50%)",
                width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2px solid #2c3e50",
                boxShadow: "0 1px 4px rgba(0,0,0,0.3)"
            } })));
}
function HerbPill({ herb, expanded, onToggle }) {
    const bg = herb.t === "溫" ? "#FDEBD0" : herb.t === "微溫" ? "#FEF5E7" :
        herb.t === "寒" ? "#D6EAF8" : herb.t === "微寒" ? "#EBF5FB" :
            herb.t === "小寒" ? "#EBF5FB" : herb.t === "涼" ? "#E8F8F5" : "#F2F3F4";
    return (React.createElement("div", { style: { display: "inline-block", margin: "2px 3px", verticalAlign: "top" } },
        React.createElement("span", { onClick: onToggle, style: {
                display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20,
                background: expanded ? "#2c3e50" : bg, color: expanded ? "#fff" : "inherit",
                fontSize: 13, border: expanded ? "1px solid #2c3e50" : "1px solid rgba(0,0,0,0.08)",
                cursor: herb.bt ? "pointer" : "default", transition: "all 0.15s",
            } },
            React.createElement("span", { style: { fontWeight: 600 } }, herb.n),
            React.createElement("span", { style: { opacity: 0.6, fontSize: 11 } },
                herb.w,
                "\u5169"),
            herb.f.map(f => React.createElement("span", { key: f, style: { color: expanded ? "#ffd" : FLAVOR_COLORS[f], fontWeight: 700, fontSize: 11 } }, f)),
            herb.t && React.createElement("span", { style: { opacity: 0.6, fontSize: 10 } }, herb.t),
            herb.bt && React.createElement("span", { style: { fontSize: 9, opacity: 0.5 } }, expanded ? "▲" : "▼")),
        expanded && herb.bt && (React.createElement("div", { style: {
                marginTop: 4, padding: "10px 14px", borderRadius: 8,
                background: "#faf8f5", border: "1px solid #e8e4df",
                fontSize: 13, lineHeight: 2, color: "#555", maxWidth: 400,
            } }, herb.bt.split("\\n").map((part, i) => {
            if (i === 0)
                return React.createElement("div", { key: i },
                    React.createElement("span", { style: { fontSize: 10, color: "#999", fontWeight: 600 } }, "\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B"),
                    React.createElement("br", null),
                    part);
            return React.createElement("div", { key: i, style: { marginTop: 8, padding: "8px 10px", borderRadius: 6, background: "#f0ede8", fontSize: 12, lineHeight: 1.8, color: "#777" } }, part);
        })))));
}
function FormulaCard({ formula, onClick, selected }) {
    return (React.createElement("div", { onClick: onClick, style: {
            padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid #eee",
            background: selected ? "#FFF8F0" : "#fff",
            borderLeft: selected ? "3px solid #C94435" : "3px solid transparent",
            transition: "all 0.15s"
        } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 } },
            React.createElement("span", { style: { fontWeight: 700, fontSize: 15, fontFamily: "'Noto Serif TC', serif" } }, formula.n),
            React.createElement("span", { style: {
                    fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                    color: TENDENCY_COLORS[formula.nt], background: `${TENDENCY_COLORS[formula.nt]}18`
                } }, formula.nt)),
        React.createElement("div", { style: { fontSize: 11, color: "#888", marginBottom: 6 } }, formula.c),
        React.createElement(FlavorBar, { fp: formula.fp, height: 18 })));
}
function ScatterPlot({ data, selected, onSelect }) {
    const W = 680, H = 400, P = 50;
    const minS = -2.5, maxS = 2.5;
    const allFlavors = data.map(d => {
        const sorted = FLAVORS.filter(f => d.fp[f]).sort((a, b) => (d.fp[b] || 0) - (d.fp[a] || 0));
        return sorted[0] || "甘";
    });
    return (React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: { width: "100%", maxHeight: 400 } },
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "bgGrad", x1: "0", y1: "0", x2: "1", y2: "0" },
                React.createElement("stop", { offset: "0%", stopColor: "#2471A3", stopOpacity: "0.06" }),
                React.createElement("stop", { offset: "50%", stopColor: "#95A5A6", stopOpacity: "0.03" }),
                React.createElement("stop", { offset: "100%", stopColor: "#C0392B", stopOpacity: "0.06" }))),
        React.createElement("rect", { x: P, y: 10, width: W - P * 2, height: H - P - 10, fill: "url(#bgGrad)", rx: 8 }),
        React.createElement("line", { x1: P, y1: H - P, x2: W - P, y2: H - P, stroke: "#ccc" }),
        React.createElement("line", { x1: P, y1: 10, x2: P, y2: H - P, stroke: "#ccc" }),
        [-2, -1, 0, 1, 2].map(v => {
            const x = P + (v - minS) / (maxS - minS) * (W - P * 2);
            return React.createElement("g", { key: v },
                React.createElement("line", { x1: x, y1: H - P, x2: x, y2: H - P + 5, stroke: "#999" }),
                React.createElement("text", { x: x, y: H - P + 18, textAnchor: "middle", fontSize: 10, fill: "#666" }, v));
        }),
        React.createElement("text", { x: W / 2, y: H - 8, textAnchor: "middle", fontSize: 11, fill: "#888", fontWeight: 600 }, "\u2190 \u5BD2\u6DBC \u2500\u2500\u2500 \u5BD2\u71B1\u6307\u6578 \u2500\u2500\u2500 \u6EAB\u71B1 \u2192"),
        React.createElement("text", { x: 14, y: H / 2 - 20, textAnchor: "middle", fontSize: 11, fill: "#888", fontWeight: 600, transform: `rotate(-90, 14, ${H / 2 - 20})` }, "\u85E5\u7269\u7E3D\u7528\u91CF\uFF08\u5169\uFF09"),
        data.map((d, i) => {
            const x = P + (d.ns - minS) / (maxS - minS) * (W - P * 2);
            const maxW = Math.max(...data.map(dd => dd.tw));
            const y = H - P - (d.tw / maxW) * (H - P - 20);
            const r = Math.max(4, Math.min(12, d.hd.length * 1.5));
            const color = FLAVOR_COLORS[allFlavors[i]];
            const isSel = selected && selected.n === d.n;
            return (React.createElement("g", { key: i, onClick: () => onSelect(d), style: { cursor: "pointer" } },
                React.createElement("circle", { cx: x, cy: y, r: isSel ? r + 3 : r, fill: color, opacity: isSel ? 1 : 0.7, stroke: isSel ? "#2c3e50" : "none", strokeWidth: 2 }),
                (isSel || d.tw > 30) && (React.createElement("text", { x: x, y: y - r - 4, textAnchor: "middle", fontSize: 10, fill: "#333", fontWeight: 600 }, d.n))));
        })));
}
function OverviewStats({ data }) {
    const tendCount = {};
    data.forEach(d => { tendCount[d.nt] = (tendCount[d.nt] || 0) + 1; });
    const flavorTotals = {};
    FLAVORS.forEach(f => { flavorTotals[f] = 0; });
    data.forEach(d => { FLAVORS.forEach(f => { if (d.fp[f])
        flavorTotals[f] += d.fp[f]; }); });
    const flavorSum = Object.values(flavorTotals).reduce((a, b) => a + b, 0);
    return (React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 } },
        React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" } },
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 10, fontWeight: 600 } }, "\u56DB\u6C23\u504F\u6027\u5206\u4F48"),
            React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } }, TENDENCIES.slice(1).map(t => (React.createElement("div", { key: t, style: { textAlign: "center", flex: 1, minWidth: 50 } },
                React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: TENDENCY_COLORS[t] } }, tendCount[t] || 0),
                React.createElement("div", { style: { fontSize: 11, color: "#666" } }, t)))))),
        React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee", display: "flex", flexDirection: "column", alignItems: "center" } },
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 4, fontWeight: 600, alignSelf: "flex-start" } }, "\u4E94\u5473\u7D2F\u8A08\u5206\u4F48"),
            (() => {
                const fpNorm = {};
                const maxF = Math.max(...FLAVORS.map(f => flavorTotals[f]));
                FLAVORS.forEach(f => { fpNorm[f] = maxF > 0 ? Math.round(flavorTotals[f] / maxF * 100) : 0; });
                return React.createElement(RadarChart, { fp: fpNorm, size: 240 });
            })())));
}
function Section({ title, children }) {
    return (React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 16, border: "1px solid #eee" } },
        React.createElement("h3", { style: { margin: "0 0 12px", fontSize: 17, fontFamily: "'Noto Serif TC', serif", color: "#1a1a2e", borderBottom: "2px solid #C94435", paddingBottom: 8, display: "inline-block" } }, title),
        React.createElement("div", { style: { fontSize: 14, lineHeight: 2, color: "#444" } }, children)));
}
function DefTable({ headers, rows }) {
    return (React.createElement("table", { style: { width: "100%", borderCollapse: "collapse", margin: "12px 0", fontSize: 13 } },
        React.createElement("thead", null,
            React.createElement("tr", null, headers.map((h, i) => React.createElement("th", { key: i, style: { textAlign: "left", padding: "8px 12px", background: "#f5f3f0", borderBottom: "2px solid #ddd", fontWeight: 700, color: "#333" } }, h)))),
        React.createElement("tbody", null, rows.map((row, i) => (React.createElement("tr", { key: i, style: { borderBottom: "1px solid #eee" } }, row.map((cell, j) => React.createElement("td", { key: j, style: { padding: "8px 12px", verticalAlign: "top" } }, cell))))))));
}
function AboutPage() {
    return (React.createElement("div", { style: { padding: "20px 24px", maxWidth: 800, margin: "0 auto" } },
        React.createElement(Section, { title: "\u4E00\u3001\u7814\u7A76\u76EE\u7684" },
            React.createElement("p", null, "\u672C\u7814\u7A76\u4EE5\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u8A18\u8F09\u7684\u85E5\u7269\u6027\u5473\uFF08\u4E94\u5473\u3001\u56DB\u6C23\uFF09\u70BA\u57FA\u790E\u6578\u64DA\uFF0C\u5C0D\u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\u300A\u50B7\u5BD2\u8AD6\u300B\u4E2D\u7684\u65B9\u5291\u9032\u884C\u91CF\u5316\u5206\u6790\u3002\u900F\u904E\u5C07\u6BCF\u5473\u85E5\u7269\u7684\u6027\u5473\u5C6C\u6027\u4E58\u4EE5\u5176\u5728\u65B9\u5291\u4E2D\u7684\u7528\u91CF\uFF08\u5169\uFF09\uFF0C\u8A08\u7B97\u51FA\u5404\u65B9\u5291\u5728\u4E94\u5473\uFF08\u9178\u3001\u82E6\u3001\u7518\u3001\u8F9B\u3001\u9E79\uFF09\u548C\u56DB\u6C23\uFF08\u5BD2\u3001\u71B1\u3001\u6EAB\u3001\u6DBC\u3001\u5E73\uFF09\u4E0A\u7684\u52A0\u6B0A\u5206\u4F48\u8207\u6574\u9AD4\u504F\u6027\uFF0C\u4EE5\u6578\u64DA\u5316\u65B9\u5F0F\u5448\u73FE\u4EF2\u666F\u7D44\u65B9\u7684\u6027\u5473\u7D50\u69CB\u7279\u5FB5\u3002")),
        React.createElement(Section, { title: "\u4E8C\u3001\u5178\u7C4D\u7248\u672C" },
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e" } }, "\u65B9\u5291\u4F86\u6E90\u2014\u2014\u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\u300A\u50B7\u5BD2\u8AD6\u300B"),
            React.createElement("p", null,
                "\u5E95\u672C\u70BA\u660E\u842C\u66C6\u4E8C\u5341\u4E03\u5E74\uFF081599\u5E74\uFF09\u8D99\u958B\u7F8E\u520A\u523B\u300A\u4EF2\u666F\u5168\u66F8\u300B\u4E2D\u4E4B\u300A\u50B7\u5BD2\u8AD6\u300B\u5341\u5377\uFF0C\u539F\u66F8\u4F9D\u5317\u5B8B\u6CBB\u5E73\u4E8C\u5E74\uFF081065\u5E74\uFF09\u6797\u5104\u7B49\u6821\u6B63\u4E4B\u300C\u6CBB\u5E73\u672C\u300D\u7FFB\u523B\uFF0C\u662F\u76EE\u524D\u5B78\u8853\u754C\u516C\u8A8D\u6700\u5177\u6B0A\u5A01\u6027\u7684\u901A\u884C\u7248\u672C\u3002\u5168\u66F8\u4EE5\u516D\u7D93\u8FA8\u8B49\u70BA\u7DB1\uFF0C\u7CFB\u7D71\u6574\u7406\u6771\u6F22\u5F35\u4EF2\u666F\u5C0D\u5916\u611F\u75BE\u75C5\u7684\u8AD6\u8FF0\uFF0C\u8F09\u65B9 113 \u9996\uFF08\u542B\u71D2\u890C\u6563\uFF09\uFF0C\u672C\u7814\u7A76\u6536\u9304\u5176\u4E2D\u53EF\u9032\u884C\u6027\u5473\u5206\u6790\u7684 ",
                DATA.length,
                " \u9996\uFF08\u71D2\u890C\u6563\u975E\u6A19\u6E96\u85E5\u65B9\u4E0D\u7D0D\u5165\uFF09\u3002\u5B8B\u672C\u5C11\u967D\u75C5\u7BC7\uFF08\u5377\u7B2C\u4E94\uFF09\u50C5\u6709\u689D\u6587\u800C\u7121\u7368\u7ACB\u65B9\u5291\uFF0C\u53E6\u300C\u79B9\u9918\u7CE7\u4E38\u300D\u539F\u6587\u8F09\u300C\u79B9\u9918\u7CE7\u65B9\u95D5\u300D\uFF0C\u5747\u672A\u6536\u9304\u3002"),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 16 } }, "\u6BD4\u8F03\u7248\u672C\u2014\u2014\u6842\u6797\u53E4\u672C\u300A\u50B7\u5BD2\u96DC\u75C5\u8AD6\u300B"),
            React.createElement("p", null, "\u64DA\u7A31\u70BA\u5F35\u4EF2\u666F\u7B2C\u5341\u4E8C\u7A3F\u4E4B\u4E16\u50B3\u6284\u672C\uFF0C\u6E05\u672B\u7531\u5F35\u4EF2\u666F\u5F8C\u88D4\u5F35\u7D39\u7956\u50B3\u4E88\u6842\u6797\u5DE6\u76DB\u5FB7\uFF0C\u518D\u50B3\u7F85\u54F2\u521D\u30021934\u5E74\u9EC3\u7AF9\u9F4B\u6284\u5BEB\u70BA\u300A\u767D\u96F2\u95A3\u85CF\u672C\u300B\uFF0C1939\u5E74\u6821\u520A\u516C\u4E16\uFF0C1960\u5E74\u5EE3\u897F\u4EBA\u6C11\u51FA\u7248\u793E\u64DA\u7F85\u54F2\u521D\u4E4B\u5B50\u737B\u51FA\u7684\u539F\u7A3F\u6392\u5370\u51FA\u7248\u3002\u5168\u66F8\u5341\u516D\u5377\uFF0C\u8F03\u5B8B\u672C\u591A\u51FA\u516D\u6C23\u4E3B\u5BA2\u3001\u50B7\u6691\u75C5\u3001\u71B1\u75C5\u3001\u6FD5\u75C5\u3001\u50B7\u71E5\u75C5\u3001\u50B7\u98A8\u75C5\u3001\u5BD2\u75C5\u7B49\u7BC7\u7AE0\uFF0C\u4E26\u5C07\u300A\u91D1\u5331\u8981\u7565\u300B\u5167\u5BB9\u6574\u5408\u5176\u4E2D\uFF0C\u7D50\u69CB\u6700\u70BA\u5B8C\u6574\u3002\u5B78\u8853\u754C\u5C0D\u5176\u771F\u507D\u4ECD\u6709\u722D\u8B70\u2014\u2014\u652F\u6301\u8005\u8A8D\u70BA\u5176\u88DC\u8DB3\u4E86\u5B8B\u672C\u7684\u6B98\u7F3A\uFF0C\u53CD\u5C0D\u8005\u8A8D\u70BA\u90E8\u5206\u689D\u6587\u53CD\u6620\u4E86\u6E05\u4EE3\u6EAB\u75C5\u5B78\u6D3E\u7684\u5F71\u97FF\u3002\u672C\u7814\u7A76\u5C07\u6842\u6797\u53E4\u672C\u4F5C\u70BA\u7570\u6587\u6BD4\u8F03\u7684\u53C3\u8003\u7248\u672C\u4E4B\u4E00\u3002"),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 16 } }, "\u6BD4\u8F03\u7248\u672C\u2014\u2014\u5EB7\u5E73\u672C\uFF08\u5EB7\u6CBB\u672C\uFF09\u300A\u50B7\u5BD2\u8AD6\u300B"),
            React.createElement("p", null, "\u65E5\u672C\u50B3\u672C\u3002\u5EB7\u5E73\u672C\u70BA\u65E5\u672C\u4E39\u6CE2\u96C5\u5FE0\u65BC\u5EB7\u5E73\u4E09\u5E74\uFF081060\u5E74\uFF09\u64DA\u5BB6\u50B3\u672C\u6284\u5BEB\uFF0C\u65E9\u65BC\u5B8B\u672C\u5B9A\u672C\u6642\u9593\uFF081065\u5E74\uFF09\u4E94\u5E74\uFF0C\u88AB\u8A8D\u70BA\u53EF\u80FD\u662F\u5510\u4EE3\u7A7A\u6D77\uFF08\u5F18\u6CD5\u5927\u5E2B\uFF09\u65BC\u8C9E\u5143\u4E8C\u5341\u4E00\u5E74\uFF08805\u5E74\uFF09\u50B3\u5165\u65E5\u672C\u7684\u53E4\u672C\u3002\u6B64\u672C\u6700\u91CD\u8981\u7684\u7279\u5FB5\u662F\u4FDD\u7559\u4E86\u300C\u9802\u683C\u3001\u964D\u4E00\u683C\u3001\u964D\u5169\u683C\u300D\u7684\u884C\u683C\u9AD4\u4F8B\u4EE5\u53CA\u65C1\u6CE8\u3001\u8173\u6CE8\u7684\u5340\u5206\uFF0C\u53EF\u80FD\u53CD\u6620\u4E86\u4E0D\u540C\u6642\u671F\u6CE8\u89E3\u758A\u52A0\u7684\u75D5\u8DE1\u2014\u2014\u9802\u683C\u6587\u5B57\u88AB\u8A8D\u70BA\u662F\u4EF2\u666F\u539F\u6587\uFF0C\u964D\u683C\u6587\u5B57\u53EF\u80FD\u70BA\u5F8C\u4E16\u6CE8\u6587\u30021858\u5E74\u7531\u65E5\u672C\u4EAC\u90FD\u66F8\u6797\u520A\u884C\uFF0C\u5F8C\u7D93\u5927\u585A\u656C\u7BC0\u6821\u6B63\u3001\u8449\u6A58\u6CC9\u91CD\u6821\u3002\u5EB7\u6CBB\u672C\u70BA\u66F4\u65E9\u7684\u6B98\u672C\uFF0C\u50C5\u5B58 50 \u9996\u65B9\uFF0C1849\u5E74\u70BA\u6236\u4E0A\u91CD\u8F03\u6C0F\u767C\u73FE\u3002\u672C\u7814\u7A76\u5C07\u5EB7\u5E73\u672C\u4F5C\u70BA\u7570\u6587\u6BD4\u8F03\u7684\u53E6\u4E00\u53C3\u8003\u7248\u672C\u3002"),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 16 } }, "\u7248\u672C\u6BD4\u8F03\u8AAA\u660E"),
            React.createElement("p", null, "\u672C\u7814\u7A76\u7684\u6027\u5473\u5206\u6790\u4EE5\u5B8B\u672C\u70BA\u552F\u4E00\u85CD\u672C\uFF0C\u6842\u6797\u53E4\u672C\u8207\u5EB7\u5E73\u672C\u50C5\u7528\u65BC\u689D\u6587\u7570\u6587\u7684\u5C0D\u7167\u53C3\u8003\u3002\u5728\u6BCF\u9996\u65B9\u5291\u7684\u300C\u76F8\u95DC\u689D\u6587\u300D\u4E2D\uFF0C\u82E5\u8A72\u689D\u6587\u5728\u6842\u6797\u53E4\u672C\u6216\u5EB7\u5E73\u672C\u4E2D\u6709\u6587\u5B57\u51FA\u5165\uFF0C\u53EF\u9EDE\u64CA\u300C\u7570\u6587\u300D\u6309\u9215\u5C55\u958B\u6BD4\u8F03\u3002"),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 16 } }, "\u6027\u5473\u4F86\u6E90\u2014\u2014\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B"),
            React.createElement("p", null, "\u85E5\u7269\u7684\u4E94\u5473\u8207\u56DB\u6C23\u6578\u64DA\u4EE5\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u539F\u6587\u8A18\u8F09\u70BA\u4E3B\u3002\u73FE\u5B58\u672C\u8349\u7D93\u70BA\u6E05\u4EE3\u8F2F\u4F5A\u672C\uFF08\u5B6B\u661F\u884D\u8F2F\u672C\uFF09\uFF0C\u4E3B\u8981\u5F9E\u5B8B\u300A\u8B49\u985E\u672C\u8349\u300B\u4E2D\u9084\u539F\u3002\u90E8\u5206\u85E5\u7269\u56E0\u540D\u7A31\u5DEE\u7570\u9700\u505A\u5C0D\u61C9\uFF08\u898B\u4E0B\u65B9\u85E5\u540D\u5C0D\u61C9\u8868\uFF09\u3002"),
            React.createElement("p", null, "\u672C\u8349\u7D93\u672A\u7368\u7ACB\u6536\u9304\u7684\u85E5\u7269\uFF0C\u4F9D\u4EE5\u4E0B\u6587\u737B\u624B\u52D5\u88DC\u5145\u6027\u5473\uFF1A"),
            React.createElement("p", null,
                React.createElement("strong", null, "\u300A\u540D\u91AB\u5225\u9304\u300B"),
                "\uFF08\u6F22\u672B\u9B4F\u6649\uFF09\uFF1A\u88DC\u5145\u7D30\u8F9B\u300C\u5473\u8F9B\u6EAB\u300D\u7B49\u672C\u8349\u7D93\u7F3A\u8F09\u4E4B\u54C1\u76EE\u3002\u539F\u66F8\u5DF2\u4F5A\uFF0C\u5167\u5BB9\u4FDD\u5B58\u65BC\u300A\u672C\u8349\u7D93\u96C6\u6CE8\u300B\u53CA\u300A\u8B49\u985E\u672C\u8349\u300B\u4E2D\u3002",
                React.createElement("br", null),
                React.createElement("strong", null, "\u300A\u672C\u8349\u7D93\u96C6\u6CE8\u300B"),
                "\uFF08\u5357\u671D\u6881\u00B7\u9676\u5F18\u666F\uFF09\uFF1A\u9676\u5F18\u666F\u4EE5\u6731\u58A8\u5206\u66F8\u4FDD\u5B58\u672C\u8349\u7D93\u539F\u6587\u8207\u5225\u9304\u589E\u88DC\uFF0C\u70BA\u5224\u65B7\u85E5\u540D\u5C0D\u61C9\u53CA\u6027\u5473\u4FEE\u8A02\u7684\u91CD\u8981\u53C3\u8003\u3002",
                React.createElement("br", null),
                React.createElement("strong", null, "\u6B77\u4EE3\u672C\u8349\u5171\u8B58"),
                "\uFF1A\u5982\u751F\u8591\u8207\u4E7E\u59DC\u4E4B\u9BAE\u4E7E\u5340\u5206\u3001\u6842\u679D\u517C\u5177\u7518\u5473\u3001\u8525\u767D\u901A\u967D\u6563\u5BD2\u7B49\uFF0C\u5C6C\u6B77\u4EE3\u672C\u8349\u5B78\u5BB6\u53CA\u81E8\u5E8A\u5BB6\u9577\u671F\u7D2F\u7A4D\u7684\u516C\u8A8D\u898B\u89E3\uFF0C\u975E\u53D6\u81EA\u55AE\u4E00\u6587\u737B\u3002",
                React.createElement("br", null),
                React.createElement("strong", null, "\u85E5\u98DF\u540C\u6E90\u54C1\u76EE"),
                "\uFF1A\u7CB3\u7C73\u3001\u81A0\u98F4\uFF08\u98F4\u7CD6\uFF09\u3001\u9999\u8C49\uFF08\u6DE1\u8C46\u8C49\uFF09\u3001\u96DE\u5B50\uFF08\u96DE\u86CB\uFF09\u7B49\u98DF\u7269\u6027\u85E5\u6750\uFF0C\u4F9D\u50B3\u7D71\u98F2\u98DF\u7642\u6CD5\u6587\u737B\u53CA\u4E2D\u85E5\u5B78\u6559\u79D1\u66F8\u88DC\u5145\u6027\u5473\u3002")),
        React.createElement(Section, { title: "\u4E09\u3001\u64CD\u4F5C\u578B\u5B9A\u7FA9" },
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e" } }, "3.1 \u4E94\u5473\u5B9A\u7FA9\u8207\u91CF\u5316"),
            React.createElement("p", null, "\u4E94\u5473\u6307\u9178\u3001\u82E6\u3001\u7518\u3001\u8F9B\u3001\u9E79\u4E94\u7A2E\u85E5\u5473\uFF0C\u53D6\u81EA\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u539F\u6587\u300C\u5473X\u300D\u4E4B\u8A18\u8F09\u3002\u6BCF\u5473\u85E5\u53EF\u6709\u4E00\u500B\u6216\u591A\u500B\u5473\uFF08\u5982\u6842\u679D\u8F9B\u7518\uFF09\u3002"),
            React.createElement("p", null, "\u91CF\u5316\u65B9\u5F0F\uFF1A\u67D0\u65B9\u5291\u4E2D\uFF0C\u67D0\u5473\u7684\u6B0A\u91CD = \u8A72\u65B9\u5291\u4E2D\u6240\u6709\u542B\u6B64\u5473\u85E5\u7269\u7684\u7528\u91CF\uFF08\u5169\uFF09\u4E4B\u548C\u3002\u4E94\u5473\u767E\u5206\u6BD4 = \u67D0\u5473\u6B0A\u91CD \u00F7 \u65B9\u5291\u7E3D\u7528\u91CF \u00D7 100%\u3002\u56E0\u4E00\u5473\u85E5\u53EF\u517C\u5177\u591A\u5473\uFF0C\u6545\u4E94\u5473\u767E\u5206\u6BD4\u4E4B\u548C\u53EF\u80FD\u8D85\u904E 100%\u3002"),
            React.createElement("p", null, "\u4E94\u5473\u4EE5\u4E94\u89D2\u96F7\u9054\u5716\uFF08Pentagon Radar Chart\uFF09\u5448\u73FE\uFF0C\u4E94\u500B\u9802\u9EDE\u5206\u5225\u4EE3\u8868\u9178\u3001\u82E6\u3001\u7518\u3001\u8F9B\u3001\u9E79\uFF0C\u6578\u503C\u8D8A\u5927\u8868\u793A\u8A72\u5473\u5728\u65B9\u5291\u4E2D\u7684\u4F54\u6BD4\u8D8A\u9AD8\u3002"),
            React.createElement(DefTable, { headers: ["五味", "色標", "代表藥例"], rows: [
                    [React.createElement("span", { style: { fontWeight: 700, color: "#666" } }, "\u8F9B"), React.createElement("span", { style: { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#A0A0A0", border: "1px solid #666", verticalAlign: "middle" } }), "桂枝、生薑、附子、細辛、麻黃"],
                    [React.createElement("span", { style: { fontWeight: 700, color: "#D4A017" } }, "\u7518"), React.createElement("span", { style: { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#D4A017", verticalAlign: "middle" } }), "甘草、大棗、人參、茯苓、膠飴"],
                    [React.createElement("span", { style: { fontWeight: 700, color: "#C94435" } }, "\u82E6"), React.createElement("span", { style: { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#C94435", verticalAlign: "middle" } }), "黃連、黃芩、大黃、梔子、厚朴"],
                    [React.createElement("span", { style: { fontWeight: 700, color: "#3A8F5C" } }, "\u9178"), React.createElement("span", { style: { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#3A8F5C", verticalAlign: "middle" } }), "烏梅、五味子、芍藥"],
                    [React.createElement("span", { style: { fontWeight: 700, color: "#34495E" } }, "\u9E79"), React.createElement("span", { style: { display: "inline-block", width: 14, height: 14, borderRadius: 3, background: "#34495E", verticalAlign: "middle" } }), "牡蠣、龍骨、芒硝、水蛭"],
                ] }),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 20 } }, "3.2 \u56DB\u6C23\u5B9A\u7FA9\u8207\u91CF\u5316"),
            React.createElement("p", null, "\u56DB\u6C23\u6307\u85E5\u7269\u7684\u5BD2\u3001\u71B1\u3001\u6EAB\u3001\u6DBC\u56DB\u7A2E\u85E5\u6027\uFF0C\u52A0\u4E0A\u300C\u5E73\u300D\u5171\u4E94\u985E\u3002\u53D6\u81EA\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u539F\u6587\u300C\u5473X\u5BD2/\u6EAB/\u5E73\u300D\u7B49\u8A18\u8F09\uFF0C\u542B\u4FEE\u98FE\u8A9E\u300C\u5FAE\u300D\u300C\u5C0F\u300D\u3002"),
            React.createElement("p", null, "\u91CF\u5316\u65B9\u5F0F\uFF1A\u5C07\u56DB\u6C23\u8F49\u63DB\u70BA\u6578\u503C\u5206\u6578\uFF0C\u518D\u4EE5\u7528\u91CF\u52A0\u6B0A\u8A08\u7B97\u65B9\u5291\u6574\u9AD4\u7684\u300C\u5BD2\u71B1\u6307\u6578\u300D\u3002"),
            React.createElement(DefTable, { headers: ["四氣", "量化分數", "說明"], rows: [
                    ["大寒", "-3", "極寒之性"],
                    ["寒", "-2", "寒性"],
                    ["微寒 / 小寒 / 涼", "-1", "偏寒"],
                    ["平", "0", "平性，不偏寒熱"],
                    ["微溫 / 小溫", "+1", "偏溫"],
                    ["溫", "+2", "溫性"],
                    ["大溫 / 熱", "+3", "極溫熱之性"],
                ] }),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 20 } }, "3.3 \u5BD2\u71B1\u6307\u6578\u8A08\u7B97"),
            React.createElement("p", null, "\u5BD2\u71B1\u6307\u6578 = \u03A3\uFF08\u5404\u85E5\u56DB\u6C23\u5206\u6578 \u00D7 \u8A72\u85E5\u7528\u91CF\uFF09\u00F7 \u65B9\u5291\u7E3D\u7528\u91CF"),
            React.createElement("p", null, "\u4F8B\uFF1A\u56DB\u9006\u6E6F = \u7518\u8349\uFF08\u5E73=0\uFF09\u00D72\u5169 + \u4E7E\u8591\uFF08\u6EAB=+2\uFF09\u00D71.5\u5169 + \u9644\u5B50\uFF08\u6EAB=+2\uFF09\u00D71.5\u5169 = (0\u00D72 + 2\u00D71.5 + 2\u00D71.5) \u00F7 5 = +1.2"),
            React.createElement(DefTable, { headers: ["寒熱指數範圍", "偏性判定", "代表方劑"], rows: [
                    ["≤ -1.5", "大寒", "大陷胸湯、梔子豉湯、枳實梔子豉湯"],
                    ["-1.5 ~ -0.5", "偏寒", "白虎湯、小承氣湯、炙甘草湯"],
                    ["-0.5 ~ +0.5", "平性", "小柴胡湯、芍藥甘草湯、黃芩湯"],
                    ["+0.5 ~ +1.5", "偏溫", "桂枝湯、四逆湯、理中丸"],
                    ["≥ +1.5", "大溫", "麻黃湯、白通湯、乾薑附子湯"],
                ] }),
            React.createElement("p", { style: { fontWeight: 600, color: "#1a1a2e", marginTop: 20 } }, "3.4 \u7528\u91CF\u63DB\u7B97"),
            React.createElement("p", null, "\u65B9\u5291\u4E2D\u85E5\u7269\u7528\u91CF\u4EE5\u300C\u5169\u300D\u70BA\u7D71\u4E00\u57FA\u6E96\u55AE\u4F4D\uFF0C\u4F9D\u6771\u6F22\u5EA6\u91CF\u8861\u9032\u884C\u63DB\u7B97\uFF1A"),
            React.createElement(DefTable, { headers: ["原文單位", "換算為兩", "備註"], rows: [
                    ["兩", "1兩", "基準單位（東漢1兩 ≈ 15.6g）"],
                    ["斤", "16兩", "1斤 = 16兩"],
                    ["升", "≈ 5兩", "容量單位，依藥材密度估算"],
                    ["合", "≈ 0.5兩", "1合 = 1/10升"],
                    ["銖", "1/24兩", "24銖 = 1兩"],
                    ["枚（大棗）", "≈ 0.2兩/枚", "依果實大小估算"],
                    ["個（杏仁）", "≈ 0.02兩/個", "小粒藥物"],
                    ["如雞子大", "≈ 3兩", "石膏等礦物"],
                ] })),
        React.createElement(Section, { title: "\u56DB\u3001\u85E5\u540D\u5C0D\u61C9\u8868" },
            React.createElement("p", null, "\u300A\u50B7\u5BD2\u8AD6\u300B\u8207\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u6210\u66F8\u6642\u4EE3\u4E0D\u540C\uFF0C\u90E8\u5206\u85E5\u540D\u6709\u7570\u3002\u4EE5\u4E0B\u70BA\u672C\u7814\u7A76\u7684\u5C0D\u61C9\u898F\u5247\uFF1A"),
            React.createElement(DefTable, { headers: ["傷寒論用名", "本草經對應", "說明"], rows: [
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
                ] }),
            React.createElement("p", { style: { fontSize: 12, color: "#888", marginTop: 8 } }, "\u624B\u52D5\u88DC\u5145\uFF1A\u6307\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u4E2D\u672A\u7368\u7ACB\u6536\u9304\uFF0C\u4F9D\u50B3\u7D71\u672C\u8349\u5B78\u6587\u737B\u88DC\u5145\u6027\u5473\u7684\u85E5\u7269\u3002\u5305\u62EC\u751F\u8591\u3001\u6842\u679D\u3001\u7D30\u8F9B\u3001\u7CB3\u7C73\u3001\u81A0\u98F4\u3001\u8525\u767D\u3001\u9999\u8C49\u3001\u8D64\u5C0F\u8C46\u3001\u96DE\u5B50\u9EC3\u7B49\u3002")),
        React.createElement(Section, { title: "\u4E94\u3001\u6027\u5473\u722D\u8B70\u85E5\u7269" },
            React.createElement("p", null, "\u4EE5\u4E0B\u85E5\u7269\u7684\u6027\u5473\u5728\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u8207\u5F8C\u4E16\u672C\u8349\u4E4B\u9593\u5B58\u5728\u5DEE\u7570\uFF0C\u6216\u672C\u7814\u7A76\u7684\u8655\u7406\u65B9\u5F0F\u9700\u8981\u7279\u5225\u8AAA\u660E\u3002\u672C\u7814\u7A76\u539F\u5247\u4E0A\u4EE5\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u70BA\u6E96\uFF0C\u4F46\u5217\u51FA\u722D\u8B70\u4F9B\u7814\u7A76\u8005\u53C3\u8003\u3002"),
            React.createElement(DefTable, { headers: ["藥物", "本研究取值", "本草經原文", "後世觀點 / 爭議"], rows: [
                    ["杏仁", "甘溫", "杏核　味甘溫", "《名醫別錄》載味苦溫有毒。後世本草多以杏仁味苦，苦能降氣，主治咳喘。臨床上杏仁多歸於苦味，與本草經甘味之記載有顯著差異。"],
                    ["桂枝", "辛甘溫（手動）", "牡桂　味辛溫", "本草經載牡桂味辛溫，桂枝為牡桂之嫩枝。後世多認為桂枝兼具甘味，本研究取辛甘溫。另箘桂（肉桂）亦味辛溫，與桂枝為同物不同部位，功效有別。"],
                    ["生薑", "辛微溫（手動）", "（本草經僅載乾姜）", "本草經不分生薑、乾姜，僅載乾姜味辛溫。生薑為鮮品，性偏散表，乾姜為乾燥品，性偏溫中。本研究將生薑獨立設為辛微溫，以區別於乾姜之辛溫。"],
                    ["芍藥", "苦（無四氣）", "勺藥　味苦", "本草經僅載味苦，未記四氣，故不納入寒熱指數計算。後世分白芍（苦酸微寒）、赤芍（苦微寒），性味有別。傷寒論中芍藥未區分赤白。"],
                    ["芒硝", "苦寒", "消石　味苦寒", "本研究以芒硝對應消石。但消石與芒硝是否為同一物，歷代有爭議。一說消石為硝石（硝酸鉀），芒硝為朴硝（硫酸鈉），二者成分不同。"],
                    ["細辛", "辛溫（手動）", "（本草經無獨立條目）", "本草經未見細辛獨立條目，本研究依《名醫別錄》「味辛溫」補充。後世有「細辛不過錢」之說，用量爭議亦大。"],
                    ["赤石脂", "甘平", "五石脂　味甘平", "本草經將青石脂、赤石脂、黃石脂、白石脂、黑石脂合為一條，統稱味甘平。後世認為赤石脂味甘酸溫，與本草經有異。"],
                    ["麻仁 / 麻子仁", "辛平", "麻蕡　味辛平", "本草經載麻蕡味辛平，但麻子仁為大麻種仁，後世多認為味甘平，潤腸通便。辛味與甘味之別影響方劑五味分析。"],
                ] })),
        React.createElement(Section, { title: "\u516D\u3001\u7814\u7A76\u9650\u5236" },
            React.createElement("p", null,
                "1. ",
                React.createElement("strong", null, "\u6027\u5473\u4F86\u6E90\u55AE\u4E00"),
                "\uFF1A\u50C5\u53D6\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u4E4B\u8A18\u8F09\uFF0C\u672A\u53C3\u7167\u5F8C\u4E16\u672C\u8349\uFF08\u5982\u300A\u672C\u8349\u7D93\u96C6\u6CE8\u300B\u300A\u540D\u91AB\u5225\u9304\u300B\u7B49\uFF09\u7684\u589E\u88DC\u4FEE\u8A02\u3002\u90E8\u5206\u85E5\u7269\u5728\u672C\u8349\u7D93\u4E2D\u7684\u56DB\u6C23\u8A18\u8F09\u7F3A\u5931\uFF08\u5982\u828D\u85E5\u50C5\u8F09\u300C\u5473\u82E6\u300D\u7121\u56DB\u6C23\uFF09\uFF0C\u6B64\u985E\u85E5\u7269\u5728\u8A08\u7B97\u5BD2\u71B1\u6307\u6578\u6642\u4E0D\u7D0D\u5165\u56DB\u6C23\u6B0A\u91CD\u3002"),
            React.createElement("p", null,
                "2. ",
                React.createElement("strong", null, "\u4E94\u5473\u758A\u52A0"),
                "\uFF1A\u4E00\u5473\u85E5\u53EF\u517C\u5177\u591A\u5473\uFF08\u5982\u6842\u679D\u8F9B\u7518\uFF09\uFF0C\u8A08\u7B97\u6642\u6BCF\u500B\u5473\u5206\u5225\u4E58\u4EE5\u8A72\u85E5\u7528\u91CF\uFF0C\u56E0\u6B64\u4E94\u5473\u767E\u5206\u6BD4\u4E4B\u548C\u53EF\u80FD\u8D85\u904E 100%\u3002\u6B64\u70BA\u8A2D\u8A08\u9078\u64C7\uFF0C\u65E8\u5728\u5FE0\u5BE6\u53CD\u6620\u85E5\u7269\u7684\u8907\u5408\u5473\u6027\u3002"),
            React.createElement("p", null,
                "3. ",
                React.createElement("strong", null, "\u7528\u91CF\u63DB\u7B97\u70BA\u4F30\u7B97"),
                "\uFF1A\u5347\u3001\u5408\u7B49\u5BB9\u91CF\u55AE\u4F4D\u63DB\u7B97\u70BA\u5169\u6642\uFF0C\u56E0\u4E0D\u540C\u85E5\u6750\u5BC6\u5EA6\u5DEE\u7570\uFF0C\u5B58\u5728\u8AA4\u5DEE\u3002\u672C\u7814\u7A76\u53D6\u7D71\u4E00\u8FD1\u4F3C\u503C\uFF0C\u91CD\u5728\u65B9\u5291\u5167\u5404\u85E5\u7684\u76F8\u5C0D\u6BD4\u4F8B\u800C\u975E\u7D55\u5C0D\u91CD\u91CF\u3002"),
            React.createElement("p", null,
                "4. ",
                React.createElement("strong", null, "\u70AE\u88FD\u90E8\u5206\u7D0D\u5165"),
                "\uFF1A\u70AE\u88FD\uFF08\u7099\u3001\u70AE\u3001\u53BB\u76AE\u5C16\u7B49\uFF09\u53EF\u6539\u8B8A\u85E5\u7269\u6027\u5473\u3002\u672C\u7814\u7A76\u5DF2\u5C31\u5F71\u97FF\u6700\u5927\u7684\u5169\u5473\u85E5\u7269\u9032\u884C\u70AE\u88FD\u5F8C\u7684\u6027\u5473\u8ABF\u6574\uFF1A"),
            React.createElement("p", { style: { paddingLeft: 16 } },
                React.createElement("strong", null, "\u7518\u8349\uFF08\u7099 vs \u751F\uFF09"),
                "\uFF1A\u5B8B\u672C 112 \u9996\u65B9\u5291\u4E2D\uFF0C\u6709 69 \u65B9\u4F7F\u7528\u7099\u7518\u8349\uFF0C\u50C5\u7518\u8349\u6E6F\u3001\u6854\u6897\u6E6F 2 \u65B9\u7528\u751F\u7518\u8349\u3002\u7518\u8349\u7D93\u871C\u7099\u5F8C\uFF0C\u6027\u8CEA\u7531\u7518\u5E73\u8F49\u70BA\u7518\u6EAB\uFF0C\u529F\u6548\u5F9E\u6E05\u71B1\u89E3\u6BD2\u8F49\u70BA\u88DC\u4E2D\u76CA\u6C23\u3002\u672C\u7814\u7A76\u5C07\u7099\u7518\u8349\u8A2D\u70BA\u7518\u6EAB\uFF08\u56DB\u6C23\u5206\u6578 +2\uFF09\uFF0C\u751F\u7518\u8349\u7DAD\u6301\u7518\u5E73\uFF08\u56DB\u6C23\u5206\u6578 0\uFF09\uFF0C\u4F9D\u5B8B\u672C\u539F\u6587\u70AE\u88FD\u6A19\u8A3B\u81EA\u52D5\u5340\u5206\u3002"),
            React.createElement("p", { style: { paddingLeft: 16 } },
                React.createElement("strong", null, "\u9644\u5B50\uFF08\u751F\u7528 vs \u70AE\uFF09"),
                "\uFF1A\u50B7\u5BD2\u8AD6\u4E2D\u9644\u5B50\u6709\u300C\u70AE\uFF0C\u53BB\u76AE\uFF0C\u7834\u516B\u7247\u300D\u8207\u300C\u751F\u7528\uFF0C\u53BB\u76AE\uFF0C\u7834\u516B\u7247\u300D\u5169\u7A2E\u7528\u6CD5\u3002\u751F\u9644\u5B50\u56DE\u967D\u529B\u731B\u3001\u6BD2\u6027\u8F03\u5927\uFF0C\u672C\u7814\u7A76\u8A2D\u70BA\u8F9B\u3001\u5927\u6EAB\uFF08\u56DB\u6C23\u5206\u6578 +3\uFF09\uFF1B\u70AE\u9644\u5B50\u6BD2\u6027\u964D\u4F4E\u3001\u6EAB\u6027\u548C\u7DE9\uFF0C\u7DAD\u6301\u8F9B\u6EAB\uFF08\u56DB\u6C23\u5206\u6578 +2\uFF09\u3002\u5982\u56DB\u9006\u6E6F\u3001\u901A\u8108\u56DB\u9006\u6E6F\u3001\u767D\u901A\u6E6F\u7B49 8 \u65B9\u7528\u751F\u9644\u5B50\uFF0C\u771F\u6B66\u6E6F\u3001\u9644\u5B50\u6E6F\u7B49 12 \u65B9\u7528\u70AE\u9644\u5B50\uFF0C\u4F9D\u5B8B\u672C\u539F\u6587\u70AE\u88FD\u6A19\u8A3B\u81EA\u52D5\u5340\u5206\u3002"),
            React.createElement("p", { style: { paddingLeft: 16 } },
                React.createElement("strong", null, "\u5C1A\u672A\u7D0D\u5165\u7684\u70AE\u88FD"),
                "\uFF1A\u539A\u6734\uFF08\u7099\uFF0C\u53BB\u76AE\uFF09\u3001\u67B3\u5BE6\uFF08\u7099\uFF09\u3001\u534A\u590F\uFF08\u6D17\uFF09\u7B49\u85E5\u7269\u4EA6\u6709\u70AE\u88FD\u6A19\u8A3B\uFF0C\u4F46\u70AE\u88FD\u5F8C\u6027\u5473\u8B8A\u5316\u76F8\u5C0D\u8F03\u5C0F\u6216\u6587\u737B\u4F9D\u64DA\u4E0D\u8DB3\uFF0C\u672C\u7814\u7A76\u66AB\u672A\u8ABF\u6574\uFF0C\u4ECD\u70BA\u6F5B\u5728\u8AA4\u5DEE\u4F86\u6E90\u3002"),
            React.createElement("p", { style: { paddingLeft: 16 } },
                React.createElement("strong", null, "\u672A\u4F86\u6539\u9032\u65B9\u5411"),
                "\uFF1A\u82E5\u80FD\u6574\u5408\u5B8B\u300A\u8B49\u985E\u672C\u8349\u300B\u4E2D\u4FDD\u5B58\u7684\u300A\u540D\u91AB\u5225\u9304\u300B\u6027\u5473\u589E\u88DC\u53CA\u300A\u96F7\u516C\u70AE\u7099\u8AD6\u300B\u70AE\u88FD\u8A18\u8F09\uFF0C\u53EF\u9032\u4E00\u6B65\u5EFA\u7ACB\u66F4\u5B8C\u6574\u7684\u70AE\u88FD\u4FEE\u6B63\u9AD4\u7CFB\u3002\u60DF\u6B64\u4E8C\u66F8\u539F\u66F8\u5DF2\u4F5A\uFF0C\u50C5\u5B58\u8F49\u5F15\u5167\u5BB9\uFF0C\u9700\u5BE9\u614E\u8003\u8B49\u5F8C\u65B9\u53EF\u63A1\u7528\u3002"),
            React.createElement("p", null,
                "5. ",
                React.createElement("strong", null, "\u6B78\u7D93\u672A\u7D0D\u5165"),
                "\uFF1A\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u672A\u660E\u78BA\u8A18\u8F09\u6B78\u7D93\uFF0C\u6545\u672C\u7814\u7A76\u50C5\u5206\u6790\u4E94\u5473\u8207\u56DB\u6C23\u5169\u500B\u7DAD\u5EA6\u3002")),
        React.createElement(Section, { title: "\u4E03\u3001\u53C3\u8003\u6587\u737B" },
            React.createElement("p", { style: { fontSize: 13, lineHeight: 2.2, color: "#555" } },
                "[1] \u57FA\u4E8E\u591A\u7EF4\u5B8F\u89C2\u91CF\u5316\u65B9\u6CD5\u89E3\u8BFB\u300A\u4F24\u5BD2\u8BBA\u300B\u5BD2\u70ED\u9519\u6742\u8BC1\u7EC4\u65B9\u89C4\u5F8B. \u4E2D\u534E\u4E2D\u533B\u836F\u5B66\u4F1A\u671F\u520A, 2023. \u8A72\u7814\u7A76\u540C\u6A23\u4EE5\u56DB\u6C23\u4E94\u5473\u8A08\u5206\u00D7\u5291\u91CF\u7684\u52A0\u6B0A\u65B9\u6CD5\uFF0C\u5206\u6790\u50B7\u5BD2\u8AD6 7 \u9996\u5BD2\u71B1\u932F\u96DC\u8B49\u65B9\u5291\uFF08\u9EC3\u9023\u6E6F\u3001\u534A\u590F\u7009\u5FC3\u6E6F\u3001\u70CF\u6885\u4E38\u7B49\uFF09\u7684\u56DB\u6C23\u4E94\u5473\u4F5C\u7528\u5EA6\uFF0C\u70BA\u672C\u7814\u7A76\u7684\u91CF\u5316\u65B9\u6CD5\u63D0\u4F9B\u4E86\u5B78\u8853\u5148\u4F8B\u3002",
                React.createElement("br", null),
                "[2] \u795E\u8FB2\u672C\u8349\u7D93. \u6E05\u00B7\u5B6B\u661F\u884D\u8F2F\u672C. \u672C\u7814\u7A76\u6027\u5473\u6578\u64DA\u4E4B\u4E3B\u8981\u4F86\u6E90\u3002",
                React.createElement("br", null),
                "[3] \u50B7\u5BD2\u8AD6. \u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\uFF08\u660E\u842C\u66C6\u4E8C\u5341\u4E03\u5E74\u520A\u672C\uFF09. \u672C\u7814\u7A76\u65B9\u5291\u4F86\u6E90\u4E4B\u5E95\u672C\u3002",
                React.createElement("br", null),
                "[4] \u672C\u8349\u7D93\u96C6\u6CE8. \u5357\u671D\u6881\u00B7\u9676\u5F18\u666F. \u4EE5\u6731\u58A8\u5206\u66F8\u4FDD\u5B58\u672C\u8349\u7D93\u539F\u6587\u8207\u540D\u91AB\u5225\u9304\u589E\u88DC\uFF0C\u70BA\u5F8C\u4E16\u672C\u8349\u5B78\u4E4B\u6A1E\u7D10\u3002",
                React.createElement("br", null),
                "[5] \u540D\u91AB\u5225\u9304. \u6F22\u672B\u9B4F\u6649\u9593\u91AB\u5BB6\u64B0\uFF0C\u539F\u66F8\u5DF2\u4F5A. \u8A18\u9304\u5F8C\u4E16\u91AB\u5BB6\u5C0D\u672C\u8349\u7D93\u85E5\u7269\u7684\u56DB\u6C23\u3001\u6027\u5473\u589E\u88DC\u610F\u898B\uFF0C\u5167\u5BB9\u4FDD\u5B58\u65BC\u300A\u672C\u8349\u7D93\u96C6\u6CE8\u300B\u53CA\u300A\u8B49\u985E\u672C\u8349\u300B\u4E2D\u3002",
                React.createElement("br", null),
                "[6] \u96F7\u516C\u70AE\u7099\u8AD6. \u5357\u671D\u5289\u5B8B\u00B7\u96F7\u6585\uFF0C\u539F\u66F8\u5DF2\u4F5A. \u4E2D\u570B\u6700\u65E9\u70AE\u88FD\u5C08\u66F8\uFF0C\u8A18\u8F09\u85E5\u7269\u70AE\u88FD\u65B9\u6CD5\u53CA\u524D\u5F8C\u6027\u5473\u8B8A\u5316\uFF0C\u5167\u5BB9\u6563\u898B\u65BC\u300A\u8B49\u985E\u672C\u8349\u300B\u3002",
                React.createElement("br", null),
                "[7] \u7D93\u53F2\u8B49\u985E\u5099\u6025\u672C\u8349\uFF08\u8B49\u985E\u672C\u8349\uFF09. \u5B8B\u00B7\u5510\u614E\u5FAE. \u5206\u5C64\u6536\u9304\u6B77\u4EE3\u672C\u8349\u6587\u737B\uFF0C\u70BA\u4FDD\u5B58\u53E4\u672C\u8349\u8CC7\u6599\u6700\u5B8C\u6574\u4E4B\u8457\u4F5C\uFF0C\u672A\u4F86\u53EF\u4F5C\u70BA\u591A\u5C64\u6027\u5473\u5206\u6790\u4E4B\u4F9D\u64DA\u3002")),
        React.createElement("div", { style: { textAlign: "center", padding: "24px 0", fontSize: 11, color: "#bbb", lineHeight: 1.8 } },
            "\u65B9\u5291\u4F86\u6E90\uFF1A\u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\u300A\u50B7\u5BD2\u8AD6\u300B\uFF08\u660E\u842C\u66C6\u4E8C\u5341\u4E03\u5E74\u520A\u672C\uFF09",
            React.createElement("br", null),
            "\u6027\u5473\u4F86\u6E90\uFF1A\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B",
            React.createElement("br", null))));
}
function AuthorPage() {
    return (React.createElement("div", { style: { padding: "20px 24px", maxWidth: 800, margin: "0 auto" } },
        React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: "32px 28px", marginBottom: 20, border: "1px solid #eee", textAlign: "center" } },
            React.createElement("div", { style: {
                    width: 80, height: 80, borderRadius: "50%", margin: "0 auto 16px",
                    background: "linear-gradient(135deg, #1a1a2e, #0f3460)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, color: "#fff", fontFamily: "'Noto Serif TC', serif"
                } }, "\u5433"),
            React.createElement("h2", { style: { margin: "0 0 4px", fontSize: 24, fontFamily: "'Noto Serif TC', serif", color: "#1a1a2e" } }, "\u5433\u5553\u9298"),
            React.createElement("p", { style: { fontSize: 14, color: "#888", margin: "0 0 16px" } }, "\u4E2D\u91AB\u535A\u58EB"),
            React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" } }, ["教育部審定助理教授", "臻品中醫診所副院長"].map(t => (React.createElement("span", { key: t, style: {
                    fontSize: 13, padding: "4px 14px", borderRadius: 20,
                    background: "#f5f3f0", color: "#555", border: "1px solid #e8e4df"
                } }, t))))),
        React.createElement(Section, { title: "\u7814\u7A76\u521D\u5FC3" },
            React.createElement("p", null, "\u300A\u50B7\u5BD2\u8AD6\u300B\u662F\u4E2D\u91AB\u81E8\u5E8A\u7684\u6839\u57FA\u4E4B\u4F5C\uFF0C\u7136\u800C\u5343\u5E74\u7D93\u5178\u7684\u7814\u7A76\u5F9E\u4F86\u4E0D\u662F\u4E00\u4EF6\u5BB9\u6613\u7684\u4E8B\u3002\u689D\u6587\u4E4B\u9593\u7684\u908F\u8F2F\u3001\u65B9\u5291\u7D44\u6210\u7684\u5DE7\u601D\u3001\u6027\u5473\u914D\u4F0D\u7684\u6DF1\u610F\uFF0C\u5F80\u5F80\u9700\u8981\u53CD\u8986\u63A8\u6572\u3001\u9577\u5E74\u6D78\u6F64\uFF0C\u624D\u80FD\u7565\u7ABA\u5802\u5967\u3002"),
            React.createElement("p", null, "\u8FD1\u5E74\u4EBA\u5DE5\u667A\u6167\u6280\u8853\u7684\u767C\u5C55\uFF0C\u70BA\u7D93\u5178\u7814\u7A76\u958B\u555F\u4E86\u65B0\u7684\u53EF\u80FD\u3002\u6211\u958B\u59CB\u5617\u8A66\u4EE5 AI \u4F5C\u70BA\u8F14\u52A9\u5DE5\u5177\uFF0C\u5C07\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u7684\u6027\u5473\u6578\u64DA\u8207\u300A\u50B7\u5BD2\u8AD6\u300B\u7684\u65B9\u5291\u7D44\u6210\u9032\u884C\u7CFB\u7D71\u6027\u7684\u91CF\u5316\u5206\u6790\u2014\u2014\u4E0D\u662F\u8981\u53D6\u4EE3\u50B3\u7D71\u7684\u8B80\u66F8\u65B9\u6CD5\uFF0C\u800C\u662F\u5E0C\u671B\u900F\u904E\u6578\u64DA\u5316\u7684\u8996\u89D2\uFF0C\u8B93\u81EA\u5DF1\u5C0D\u6BCF\u4E00\u9996\u65B9\u5291\u7684\u6027\u5473\u7D50\u69CB\u6709\u66F4\u6E05\u6670\u3001\u66F4\u76F4\u89BA\u7684\u7406\u89E3\u3002"),
            React.createElement("p", null, "\u9019\u500B\u7814\u7A76\u7DB2\u9801\u662F\u5B78\u7FD2\u904E\u7A0B\u4E2D\u7684\u7522\u7269\u3002\u5C07\u5B83\u6574\u7406\u51FA\u4F86\u8207\u5927\u5BB6\u5206\u4EAB\uFF0C\u4E00\u65B9\u9762\u662F\u5E0C\u671B\u80FD\u70BA\u540C\u6A23\u5728\u7814\u8B80\u50B7\u5BD2\u8AD6\u7684\u540C\u9053\u63D0\u4F9B\u4E00\u500B\u53C3\u8003\u5DE5\u5177\uFF0C\u53E6\u4E00\u65B9\u9762\u4E5F\u671F\u5F85\u62CB\u78DA\u5F15\u7389\uFF0C\u8B93\u66F4\u591A\u4EBA\u4E00\u8D77\u63A2\u7D22\u7D93\u5178\u8207\u73FE\u4EE3\u6280\u8853\u7D50\u5408\u7684\u53EF\u80FD\u6027\u3002"),
            React.createElement("p", null, "\u4E2D\u91AB\u7684\u5B78\u554F\u535A\u5927\u7CBE\u6DF1\uFF0C\u4EFB\u4F55\u91CF\u5316\u5206\u6790\u90FD\u6709\u5176\u5C40\u9650\u3002\u6578\u64DA\u53EF\u4EE5\u8F14\u52A9\u601D\u8003\uFF0C\u4F46\u7121\u6CD5\u53D6\u4EE3\u81E8\u5E8A\u7D93\u9A57\u8207\u5C0D\u7D93\u5178\u7684\u6DF1\u5165\u9AD4\u609F\u3002\u5E0C\u671B\u9019\u500B\u5C0F\u5C0F\u7684\u5DE5\u5177\uFF0C\u80FD\u6210\u70BA\u5927\u5BB6\u5B78\u7FD2\u8DEF\u4E0A\u7684\u4E00\u500B\u8D77\u9EDE\uFF0C\u800C\u975E\u7D42\u9EDE\u3002")),
        React.createElement(Section, { title: "\u6388\u6B0A\u689D\u6B3E" },
            React.createElement("div", { style: { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" } },
                React.createElement("div", { style: { flex: 1, minWidth: 280 } },
                    React.createElement("p", null,
                        "\u672C\u7DB2\u7AD9\u5167\u5BB9\u63A1\u7528 ",
                        React.createElement("strong", null, "Creative Commons \u59D3\u540D\u6A19\u793A-\u975E\u5546\u696D\u6027-\u76F8\u540C\u65B9\u5F0F\u5206\u4EAB 4.0 \u570B\u969B\u6388\u6B0A\u689D\u6B3E"),
                        "\uFF08CC BY-NC-SA 4.0\uFF09\u6388\u6B0A\u3002"),
                    React.createElement("p", { style: { marginTop: 12 } }, "\u60A8\u53EF\u4EE5\u81EA\u7531\u5730\uFF1A"),
                    React.createElement("p", null,
                        React.createElement("strong", null, "\u5206\u4EAB"),
                        " \u2014 \u4EE5\u4EFB\u4F55\u5A92\u4ECB\u6216\u683C\u5F0F\u91CD\u88FD\u53CA\u6563\u5E03\u672C\u7D20\u6750\u3002",
                        React.createElement("br", null),
                        React.createElement("strong", null, "\u6539\u4F5C"),
                        " \u2014 \u91CD\u6DF7\u3001\u8F49\u63DB\u672C\u7D20\u6750\u3001\u53CA\u4F9D\u672C\u7D20\u6750\u5EFA\u7ACB\u65B0\u7D20\u6750\u3002"),
                    React.createElement("p", { style: { marginTop: 12 } }, "\u4F46\u9808\u9075\u5B88\u4EE5\u4E0B\u689D\u4EF6\uFF1A"),
                    React.createElement("p", null,
                        React.createElement("strong", null, "\u59D3\u540D\u6A19\u793A"),
                        " \u2014 \u60A8\u5FC5\u9808\u6A19\u793A\u4F5C\u8005\u59D3\u540D\uFF08\u5433\u5553\u9298\uFF09\uFF0C\u4E26\u63D0\u4F9B\u6388\u6B0A\u689D\u6B3E\u7684\u9023\u7D50\u3002",
                        React.createElement("br", null),
                        React.createElement("strong", null, "\u975E\u5546\u696D\u6027"),
                        " \u2014 \u60A8\u4E0D\u5F97\u5C07\u672C\u7D20\u6750\u7528\u65BC\u5546\u696D\u76EE\u7684\u3002",
                        React.createElement("br", null),
                        React.createElement("strong", null, "\u76F8\u540C\u65B9\u5F0F\u5206\u4EAB"),
                        " \u2014 \u82E5\u60A8\u6539\u4F5C\u672C\u7D20\u6750\uFF0C\u5FC5\u9808\u4EE5\u76F8\u540C\u6388\u6B0A\u689D\u6B3E\u6563\u5E03\u3002")),
                React.createElement("div", { style: { textAlign: "center", padding: 16 } },
                    React.createElement("a", { href: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant", target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "none" } },
                        React.createElement("div", { style: {
                                display: "flex", gap: 4, justifyContent: "center", marginBottom: 8
                            } }, ["CC", "BY", "NC", "SA"].map(icon => (React.createElement("span", { key: icon, style: {
                                width: 32, height: 32, borderRadius: "50%", background: "#333", color: "#fff",
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800
                            } }, icon)))),
                        React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "CC BY-NC-SA 4.0"))))),
        React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 20, border: "1px solid #eee", textAlign: "center" } },
            React.createElement("a", { href: "https://drwu.carrd.co", target: "_blank", rel: "noopener noreferrer", style: {
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff",
                    borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600, letterSpacing: 1,
                    transition: "opacity 0.2s",
                } },
                React.createElement("span", { style: { fontSize: 18 } }, "\uD83D\uDC68\u200D\u2695\uFE0F"),
                React.createElement("span", null, "\u5433\u5553\u9298\u4E2D\u91AB\u5E2B\u7DDA\u4E0A\u540D\u7247"),
                React.createElement("span", { style: { fontSize: 12, opacity: 0.7 } }, "\u2197"))),
        React.createElement("div", { style: { textAlign: "center", padding: "24px 0", fontSize: 11, color: "#bbb", lineHeight: 1.8 } }, "\u00A9 2026 \u5433\u5553\u9298 \u4E2D\u91AB\u535A\u58EB\u3000\u3000\u4EE5 CC BY-NC-SA 4.0 \u6388\u6B0A\u91CB\u51FA")));
}
function ClauseItem({ cl, isLast }) {
    const [showDiffs, setShowDiffs] = useState(false);
    const hasDiffs = cl.d && cl.d.length > 0;
    return (React.createElement("div", { style: { padding: "10px 14px", borderBottom: isLast ? "none" : "1px solid #f0f0f0" } },
        React.createElement("div", { style: { fontSize: 13, lineHeight: 1.8, color: "#444" } },
            React.createElement("span", { style: {
                    display: "inline-block", fontSize: 10, fontWeight: 700, color: "#fff",
                    background: "#1a1a2e", borderRadius: 4, padding: "1px 8px", marginRight: 8,
                    verticalAlign: "middle", fontFamily: "monospace",
                } }, cl.num),
            React.createElement("span", null, cl.t),
            hasDiffs && (React.createElement("span", { onClick: () => setShowDiffs(!showDiffs), style: {
                    display: "inline-block", fontSize: 9, color: "#C94435", marginLeft: 8,
                    cursor: "pointer", verticalAlign: "middle", fontWeight: 600,
                    padding: "1px 6px", borderRadius: 3, border: "1px solid #C94435",
                } }, showDiffs ? "收合比較" : `異文 ${cl.d.length}`))),
        showDiffs && hasDiffs && (React.createElement("div", { style: { marginTop: 6, paddingLeft: 8, borderLeft: "2px solid #e0ddd8" } }, cl.d.map((d, j) => (React.createElement("div", { key: j, style: { fontSize: 12, lineHeight: 1.7, color: "#777", marginBottom: 4 } },
            React.createElement("span", { style: {
                    display: "inline-block", fontSize: 9, fontWeight: 700,
                    color: d.v === "桂" ? "#2E86C1" : "#E67E22",
                    background: d.v === "桂" ? "#EBF5FB" : "#FEF5E7",
                    borderRadius: 3, padding: "0px 5px", marginRight: 6,
                } }, d.v === "桂" ? "桂林古本" : "康治本"),
            React.createElement("span", null, d.t))))))));
}
function DetailPanel({ selected, compare, setCompare, onClose }) {
    const [expandedHerb, setExpandedHerb] = useState(null);
    return (React.createElement("div", { style: {
            flex: 1, background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eee",
            alignSelf: "flex-start"
        } },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 } },
            React.createElement("div", null,
                React.createElement("h2", { style: { margin: 0, fontSize: 22, fontFamily: "'Noto Serif TC', serif" } }, selected.n),
                React.createElement("div", { style: { fontSize: 13, color: "#888", marginTop: 4 } }, selected.c)),
            React.createElement("button", { onClick: onClose, style: {
                    background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", padding: 4
                } }, "\u2715")),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } },
                React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "\u5BD2\u71B1\u6307\u6578"),
                React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: TENDENCY_COLORS[selected.nt] } },
                    selected.ns > 0 ? "+" : "",
                    selected.ns,
                    " (",
                    selected.nt,
                    ")")),
            React.createElement(NatureGauge, { score: selected.ns }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginTop: 4 } },
                React.createElement("span", null, "\u5927\u5BD2"),
                React.createElement("span", null, "\u504F\u5BD2"),
                React.createElement("span", null, "\u5E73"),
                React.createElement("span", null, "\u504F\u6EAB"),
                React.createElement("span", null, "\u5927\u6EAB"))),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 } },
                React.createElement("span", { style: { fontSize: 12, color: "#888" } }, "\u4E94\u5473\u5206\u4F48"),
                React.createElement("select", { value: compare ? compare.n : "", onChange: e => {
                        const f = DATA.find(d => d.n === e.target.value);
                        setCompare(f || null);
                    }, style: { fontSize: 11, padding: "2px 6px", borderRadius: 4, border: "1px solid #ddd", color: "#555", background: "#fafafa" } },
                    React.createElement("option", { value: "" }, "\u5C0D\u6BD4\u65B9\u5291..."),
                    DATA.filter(d => d.n !== selected.n).map(d => (React.createElement("option", { key: d.n, value: d.n }, d.n))))),
            React.createElement("div", { style: { display: "flex", justifyContent: "center" } },
                React.createElement(RadarChart, { fp: selected.fp, fp2: compare ? compare.fp : null, label: selected.n, label2: compare ? compare.n : null, size: 300 }))),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 6 } }, "\u56DB\u6C23\u69CB\u6210"),
            React.createElement("div", { style: { display: "flex", gap: 8 } }, ["寒涼", "平", "溫熱"].map(g => (React.createElement("div", { key: g, style: { flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, background: "#f8f8f8" } },
                React.createElement("div", { style: { fontSize: 18, fontWeight: 700, color: g === "寒涼" ? "#3498DB" : g === "溫熱" ? "#E67E22" : "#7F8C8D" } },
                    selected.ng[g],
                    "%"),
                React.createElement("div", { style: { fontSize: 11, color: "#888" } }, g)))))),
        (selected.hl || selected.cm) && (React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 6 } }, "\u7D44\u6210\u8207\u714E\u670D\u6CD5\uFF08\u539F\u6587\uFF09"),
            React.createElement("div", { style: { padding: "12px 16px", borderRadius: 8, background: "#faf8f5", border: "1px solid #e8e4df", fontSize: 13, lineHeight: 2, color: "#555" } },
                selected.hl && React.createElement("p", { style: { margin: "0 0 8px", fontWeight: 600 } }, selected.hl),
                selected.cm && React.createElement("p", { style: { margin: 0 } }, selected.cm)))),
        React.createElement("div", { style: { marginBottom: 16 } },
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 } },
                "\u85E5\u7269\u7D44\u6210\uFF08",
                selected.hd.length,
                " \u5473\uFF0C\u7E3D ",
                selected.tw,
                " \u5169\uFF09",
                React.createElement("span", { style: { fontSize: 10, color: "#bbb", marginLeft: 8 } }, "\u9EDE\u64CA\u85E5\u7269\u67E5\u770B\u672C\u8349\u7D93\u539F\u6587")),
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap" } }, [...selected.hd].sort((a, b) => b.w - a.w).map((h, i) => (React.createElement(HerbPill, { key: i, herb: h, expanded: expandedHerb === h.n, onToggle: () => setExpandedHerb(expandedHerb === h.n ? null : h.n) }))))),
        selected.cl && selected.cl.length > 0 && (React.createElement("div", null,
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 } },
                "\u76F8\u95DC\u689D\u6587\uFF08",
                selected.cl.length,
                " \u689D\uFF09"),
            React.createElement("div", { style: { maxHeight: 400, overflowY: "auto", borderRadius: 8, border: "1px solid #eee" } }, selected.cl.map((cl, i) => (React.createElement(ClauseItem, { key: i, cl: cl, isLast: i === selected.cl.length - 1 }))))))));
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
            if (cat !== "全部" && d.c !== cat)
                return false;
            if (tend !== "全部" && d.nt !== tend)
                return false;
            if (search) {
                const q = search.toLowerCase();
                if (!d.n.includes(q) && !d.hd.some(h => h.n.includes(q)))
                    return false;
            }
            return true;
        });
    }, [cat, tend, search]);
    return (React.createElement("div", { style: { fontFamily: "'Noto Sans TC', 'Hiragino Sans', sans-serif", background: "#F7F5F2", minHeight: "100vh" } },
        React.createElement("div", { style: { background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", color: "#fff", padding: "32px 24px 24px" } },
            React.createElement("h1", { style: { margin: 0, fontSize: 26, fontWeight: 800, fontFamily: "'Noto Serif TC', serif", letterSpacing: 2 } }, "\u50B7\u5BD2\u8AD6\u65B9\u5291\u6027\u5473\u5206\u6790"),
            React.createElement("p", { style: { margin: "8px 0 0", fontSize: 13, opacity: 0.65, lineHeight: 1.8 } },
                "\u4EE5\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u4E94\u5473\u56DB\u6C23\u6578\u64DA\u70BA\u57FA\u790E\uFF0C\u7D50\u5408\u85E5\u7269\u7528\u91CF\u52A0\u6B0A\u8A08\u7B97\uFF0C\u5C0D\u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\u300A\u50B7\u5BD2\u8AD6\u300B",
                DATA.length,
                " \u9996\u65B9\u5291\u9032\u884C\u6027\u5473\u7D50\u69CB\u91CF\u5316\u5206\u6790\u3002\u6BCF\u9996\u65B9\u5291\u9644\u6709\u7D44\u6210\u539F\u6587\u3001\u714E\u670D\u6CD5\u3001\u5B8B\u6842\u5EB7\u4E09\u7248\u672C\u689D\u6587\u7570\u6587\u6BD4\u8F03\uFF0C\u4EE5\u53CA\u5404\u85E5\u7269\u4E4B\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B\u539F\u6587\u5C0D\u7167\u3002"),
            React.createElement("div", { style: { display: "flex", gap: 4, marginTop: 16 } }, [["analysis", "方劑分析"], ["about", "研究說明"], ["author", "關於作者"]].map(([k, label]) => (React.createElement("button", { key: k, onClick: () => setPage(k), style: {
                    padding: "8px 20px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 600, letterSpacing: 1,
                    background: page === k ? "#F7F5F2" : "rgba(255,255,255,0.12)",
                    color: page === k ? "#1a1a2e" : "rgba(255,255,255,0.7)",
                    transition: "all 0.2s"
                } }, label))))),
        page === "about" ? React.createElement(AboutPage, null) : page === "author" ? React.createElement(AuthorPage, null) : (React.createElement("div", { style: { padding: "20px 24px", maxWidth: 960, margin: "0 auto" } },
            React.createElement(OverviewStats, { data: filtered }),
            React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #eee" } },
                React.createElement("div", { style: { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 12 } },
                    React.createElement("input", { value: search, onChange: e => setSearch(e.target.value), placeholder: "\u641C\u5C0B\u65B9\u5291\u6216\u85E5\u7269...", style: { flex: 1, minWidth: 180, padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14, outline: "none" } }),
                    React.createElement("div", { style: { display: "flex", gap: 4 } },
                        React.createElement("button", { onClick: () => setView("list"), style: {
                                padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer",
                                background: view === "list" ? "#2c3e50" : "#fff", color: view === "list" ? "#fff" : "#333", fontSize: 13, fontWeight: 600
                            } }, "\u5217\u8868"),
                        React.createElement("button", { onClick: () => setView("scatter"), style: {
                                padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer",
                                background: view === "scatter" ? "#2c3e50" : "#fff", color: view === "scatter" ? "#fff" : "#333", fontSize: 13, fontWeight: 600
                            } }, "\u6563\u4F48\u5716"))),
                React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 } },
                    React.createElement("span", { style: { fontSize: 12, color: "#888", lineHeight: "28px" } }, "\u516D\u7D93\uFF1A"),
                    CATEGORIES.map(c => (React.createElement("button", { key: c, onClick: () => setCat(c), style: {
                            padding: "4px 12px", borderRadius: 16, border: "1px solid #ddd", cursor: "pointer", fontSize: 12,
                            background: cat === c ? "#2c3e50" : "#fff", color: cat === c ? "#fff" : "#555", fontWeight: cat === c ? 600 : 400
                        } }, c)))),
                React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
                    React.createElement("span", { style: { fontSize: 12, color: "#888", lineHeight: "28px" } }, "\u504F\u6027\uFF1A"),
                    TENDENCIES.map(t => (React.createElement("button", { key: t, onClick: () => setTend(t), style: {
                            padding: "4px 12px", borderRadius: 16, border: "1px solid #ddd", cursor: "pointer", fontSize: 12,
                            background: tend === t ? (TENDENCY_COLORS[t] || "#2c3e50") : "#fff",
                            color: tend === t ? "#fff" : "#555", fontWeight: tend === t ? 600 : 400
                        } }, t))))),
            React.createElement("div", { style: { fontSize: 12, color: "#888", marginBottom: 8 } },
                "\u5171 ",
                filtered.length,
                " \u9996\u65B9\u5291"),
            view === "scatter" ? (React.createElement("div", { style: { background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee", marginBottom: 16 } },
                React.createElement("div", { style: { display: "flex", gap: 12, marginBottom: 10, justifyContent: "center", flexWrap: "wrap" } }, FLAVORS.map(f => (React.createElement("span", { key: f, style: { display: "flex", alignItems: "center", gap: 4, fontSize: 11 } },
                    React.createElement("span", { style: { width: 10, height: 10, borderRadius: "50%", background: FLAVOR_COLORS[f], display: "inline-block" } }),
                    f)))),
                React.createElement(ScatterPlot, { data: filtered, selected: selected, onSelect: setSelected }))) : null,
            React.createElement("div", { style: { display: "flex", gap: 16, flexDirection: view === "list" ? "row" : "column" } },
                React.createElement("div", { style: {
                        background: "#fff", borderRadius: 12, border: "1px solid #eee", overflow: "hidden",
                        width: view === "list" && selected ? "45%" : "100%",
                        maxHeight: view === "list" ? 600 : "none", overflowY: "auto",
                        transition: "width 0.2s"
                    } },
                    filtered.map(f => (React.createElement(FormulaCard, { key: f.n, formula: f, selected: selected && selected.n === f.n, onClick: () => setSelected(selected && selected.n === f.n ? null : f) }))),
                    filtered.length === 0 && (React.createElement("div", { style: { padding: 40, textAlign: "center", color: "#aaa" } }, "\u7121\u7B26\u5408\u689D\u4EF6\u7684\u65B9\u5291"))),
                selected && (React.createElement(DetailPanel, { selected: selected, compare: compare, setCompare: setCompare, onClose: () => setSelected(null) }))),
            React.createElement("div", { style: { textAlign: "center", padding: "24px 0", fontSize: 11, color: "#bbb", lineHeight: 1.8 } }, "\u00A9 2026 \u5433\u5553\u9298 \u4E2D\u91AB\u535A\u58EB\u3000\u3000\u6027\u5473\u4F86\u6E90\uFF1A\u300A\u795E\u8FB2\u672C\u8349\u7D93\u300B \u00B7 \u65B9\u5291\u4F86\u6E90\uFF1A\u8D99\u958B\u7F8E\u7FFB\u523B\u5B8B\u672C\u300A\u50B7\u5BD2\u8AD6\u300B")))));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
