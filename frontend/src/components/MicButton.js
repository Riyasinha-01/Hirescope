import { useState, useRef } from "react";

function MicButton({ onSend, disabled }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported"); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => { setListening(true); setTranscript(""); };
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      onSend(text);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
  };

  return (
    <div style={styles.wrap}>
      <button
        disabled={disabled}
        style={{
          ...styles.btn,
          background: disabled ? "#ccc" : (listening ? "#FFC107" : "#111"),
          color: disabled ? "#666" : (listening ? "#111" : "#fff"),
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={!disabled ? startListening : undefined}
      >
        <span>🎤</span>
        <span>{listening ? "Listening..." : "Speak Now"}</span>
        {listening && (
          <span style={styles.bars}>
            <span style={{ ...styles.bar, animationDelay: "0s" }} />
            <span style={{ ...styles.bar, animationDelay: ".15s" }} />
            <span style={{ ...styles.bar, animationDelay: ".3s" }} />
          </span>
        )}
      </button>

      {transcript && (
        <div style={styles.transcriptBox}>
          <span style={styles.transcriptLabel}>You said</span>
          <p style={styles.transcriptText}>{transcript}</p>
        </div>
      )}

      <style>{`@keyframes barPulse{0%,100%{height:5px}50%{height:16px}}`}</style>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 10 },
  btn: {
    width: "100%", padding: "14px 18px",
    fontSize: 14, fontWeight: 700,
    border: "1.5px solid #111", borderRadius: 10,
    cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    transition: "background .2s, color .2s",
  },
  bars: { display: "flex", alignItems: "center", gap: 3, marginLeft: 4 },
  bar: {
    display: "inline-block", width: 3, height: 10,
    background: "#111", borderRadius: 2,
    animation: "barPulse .6s infinite ease-in-out",
  },
  transcriptBox: {
    background: "#fff", border: "1.5px solid #111",
    borderRadius: 8, padding: "10px 14px",
  },
  transcriptLabel: {
    fontSize: 10, fontWeight: 700, color: "#aaa",
    display: "block", marginBottom: 4,
    textTransform: "uppercase", letterSpacing: ".5px",
  },
  transcriptText: { margin: 0, fontSize: 13, color: "#111", lineHeight: 1.5, fontStyle: "italic" },
};

export default MicButton;