"use client";
import { useState, useRef, useCallback } from "react";

const C = {
  bg: "#F7F5F0", green: "#2D6A2D", greenLight: "#E8F5E8", amber: "#D47A00",
  amberLight: "#FFF3E0", textPrimary: "#1A1A1A", textSecondary: "#555555",
  cardBg: "#FFFFFF", cardBorder: "#DDDDDD", error: "#9B2C2C",
};

const SUB_MODE_INFO = {
  organic_reply: { label: "Organic Reply", short: "Reply", desc: "Answer a real question in a real thread", length: "150–250 words" },
  organic_post: { label: "Organic New Post", short: "Post", desc: "Start a thread that earns engagement", length: "200–350 words" },
  promoted_text: { label: "Promoted Text", short: "Promoted", desc: "Paid post that reads organic", length: "100–150 words" },
  conversation_ad: { label: "Conversation Ad", short: "Conv. Ad", desc: "Brand adds value in a thread", length: "75–125 words" },
};
const MODE_KEYS = Object.keys(SUB_MODE_INFO);

// ── Styles ──
const s = {
  topBar: { background: C.green, height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" },
  topTitle: { color: "#fff", fontSize: 18, fontWeight: 700 },
  topSub: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 400, marginLeft: 8 },
  container: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textSecondary, marginBottom: 8 },
  card: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "18px 22px", marginBottom: 16 },
  btn: { background: C.green, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, padding: "10px 20px", cursor: "pointer" },
  btnOutline: { background: "transparent", color: C.green, border: `1px solid ${C.green}`, borderRadius: 4, fontSize: 13, fontWeight: 600, padding: "10px 20px", cursor: "pointer" },
  btnSmall: { background: C.green, color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, padding: "6px 12px", cursor: "pointer" },
  input: { width: "100%", padding: "10px 12px", border: `1px solid ${C.cardBorder}`, borderRadius: 4, fontSize: 13, fontFamily: "inherit" },
  textarea: { width: "100%", padding: "10px 12px", border: `1px solid ${C.cardBorder}`, borderRadius: 4, fontSize: 13, fontFamily: "inherit", minHeight: 120, resize: "vertical" },
  chip: { display: "inline-block", fontSize: 11, fontWeight: 600, background: C.greenLight, color: C.green, borderRadius: 12, padding: "3px 10px", marginRight: 6, marginBottom: 4 },
  badge: { display: "inline-block", fontSize: 10, fontWeight: 600, color: "#fff", borderRadius: 10, padding: "2px 8px", marginRight: 6 },
  tabActive: { background: C.greenLight, border: `2px solid ${C.green}`, borderRadius: 6, padding: "12px 16px", cursor: "pointer", flex: 1, textAlign: "center" },
  tabInactive: { background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "12px 16px", cursor: "pointer", flex: 1, textAlign: "center" },
};

// ── Lane Toggle ──
function LaneToggle({ value, onChange }) {
  const base = { border: "none", borderRadius: 20, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" };
  return (
    <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.15)", borderRadius: 22, padding: 3 }}>
      <button onClick={() => onChange("yes_you_can_chef")} style={{ ...base, background: value === "yes_you_can_chef" ? "#fff" : "transparent", color: value === "yes_you_can_chef" ? C.green : "rgba(255,255,255,0.8)" }}>Yes You Can Chef</button>
      <button onClick={() => onChange("built_for_this")} style={{ ...base, background: value === "built_for_this" ? C.amber : "transparent", color: value === "built_for_this" ? "#fff" : "rgba(255,255,255,0.8)" }}>Built For This</button>
    </div>
  );
}

