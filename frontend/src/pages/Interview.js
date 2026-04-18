import { useState, useEffect } from "react";
import VideoPanel from "../components/VideoPanel";
import ChatPanel from "../components/ChatPanel";
import MicButton from "../components/MicButton";
import { sendMessage, getProfile } from "../services/api";

const speak = (text) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  const voice =
    voices.find(v => v.name.includes("Google UK English Female")) ||
    voices.find(v => v.name.includes("Microsoft Zira")) ||
    voices.find(v => v.name.includes("Female")) ||
    voices.find(v => v.lang === "en-US") ||
    voices[0];
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.rate = 0.95;
  utterance.pitch = 1;
  synth.cancel();
  synth.speak(utterance);
};

const EVAL_STEPS = [
  "Evaluating your responses...",
  "Analyzing communication clarity...",
  "Scoring performance metrics...",
  "Generating your report...",
];

function EvaluatingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % EVAL_STEPS.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .eval-overlay {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .eval-logo {
          font-size: 20px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .eval-logo-dot {
          width: 10px; height: 10px;
          background: #FFE234;
          border: 1.5px solid #111;
          border-radius: 50%;
        }
        .eval-card {
          background: #fffef5;
          border: 1.5px solid #111;
          border-radius: 16px;
          padding: 36px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          min-width: 300px;
          box-shadow: 4px 4px 0px #111;
        }
        .eval-spinner {
          width: 48px; height: 48px;
          border: 3px solid #eee;
          border-top: 3px solid #FFE234;
          border-right: 3px solid #111;
          border-radius: 50%;
          animation: evalSpin 0.9s linear infinite;
        }
        .eval-step {
          font-size: 15px;
          font-weight: 600;
          color: #111;
          text-align: center;
          min-height: 24px;
          animation: evalFade 0.4s ease;
        }
        .eval-dots {
          display: flex;
          gap: 8px;
        }
        .eval-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #111;
          animation: evalBounce 1s infinite ease-in-out;
        }
        .eval-subtext {
          font-size: 12px;
          color: #888;
          font-weight: 500;
        }
        @keyframes evalSpin { to { transform: rotate(360deg); } }
        @keyframes evalFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes evalBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div className="eval-overlay">
        <div className="eval-logo">
          <span className="eval-logo-dot" />
          Hirescope
        </div>
        <div className="eval-card">
          <div className="eval-spinner" />
          <div className="eval-step" key={stepIndex}>
            {EVAL_STEPS[stepIndex]}
          </div>
          <div className="eval-dots">
            <span className="eval-dot" style={{ animationDelay: "0s" }} />
            <span className="eval-dot" style={{ animationDelay: "0.2s" }} />
            <span className="eval-dot" style={{ animationDelay: "0.4s" }} />
          </div>
          <div className="eval-subtext">Please wait, this takes a few seconds</div>
        </div>
      </div>
    </>
  );
}

