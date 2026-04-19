import { useEffect, useRef } from "react";

function ChatPanel({ messages, isThinking, started, onStart }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  return (
    <div style={styles.outer}>
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <div style={styles.statusDot} />
          <span style={styles.topLabel}>Live Conversation</span>
        </div>
        <span style={styles.msgCount}>{messages.length} messages</span>
      </div>

      <div style={styles.feed}>
        {!started && (
        <div style={styles.startWrap}>
          <button style={styles.startBtn} onClick={onStart}>
            Start Interview
          </button>
        </div>
      )}

        {messages.map((msg, i) => (
          <div key={i} style={{ ...styles.row, justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && <div style={styles.aiDot}>AI</div>}
            <div style={msg.role === "user" ? styles.userBubble : styles.aiBubble}>
              <span style={msg.role === "user" ? styles.userLabel : styles.aiLabel}>
                {msg.role === "user" ? "You" : "Interviewer"}
              </span>
              <p style={styles.text}>{msg.content}</p>
            </div>
            {msg.role === "user" && <div style={styles.meDot}>Me</div>}
          </div>
        ))}

        {isThinking && (
          <div style={{ ...styles.row, justifyContent: "flex-start" }}>
            <div style={styles.aiDot}>AI</div>
            <div style={styles.aiBubble}>
              <span style={styles.aiLabel}>Interviewer</span>
              <div style={styles.dots}>
                <span style={{ ...styles.dot, animationDelay: "0s" }} />
                <span style={{ ...styles.dot, animationDelay: ".18s" }} />
                <span style={{ ...styles.dot, animationDelay: ".36s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <style>{`
        @keyframes bounce{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(-5px);opacity:1}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </div>
  );
}

const styles = {
  outer: {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,   // IMPORTANT
  background: "#fff"
},
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "13px 18px", borderBottom: "1.5px solid #111", background: "#fff",
  },
  topLeft: { display: "flex", alignItems: "center", gap: 7 },
  statusDot: {
    width: 9, height: 9, borderRadius: "50%",
    background: "#22c55e", border: "1.5px solid #111",
    animation: "pulse 2s infinite",
  },
  topLabel: { fontSize: 13, fontWeight: 700, color: "#111" },
  msgCount: {
    fontSize: 11, fontWeight: 600, color: "#555",
    background: "#f5f5f5", border: "1.5px solid #111",
    borderRadius: 20, padding: "3px 10px",
  },
  feed: {
    flex: 1, overflowY: "auto", padding: "16px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  empty: { margin: "auto", textAlign: "center", padding: 40 },
  emptyText: { fontSize: 14, color: "#bbb", margin: 0 },
  row: {
    display: "flex", alignItems: "flex-end", gap: 7,
    animation: "fadeUp .28s ease forwards",
  },
  aiDot: {
    width: 30, height: 30, minWidth: 30, borderRadius: "50%",
    background: "#FFC107", border: "1.5px solid #111",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700, color: "#111",
  },
  meDot: {
    width: 30, height: 30, minWidth: 30, borderRadius: "50%",
    background: "#111", border: "1.5px solid #111",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 700, color: "#FFC107",
  },
  aiBubble: {
    maxWidth: "65%", background: "#fff",
    border: "1.5px solid #111",
    borderRadius: "4px 14px 14px 14px", padding: "11px 15px",
  },
  userBubble: {
    maxWidth: "65%", background: "#FFC107",
    border: "1.5px solid #111",
    borderRadius: "14px 4px 14px 14px", padding: "11px 15px",
  },
  aiLabel: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#444", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: ".5px",
  },
  userLabel: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#555", marginBottom: 5,
    textTransform: "uppercase", letterSpacing: ".5px", textAlign: "right",
  },
  text: { margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "#111" },
  dots: { display: "flex", gap: 5, alignItems: "center", height: 18 },
  dot: {
    width: 7, height: 7, borderRadius: "50%", background: "#111",
    display: "inline-block", animation: "bounce .9s infinite ease-in-out",
  },
  startWrap: {
  margin: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

startBtn: {
  background: "#FFC107",
  color: "#111",
  border: "2px solid #111",
  padding: "14px 24px",
  fontSize: 14,
  fontWeight: 700,
  borderRadius: 10,
  cursor: "pointer",
  boxShadow: "3px 3px 0 #111",
},
};

export default ChatPanel;