// ── Loading Dots ──
function LoadingDots({ message }) {
  return (
    <div style={{ ...s.card, textAlign: "center", padding: 40 }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: C.green, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <div style={{ fontSize: 13, color: C.textSecondary }}>{message}</div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

// ── Copy Button ──
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return <button onClick={handleCopy} style={s.btnSmall}>{copied ? "Copied!" : "Copy"}</button>;
}

// ── Results Table ──
function ResultsTable({ results }) {
  const [expandedCell, setExpandedCell] = useState(null);
  if (!results || results.length === 0) return null;

  const toggleCell = (rowIdx, mode) => {
    const key = `${rowIdx}-${mode}`;
    setExpandedCell(expandedCell === key ? null : key);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: C.green }}>
            <th style={{ ...thStyle, minWidth: 200 }}>Prompt</th>
            {MODE_KEYS.map(m => <th key={m} style={{ ...thStyle, minWidth: 180 }}>{SUB_MODE_INFO[m].short}</th>)}
            <th style={{ ...thStyle, minWidth: 100 }}>Lane</th>
            <th style={{ ...thStyle, minWidth: 120 }}>Subreddits</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
              <td style={tdStyle}>
                <div style={{ maxHeight: 80, overflow: "hidden", fontSize: 12, color: C.textSecondary }}>{row.request_text}</div>
                {row.error && <div style={{ color: C.error, fontSize: 11, marginTop: 4 }}>{row.error}</div>}
              </td>
              {MODE_KEYS.map(mode => {
                const data = row.modes?.[mode];
                const key = `${ri}-${mode}`;
                const isExpanded = expandedCell === key;
                if (!data || !data.success) {
                  return <td key={mode} style={tdStyle}><span style={{ color: C.error, fontSize: 11 }}>{data?.error || "—"}</span></td>;
                }
                return (
                  <td key={mode} style={{ ...tdStyle, verticalAlign: "top", cursor: "pointer" }} onClick={() => toggleCell(ri, mode)}>
                    {isExpanded ? (
                      <div>
                        {data.title && <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>{data.title}</div>}
                        <div style={{ fontSize: 12, lineHeight: 1.5, whiteSpace: "pre-wrap", fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace", background: "#f9f9f7", padding: 8, borderRadius: 4, borderLeft: `3px solid ${C.green}`, maxHeight: 400, overflow: "auto" }}>{data.body}</div>
                        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: C.textSecondary }}>{data.word_count} words</span>
                          <CopyBtn text={data.title ? `${data.title}\n\n${data.body}` : data.body} />
                        </div>
                        {data.subreddit_fit_note && <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4, fontStyle: "italic" }}>{data.subreddit_fit_note}</div>}
                      </div>
                    ) : (
                      <div>
                        {data.title && <div style={{ fontWeight: 600, fontSize: 11, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{data.title}</div>}
                        <div style={{ fontSize: 11, color: C.textSecondary, maxHeight: 60, overflow: "hidden" }}>{data.body?.substring(0, 120)}…</div>
                        <div style={{ fontSize: 10, color: C.green, marginTop: 4 }}>Click to expand · {data.word_count}w</div>
                      </div>
                    )}
                  </td>
                );
              })}
              <td style={tdStyle}>
                <span style={{ ...s.badge, background: row.platform_lane === "yes_you_can_chef" ? C.green : C.amber }}>{row.platform_lane === "yes_you_can_chef" ? "YYCC" : "BFT"}</span>
              </td>
              <td style={tdStyle}><span style={{ fontSize: 11, color: C.textSecondary }}>{row.target_subreddits || "—"}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "left", padding: "10px 12px" };
const tdStyle = { padding: "12px", verticalAlign: "top", background: C.cardBg };

// ── Excel Export ──
async function exportToExcel(results) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Sheet 1: Content
  const contentRows = results.map(row => {
    const out = {
      "Prompt": row.request_text,
      "Platform Lane": row.platform_lane,
      "Target Subreddits": row.target_subreddits,
      "Keywords": row.keywords,
      "SKU": row.sku,
      "Journey Stage": row.journey_stage,
    };
    MODE_KEYS.forEach(mode => {
      const d = row.modes?.[mode];
      const info = SUB_MODE_INFO[mode];
      if (d?.success) {
        out[`${info.label} — Title`] = d.title || "";
        out[`${info.label} — Body`] = d.body || "";
        out[`${info.label} — Word Count`] = d.word_count || 0;
        out[`${info.label} — Subreddit Fit`] = d.subreddit_fit_note || "";
        out[`${info.label} — LLM Q`] = d.llm_extractable_pair?.question || "";
        out[`${info.label} — LLM A`] = d.llm_extractable_pair?.answer || "";
        out[`${info.label} — Trust Signals`] = (d.trust_signals_used || []).join("; ");
      } else {
        out[`${info.label} — Title`] = "";
        out[`${info.label} — Body`] = d?.error || "Error";
        out[`${info.label} — Word Count`] = "";
        out[`${info.label} — Subreddit Fit`] = "";
        out[`${info.label} — LLM Q`] = "";
        out[`${info.label} — LLM A`] = "";
        out[`${info.label} — Trust Signals`] = "";
      }
    });
    return out;
  });
  const ws1 = XLSX.utils.json_to_sheet(contentRows);
  ws1["!cols"] = [{ wch: 50 }, { wch: 18 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 14 },
    ...MODE_KEYS.flatMap(() => [{ wch: 40 }, { wch: 60 }, { wch: 12 }, { wch: 40 }, { wch: 40 }, { wch: 40 }, { wch: 40 }])
  ];
  XLSX.utils.book_append_sheet(wb, ws1, "Content");

  // Sheet 2: Nucleus Metadata
  const metaRows = results.map(row => ({
    "Prompt": row.request_text,
    "Platform Lane": row.nucleus?.intent?.platform_lane || row.platform_lane,
    "Audience": row.nucleus?.intent?.audience || "",
    "Activated Components": (row.nucleus?.intent?.activated_components || []).map(c => `${c.component} (${c.confidence})`).join("; "),
    "Activation Reasoning": row.nucleus?.intent?.activation_reasoning || "",
    "Lane Reasoning": row.nucleus?.intent?.lane_reasoning || "",
    "Nucleus Version": row.nucleus?.metadata?.nucleus_version || "",
    "Processed At": row.nucleus?.metadata?.processed_at || "",
    "Model": row.nucleus?.metadata?.model || "",
  }));
  const ws2 = XLSX.utils.json_to_sheet(metaRows);
  ws2["!cols"] = [{ wch: 50 }, { wch: 18 }, { wch: 30 }, { wch: 50 }, { wch: 50 }, { wch: 40 }, { wch: 14 }, { wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Nucleus Metadata");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reddit-content-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── File Upload Parser ──
async function parseUploadedExcel(file) {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
  // Skip hint row (row 2 in template) — detect by checking if request_text looks like a hint
  return raw.filter(r => r.request_text && !r.request_text.startsWith("The prompt"));
}

// ── Main Page ──
export default function Home() {
  const [mode, setMode] = useState("single"); // single | batch
  const [lane, setLane] = useState("yes_you_can_chef");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Single mode state
  const [requestText, setRequestText] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [keywords, setKeywords] = useState("");
  const [sku, setSku] = useState("");
  const [journeyStage, setJourneyStage] = useState("");

  // Batch mode state
  const [batchRows, setBatchRows] = useState(null);
  const [batchFileName, setBatchFileName] = useState("");
  const fileInputRef = useRef(null);

  // Batch defaults
  const [batchSubreddits, setBatchSubreddits] = useState("");
  const [batchKeywords, setBatchKeywords] = useState("");
  const [batchSku, setBatchSku] = useState("");
  const [batchJourneyStage, setBatchJourneyStage] = useState("");

  const handleFileUpload = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseUploadedExcel(file);
      setBatchRows(rows);
      setBatchFileName(file.name);
      setError(null);
    } catch (err) {
      setError(`Failed to parse file: ${err.message}`);
      setBatchRows(null);
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let rows;
      if (mode === "single") {
        if (!requestText.trim()) { setError("Please enter a prompt."); setLoading(false); return; }
        rows = [{ request_text: requestText, platform_lane: lane, target_subreddits: subreddits, keywords, sku, journey_stage: journeyStage }];
        setLoadingMsg("Running through Nucleus… then generating all 4 Reddit formats");
      } else {
        if (!batchRows || batchRows.length === 0) { setError("Please upload a batch file first."); setLoading(false); return; }
        rows = batchRows.map(r => ({
          request_text: r.request_text,
          platform_lane: r.platform_lane || "",
          target_subreddits: r.target_subreddits || "",
          keywords: r.keywords || "",
          sku: r.sku || "",
          journey_stage: r.journey_stage || "",
        }));
        setLoadingMsg(`Processing ${rows.length} prompts through Nucleus + generating Reddit content…`);
      }

      setProgress({ current: 0, total: rows.length });

      // Process in chunks of 3 to avoid overwhelming the API
      const chunkSize = 3;
      const allResults = [];
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: chunk,
            batch_defaults: {
              platform_lane: lane,
              target_subreddits: mode === "batch" ? batchSubreddits : subreddits,
              keywords: mode === "batch" ? batchKeywords : keywords,
              sku: mode === "batch" ? batchSku : sku,
              journey_stage: mode === "batch" ? batchJourneyStage : journeyStage,
            },
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Server returned ${res.status}`);
        }
        const data = await res.json();
        allResults.push(...data.results);
        setProgress({ current: Math.min(i + chunkSize, rows.length), total: rows.length });
        setLoadingMsg(`Processed ${Math.min(i + chunkSize, rows.length)} of ${rows.length} prompts…`);
      }

      setResults(allResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Top Bar */}
      <div style={s.topBar}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={s.topTitle}>Hamilton Beach</span>
          <span style={s.topSub}>Reddit Content</span>
        </div>
        <LaneToggle value={lane} onChange={setLane} />
      </div>

      <div style={s.container}>
        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={mode === "single" ? s.tabActive : s.tabInactive} onClick={() => setMode("single")}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Single Prompt</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Paste a brief, get all 4 formats</div>
          </div>
          <div style={mode === "batch" ? s.tabActive : s.tabInactive} onClick={() => setMode("batch")}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Batch Upload</div>
            <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Upload Excel, generate at scale</div>
          </div>
        </div>

        {/* Input Section */}
        <div style={s.card}>
          <div style={s.sectionLabel}>Input</div>

          {mode === "single" ? (
            <>
              <textarea style={s.textarea} placeholder="Paste the Reddit thread, question, or brief you want content written for…" value={requestText} onChange={e => setRequestText(e.target.value)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Target Subreddits</label>
                  <input style={s.input} placeholder="r/MealPrepSunday, r/Frugal" value={subreddits} onChange={e => setSubreddits(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Keywords / Intent Signals</label>
                  <input style={s.input} placeholder="best slow cooker small apartment" value={keywords} onChange={e => setKeywords(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>SKU / Product</label>
                  <input style={s.input} placeholder="Slow Cooker 6-Quart (optional)" value={sku} onChange={e => setSku(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Journey Stage</label>
                  <select style={s.input} value={journeyStage} onChange={e => setJourneyStage(e.target.value)}>
                    <option value="">Auto-detect</option>
                    <option value="Discovery">Discovery</option>
                    <option value="Research">Research</option>
                    <option value="Purchase">Purchase</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: "none" }} />
                <button style={s.btn} onClick={() => fileInputRef.current?.click()}>Upload Excel File</button>
                {batchFileName && <span style={{ fontSize: 12, color: C.textSecondary }}>{batchFileName} — {batchRows?.length || 0} rows</span>}
              </div>
              {batchRows && batchRows.length > 0 && (
                <div style={{ background: C.greenLight, borderRadius: 4, padding: "8px 12px", fontSize: 12, marginBottom: 12 }}>
                  <strong>{batchRows.length}</strong> prompts loaded. Preview: "{batchRows[0].request_text?.substring(0, 80)}…"
                </div>
              )}
              <div style={s.sectionLabel}>Batch Defaults (applied when row leaves field blank)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Target Subreddits</label>
                  <input style={s.input} placeholder="r/MealPrepSunday, r/Frugal" value={batchSubreddits} onChange={e => setBatchSubreddits(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Keywords / Intent Signals</label>
                  <input style={s.input} placeholder="best slow cooker small apartment" value={batchKeywords} onChange={e => setBatchKeywords(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>SKU / Product</label>
                  <input style={s.input} placeholder="Slow Cooker 6-Quart (optional)" value={batchSku} onChange={e => setBatchSku(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.textSecondary, fontWeight: 600 }}>Journey Stage</label>
                  <select style={s.input} value={batchJourneyStage} onChange={e => setBatchJourneyStage(e.target.value)}>
                    <option value="">Auto-detect</option>
                    <option value="Discovery">Discovery</option>
                    <option value="Research">Research</option>
                    <option value="Purchase">Purchase</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleGenerate}>
              {loading ? "Generating…" : mode === "single" ? "Generate All 4 Formats" : `Generate (${batchRows?.length || 0} prompts × 4 formats)`}
            </button>
            {loading && progress.total > 1 && (
              <span style={{ fontSize: 12, color: C.textSecondary }}>{progress.current} / {progress.total}</span>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ ...s.card, borderColor: C.error, background: "#FFF5F5" }}>
            <span style={{ color: C.error, fontSize: 13 }}>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingDots message={loadingMsg} />}

        {/* Results */}
        {results && results.length > 0 && (
          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={s.sectionLabel}>Results</div>
                <span style={{ fontSize: 12, color: C.textSecondary }}>{results.length} prompt{results.length > 1 ? "s" : ""} × 4 formats — click any cell to expand</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={s.btn} onClick={() => exportToExcel(results)}>Export to Excel</button>
                <button style={s.btnOutline} onClick={handleGenerate}>Regenerate</button>
              </div>
            </div>

            {/* Nucleus summary chips */}
            {results.length === 1 && results[0].nucleus?.intent?.activated_components && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 10, color: C.textSecondary, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Activated Components: </span>
                {results[0].nucleus.intent.activated_components.map((c, i) => (
                  <span key={i} style={{ ...s.chip, background: c.confidence === "high" ? C.greenLight : c.confidence === "medium" ? C.amberLight : "#f0f0f0", color: c.confidence === "high" ? C.green : c.confidence === "medium" ? C.amber : C.textSecondary }}>
                    {c.component} · {c.confidence}
                  </span>
                ))}
              </div>
            )}

            <ResultsTable results={results} />
          </div>
        )}
      </div>
    </div>
  );
}