function Interview() {
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [started, setStarted] = useState(false);

  const handleLogout = () => {
  window.speechSynthesis.cancel();   // stop any audio
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/");
};

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) navigate("/");
  else { fetchUser(); }

  window.speechSynthesis.onvoiceschanged = () => {};

  return () => {
    window.speechSynthesis.cancel();
  };
}, [navigate]);   // ✅ ADD THIS

  const startInterview = async () => {
    setStarted(true);
    try {
      setIsThinking(true);
      const res = await sendMessage("Hi", null);
      setChatId(res.chat_id);
      setMessages([{ role: "assistant", content: res.reply }]);
      speak(res.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const fetchUser = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (text) => {
  try {
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setIsThinking(true);

    const res = await sendMessage(text, chatId);
    if (!chatId) setChatId(res.chat_id);

    // 🔥 CHECK FIRST (before showing or speaking)
    if (res.reply.includes("Clarity:")) {

      let history = JSON.parse(localStorage.getItem("results")) || [];
      history.push({ result: res.reply, date: new Date().toLocaleString() });
      localStorage.setItem("results", JSON.stringify(history));

      setIsThinking(false);
      setIsEvaluating(true);

      const delay = Math.floor(Math.random() * 2000) + 3000;

      setTimeout(() => {
        window.speechSynthesis.cancel();   // 🔥 ADD THIS
        navigate("/result");
      }, delay);

      return; // ❗ STOP — no chat, no speech
    }

    // ✅ Normal flow (only for questions)
    setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    speak(res.reply);
    setIsThinking(false);

  } catch (err) {
    console.error(err);
    setIsThinking(false);
  }
};

  return (
    <>
      {isEvaluating && <EvaluatingOverlay />}

      <style>{`
        * { box-sizing: border-box; }
        .interview-page {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: #fff;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }
        .interview-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          height: 56px;
          background: #FFE234;
          border-bottom: 1.5px solid #111;
          flex-shrink: 0;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .logo { font-size: 16px; font-weight: 800; color: #111; letter-spacing: -0.3px; }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1.5px solid #111;
          border-radius: 20px;
          padding: 4px 12px 4px 5px;
        }
        .user-avatar {
          width: 26px; height: 26px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid #111;
        }
        .user-name { font-size: 13px; font-weight: 700; color: #111; }
        .user-email { font-size: 11px; color: #555; display: none; }
        .results-btn {
          background: #111; color: #FFE234;
          border: 1.5px solid #111; border-radius: 8px;
          padding: 7px 14px; font-size: 12px;
          font-weight: 700; cursor: pointer;
          white-space: nowrap;
        }
        .hs-logo {
          font-size: 16px;
          font-weight: 800;
          color: #111;
          display: flex;
          align-items: center;
          gap: 7px;
          letter-spacing: -0.3px;
        }
        .hs-logo-dot {
          width: 8px;
          height: 8px;
          background: #111;
          border-radius: 50%;
        }
        .interview-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .left-panel {
          width: 34%;
          padding: 18px;
          border-right: 1.5px solid #111;
          display: flex;
          flex-direction: column;
          gap: 14px;
          overflow: hidden;
          background: #fffef5;
          flex-shrink: 0;
        }
        .profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1.5px solid #111;
          border-radius: 10px;
          padding: 12px 14px;
        }
        .profile-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid #111;
          flex-shrink: 0;
        }
        .profile-name { font-size: 14px; font-weight: 700; color: #111; margin: 0 0 2px; }
        .profile-email { font-size: 11px; color: #666; margin: 0; }
        .right-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .thinking-badge {
          display: flex; align-items: center; gap: 5px;
          background: #FFE234; border: 1.5px solid #111;
          border-radius: 8px; padding: 10px 14px;
        }
        .think-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #111; display: inline-block;
          animation: thinkBounce .8s infinite ease-in-out;
        }
        .think-label { font-size: 12px; font-weight: 600; color: #111; margin-left: 4px; }

        @media (max-width: 640px) {
          .interview-header { padding: 0 14px; height: 52px; }
          .logo { font-size: 15px; }
          .user-name { display: none; }
          .results-btn { padding: 6px 11px; font-size: 11px; }
          .interview-body {
            flex-direction: column;
            overflow: hidden;
            height: calc(100vh - 52px);
          }
          .left-panel {
            width: 100%;
            border-right: none;
            border-bottom: 1.5px solid #111;
            padding: 14px;
            gap: 12px;
            overflow: hidden;
            flex-shrink: 0;
          }
          .left-panel { display: flex; flex-direction: column; }
          .profile-section { order: 1; }
          .video-section { order: 2; }
          .mic-section { order: 3; }
          .right-panel {
            flex: 1;
            min-height: 0;
            overflow: hidden;
          }
          .profile-card { padding: 10px 12px; }
          .profile-avatar { width: 38px; height: 38px; }
          .profile-name { font-size: 13px; }
        }

        @keyframes thinkBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      <div className="interview-page">
        <div className="interview-header">
          <div className="header-left">
            <div className="hs-logo">
              <span className="hs-logo-dot" />
              Hirescope
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              className="results-btn"
              onClick={() => {
                window.speechSynthesis.cancel();
                navigate("/result");
              }}
            >
              View Results →
            </button>

            <button
              style={{
                background: "#fff",
                color: "#111",
                border: "1.5px solid #111",
                borderRadius: 8,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="interview-body">
          <div className="left-panel">
            {user && (
              <div className="profile-card profile-section">
                <img src={user.image} alt="profile" className="profile-avatar" />
                <div>
                  <p className="profile-name">{user.name}</p>
                  <p className="profile-email">{user.email}</p>
                </div>
              </div>
            )}
            <div className="video-section">
              <VideoPanel />
            </div>
            <div className="mic-section">
              <MicButton onSend={handleSend} disabled={!started} />
            </div>
            {isThinking && (
              <div className="thinking-badge">
                <span className="think-dot" style={{ animationDelay: "0s" }} />
                <span className="think-dot" style={{ animationDelay: ".2s" }} />
                <span className="think-dot" style={{ animationDelay: ".4s" }} />
                <span className="think-label">AI is thinking</span>
              </div>
            )}
          </div>

          <div className="right-panel">
            <ChatPanel
              messages={messages}
              isThinking={isThinking}
              started={started}
              onStart={startInterview}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Interview;