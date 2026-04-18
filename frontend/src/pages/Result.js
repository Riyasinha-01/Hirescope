import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Parse AI result text ─────────────────────────────────────────── */
function parseResult(text) {
  const sections = { strengths: [], weaknesses: [], verdict: "", metrics: [] };

  const strengthsMatch = text.match(/Strengths:\s*([\s\S]*?)(?=Weaknesses:|Verdict:|Clarity:|$)/i);
  const weaknessesMatch = text.match(/Weaknesses:\s*([\s\S]*?)(?=Strengths:|Verdict:|Clarity:|$)/i);
  const verdictMatch = text.match(/Verdict:\s*([^\n]+)/i);

  if (strengthsMatch)
    sections.strengths = strengthsMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (weaknessesMatch)
    sections.weaknesses = weaknessesMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
  if (verdictMatch)
    sections.verdict = verdictMatch[1].trim().toUpperCase();

  const scoreLines = text.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/gm) || [];
  sections.metrics = scoreLines.map(line => {
    const m = line.match(/^(.+?):\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
    return { label: m[1].trim(), score: parseFloat(m[2]), total: parseFloat(m[3]) };
  });

  return sections;
}

/* ─── Conversation Side Panel ───────────────────────────────────────── */
function ConversationPanel({ chatId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/history/${chatId}/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`);
        return r.json();
      })
      .then(data => {
        const msgs = Array.isArray(data) ? data : (data.messages || data.history || []);
        setMessages(msgs);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [chatId]);

  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll when panel open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <>
      <div onClick={onClose} style={pS.backdrop} />
      <div className="conv-drawer" style={pS.drawer}>

        {/* Header */}
        <div style={pS.panelHeader}>
          <div>
            <p style={pS.panelTitle}>Conversation</p>
            <p style={pS.panelSub}>Chat ID: {chatId}</p>
          </div>
          <button onClick={onClose} style={pS.closeBtn}>✕</button>
        </div>

        {/* Body */}
        <div style={pS.panelBody}>
          {loading && (
            <div style={pS.center}>
              <div style={pS.spinner} />
              <p style={pS.centerText}>Loading conversation…</p>
            </div>
          )}

          {error && !loading && (
            <div style={pS.errorBox}>
              <p style={pS.errorTitle}>Failed to load</p>
              <p style={pS.errorMsg}>{error}</p>
            </div>
          )}

          {!loading && !error && messages.length === 0 && (
            <div style={pS.center}>
              <p style={pS.centerText}>No messages found.</p>
            </div>
          )}

          {!loading && !error && messages.map((msg, i) => {
            const role = (msg.role || msg.sender || "").toLowerCase();
            const isUser = role === "user";
            const content = msg.content || msg.message || msg.text || "";
            return (
              <div key={i} style={{ ...pS.msgRow, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                {!isUser && <div style={pS.avatarAI}>AI</div>}
                <div style={{
                  ...pS.bubble,
                  background: isUser ? "#111" : "#fff",
                  color: isUser ? "#fff" : "#111",
                  border: isUser ? "none" : "1.5px solid #e2e4e9",
                  borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                }}>
                  <p style={{ lineHeight: 1.55, wordBreak: "break-word" }}>{content}</p>
                  {msg.timestamp && (
                    <p style={{ ...pS.ts, color: isUser ? "rgba(255,255,255,0.45)" : "#bbb" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
                {isUser && <div style={pS.avatarUser}>U</div>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ─── Result Card ───────────────────────────────────────────────────── */
function ResultCard({ result, index }) {
  const [open, setOpen] = useState(false);   // closed by default ✓
  const [showChat, setShowChat] = useState(false);
  const parsed = parseResult(result.result);

  const isAccept =
  parsed.verdict &&
  (
    parsed.verdict.includes("SELECT") ||
    parsed.verdict.includes("ACCEPT") ||
    parsed.verdict.includes("PASS") ||
    parsed.verdict.includes("HIRE") ||
    parsed.verdict.includes("SHORTLIST")   // ✅ ADD THIS
  );

  const handleCloseChat = useCallback(() => setShowChat(false), []);

  return (
    <>
      {showChat && (
        <ConversationPanel
          chatId={result.chat || result.chat_id}
          onClose={handleCloseChat}
        />
      )}

      <div style={s.card}>
        {/* Accent bar */}
        <div style={{
          ...s.accentBar,
          background: isAccept
            ? "linear-gradient(180deg,#16a34a,#4ade80)"
            : parsed.verdict
            ? "linear-gradient(180deg,#dc2626,#f87171)"
            : "linear-gradient(180deg,#FFE234,#f5c800)",
        }} />

        <div style={s.cardInner}>
          {/* Card header */}
          <div style={s.cardHeader}>
            <div style={s.cardHeaderLeft}>
              <div style={s.sessionBadge}>#{index}</div>
              <div>
                <p style={s.cardIndex}>Session #{index}</p>
                <p style={s.cardDate}>
                  {new Date(result.date + "Z").toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="card-header-right" style={s.cardHeaderRight}>
              {parsed.verdict && (
                <div style={{
                  ...s.verdictPill,
                  background: isAccept ? "#ecfdf5" : "#fef2f2",
                  borderColor: isAccept ? "#16a34a" : "#dc2626",
                  color: isAccept ? "#065f46" : "#7f1d1d",
                }}>
                  <span style={{ ...s.verdictDot, background: isAccept ? "#16a34a" : "#dc2626" }} />
                  {parsed.verdict}
                </div>
              )}

              <div className="btn-group" style={s.btnGroup}>
                <button style={s.chatBtn} onClick={() => setShowChat(true)}>
                  💬 Conversation
                </button>
                <button style={s.viewBtn} onClick={() => setOpen(o => !o)}>
                  {open ? "Hide ↑" : "Details ↓"}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable body */}
          <div style={{
            ...s.expandWrap,
            maxHeight: open ? "2000px" : "0px",
            opacity: open ? 1 : 0,
          }}>
            <div style={s.divider} />
            <div style={s.cardBody}>

              {parsed.metrics.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Score Breakdown</p>
                  <div style={s.metricsGrid}>
                    {parsed.metrics.map((m, i) => {
                      const pct = (m.score / m.total) * 100;
                      const barColor = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
                      return (
                        <div key={i} style={s.metricBox}>
                          <p style={s.metricLabel}>{m.label}</p>
                          <p style={s.metricScore}>
                            {m.score}<span style={s.metricTotal}> / {m.total}</span>
                          </p>
                          <div style={s.barBg}>
                            <div style={{ ...s.barFill, width: `${pct}%`, background: barColor }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {parsed.strengths.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Strengths</p>
                  <div style={{ ...s.listBox, borderLeft: "3px solid #86efac", background: "#f0fdf4" }}>
                    {parsed.strengths.map((str, i) => (
                      <div key={i} style={s.listItem}>
                        <span style={s.dotGreen} />
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsed.weaknesses.length > 0 && (
                <div>
                  <p style={s.sectionLabel}>Weaknesses</p>
                  <div style={{ ...s.listBox, borderLeft: "3px solid #fca5a5", background: "#fff7f7" }}>
                    {parsed.weaknesses.map((w, i) => (
                      <div key={i} style={s.listItem}>
                        <span style={s.dotRed} />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
function Result() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/results/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; }

        .hs-logo {
          font-size: 16px; font-weight: 800; color: #111;
          display: flex; align-items: center; gap: 7px;
        }
        .hs-logo-dot { width: 8px; height: 8px; background: #111; border-radius: 50%; }

        .results-list { display: flex; flex-direction: column; gap: 16px; }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile: card header stacks */
        @media (max-width: 560px) {
          .card-header-right {
            flex-direction: column !important;
            align-items: flex-start !important;
            width: 100% !important;
          }
          .btn-group {
            width: 100% !important;
          }
          .btn-group button { flex: 1 !important; justify-content: center !important; }
        }

        /* Mobile: drawer becomes bottom sheet */
        @media (max-width: 600px) {
          .conv-drawer {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 88vh !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -8px 40px rgba(0,0,0,0.18) !important;
          }
        }
      `}</style>

      <div style={s.page}>
        <div style={s.header}>
          <div className="hs-logo">
            <span className="hs-logo-dot" />
            Hirescope
          </div>
          <button style={s.backBtn} onClick={() => navigate("/interview")}>← Back</button>
        </div>

        <div style={s.body}>
          <h1 style={s.title}>Interview Results</h1>
          <p style={s.subtitle}>{results.length} session{results.length !== 1 && "s"} completed</p>

          {results.length === 0 ? (
            <div style={s.emptyState}>
              <h3>No results yet</h3>
              <p>Complete an interview to see your analysis</p>
            </div>
          ) : (
            <div className="results-list">
              {[...results].reverse().map((r, i) => (
                <ResultCard key={i} result={r} index={results.length - i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Card Styles ───────────────────────────────────────────────────── */
const s = {
  page: { minHeight: "100vh", background: "#f6f7fb", fontFamily: "Inter, sans-serif" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 20px", height: 56, background: "#FFE234",
  },
  backBtn: {
    background: "#111", color: "#fff", border: "none",
    padding: "8px 14px", borderRadius: 8, cursor: "pointer",
    fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
  },
  body: { maxWidth: 780, margin: "0 auto", padding: "30px 20px" },
  title: { fontSize: 26, fontWeight: 800, marginBottom: 6, color: "#111" },
  subtitle: { color: "#666", marginBottom: 20, fontSize: 14 },

  card: {
    background: "#fff", borderRadius: 16,
    border: "1.5px solid #e2e4e9",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    display: "flex", overflow: "hidden",
  },
  accentBar: { width: 5, flexShrink: 0 },
  cardInner: { flex: 1, minWidth: 0 },

  cardHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", background: "#fff7cc",
    borderBottom: "1px solid #eee", gap: 10, flexWrap: "wrap",
  },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
  cardHeaderRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },

  sessionBadge: {
    width: 36, height: 36, borderRadius: 10,
    background: "#FFE234", border: "1.5px solid #e5c800",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 12, color: "#111", flexShrink: 0,
  },
  cardIndex: { fontWeight: 700, fontSize: 14, color: "#111" },
  cardDate: { fontSize: 12, color: "#666", marginTop: 2 },

  verdictPill: {
    padding: "5px 10px", borderRadius: 8, border: "1px solid",
    fontWeight: 700, fontSize: 11,
    display: "inline-flex", alignItems: "center", gap: 6,
  },
  verdictDot: { width: 6, height: 6, borderRadius: "50%" },

  btnGroup: { display: "flex", gap: 6 },
  chatBtn: {
    background: "#fff", color: "#111",
    border: "1.5px solid #d0d3da",
    padding: "6px 12px", borderRadius: 8, cursor: "pointer",
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
  },
  viewBtn: {
    background: "#111", color: "#fff", border: "none",
    padding: "6px 12px", borderRadius: 8, cursor: "pointer",
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
  },

  divider: { height: "1.5px", background: "#f0f1f5" },
  expandWrap: { overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.3s ease" },
  cardBody: { padding: 16, display: "flex", flexDirection: "column", gap: 14 },

  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: "#555",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.6px",
  },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 },
  metricBox: { background: "#fafafa", padding: 14, borderRadius: 10, border: "1.5px solid #e8eaee" },
  metricLabel: { fontSize: 11, color: "#888" },
  metricScore: { fontSize: 20, fontWeight: 800, margin: "4px 0 6px" },
  metricTotal: { fontSize: 12, color: "#aaa" },
  barBg: { height: 4, background: "#eee", borderRadius: 10 },
  barFill: { height: "100%", borderRadius: 10 },

  listBox: { borderRadius: 10, padding: 10 },
  listItem: { display: "flex", gap: 8, marginBottom: 6, fontSize: 13, color: "#333", lineHeight: 1.5 },
  dotGreen: { width: 6, height: 6, background: "#16a34a", borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  dotRed: { width: 6, height: 6, background: "#dc2626", borderRadius: "50%", marginTop: 5, flexShrink: 0 },

  emptyState: {
    textAlign: "center", padding: 60, background: "#fff",
    borderRadius: 16, border: "1.5px dashed #d1d5db", color: "#666",
  },
};

/* ─── Panel Styles ──────────────────────────────────────────────────── */
const pS = {
  backdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200 },
  drawer: {
    position: "fixed", top: 0, right: 0,
    width: 420, height: "100vh",
    background: "#fff", zIndex: 201,
    display: "flex", flexDirection: "column",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.14)",
    fontFamily: "Inter, sans-serif",
  },
  panelHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "18px 20px", background: "#FFE234",
    borderBottom: "2px solid #e5c800", flexShrink: 0,
  },
  panelTitle: { fontWeight: 800, fontSize: 16, color: "#111" },
  panelSub: { fontSize: 11, color: "#555", marginTop: 3 },
  closeBtn: {
    background: "#111", color: "#fff", border: "none",
    width: 30, height: 30, borderRadius: 8, cursor: "pointer",
    fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  panelBody: {
    flex: 1, overflowY: "auto", padding: 16,
    display: "flex", flexDirection: "column", gap: 10,
  },
  center: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    flex: 1, gap: 10, padding: 40,
  },
  spinner: {
    width: 28, height: 28,
    border: "3px solid #eee", borderTop: "3px solid #111",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  },
  centerText: { color: "#888", fontSize: 13 },
  errorBox: {
    background: "#fff5f5", border: "1.5px solid #fca5a5",
    borderRadius: 10, padding: "14px 16px",
  },
  errorTitle: { fontWeight: 700, color: "#b91c1c", fontSize: 13, marginBottom: 4 },
  errorMsg: { fontSize: 12, color: "#dc2626" },

  msgRow: { display: "flex", alignItems: "flex-end", gap: 8 },
  avatarAI: {
    width: 28, height: 28, borderRadius: "50%",
    background: "#FFE234", border: "1.5px solid #e5c800",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 800, color: "#111", flexShrink: 0,
  },
  avatarUser: {
    width: 28, height: 28, borderRadius: "50%", background: "#111",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 800, color: "#fff", flexShrink: 0,
  },
  bubble: { maxWidth: "75%", padding: "10px 14px", fontSize: 13 },
  ts: { fontSize: 10, marginTop: 4 },
};

export default Result;