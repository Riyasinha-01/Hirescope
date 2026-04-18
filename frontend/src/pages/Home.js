import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ─── Responsive CSS injected as a <style> tag so we can use media queries ── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .hs-root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* NAV */
  .hs-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 52px;
    background: #FFDD00;
    border-bottom: 3px solid #111;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .hs-logo {
    font-size: 18px; font-weight: 700; color: #111;
    display: flex; align-items: center; gap: 7px; letter-spacing: -0.3px;
  }
  .hs-logo-dot {
    width: 8px; height: 8px; background: #111; border-radius: 50%; flex-shrink: 0;
  }
  .hs-nav-links {
    display: flex; gap: 20px; font-size: 13px; font-weight: 600; color: #111;
  }
  @media (max-width: 420px) {
    .hs-nav-links { display: none; }
    .hs-hamburger { display: flex !important; }
  }
  .hs-hamburger {
    display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px;
  }
  .hs-hamburger span { width: 22px; height: 2.5px; background: #111; display: block; }

  /* MAIN */
  .hs-main {
    flex: 1;
    display: flex; flex-direction: column; align-items: center;
    padding: 36px 20px 32px;
    position: relative; overflow: hidden;
  }
  @media (min-width: 700px) {
    .hs-main {
      justify-content: center;
      min-height: calc(100vh - 52px);
      padding: 40px;
    }
  }

  /* BG SHAPES */
  .hs-shape1 {
    position: absolute; right: -40px; top: -20px;
    width: 140px; height: 140px; background: #FFDD00;
    border: 3px solid #111; transform: rotate(14deg);
    opacity: 0.3; pointer-events: none;
  }
  .hs-shape2 {
    position: absolute; left: -50px; bottom: -30px;
    width: 130px; height: 130px; background: #111;
    transform: rotate(-10deg); opacity: 0.05; pointer-events: none;
  }

  /* BADGE */
  .hs-badge {
    background: #111; color: #FFDD00;
    font-size: 10px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase;
    padding: 5px 12px; border: 2px solid #111;
    margin-bottom: 16px; position: relative; z-index: 1;
  }

  /* HEADLINE */
  .hs-h1 {
    font-size: clamp(28px, 8vw, 52px);
    font-weight: 700; color: #111; line-height: 1.3;
    letter-spacing: -1.5px; text-align: center;
    margin: 0 0 12px; position: relative; z-index: 1;
  }
  @media (min-width: 700px) {
    .hs-h1 { white-space: nowrap; font-size: clamp(32px, 4vw, 52px); }
  }
  .hs-h1-highlight {
    background: #FFDD00; border: 3px solid #111;
    padding: 2px 8px; display: inline; white-space: nowrap;
  }
  .hs-mobile-br { display: inline; }
  @media (min-width: 700px) { .hs-mobile-br { display: none; } }

  /* TAGLINE */
  .hs-tagline {
    font-size: clamp(13px, 3.5vw, 15px); color: #555; font-weight: 500;
    text-align: center; margin: 0 0 24px;
    position: relative; z-index: 1; max-width: 340px; line-height: 1.5;
  }
  @media (min-width: 700px) {
  .hs-tagline {
    white-space: normal;   /* allow wrapping */
    max-width: 500px;      /* optional */
  }
}

  /* CARD */
  .hs-card {
    background: #fff; border: 3px solid #111; box-shadow: 5px 5px 0 #111;
    padding: 22px 24px; width: 100%; max-width: 380px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    position: relative; z-index: 1; margin-bottom: 28px;
  }
  .hs-card-title { font-size: 14px; font-weight: 700; color: #111; margin: 0; }
  .hs-divider { width: 100%; height: 1px; background: #ddd; }

  /* GOOGLE BTN */
  .hs-google-btn {
    display: flex; align-items: center; gap: 10px;
    background: #FFDD00; color: #111;
    font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700;
    border: 3px solid #111; box-shadow: 4px 4px 0 #111;
    padding: 12px 20px; cursor: pointer; width: 100%; justify-content: center;
    letter-spacing: 0.1px; transition: transform 0.08s, box-shadow 0.08s;
    -webkit-tap-highlight-color: transparent;
  }
  .hs-google-btn:hover { transform: translate(-2px,-2px); box-shadow: 6px 6px 0 #111; }
  .hs-google-btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #111; }
  .hs-google-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

  .hs-terms {
    font-size: 11px; color: #999;
    text-align: center; line-height: 1.5; max-width: 260px; margin: 0;
  }

  /* FEATURES */
  .hs-features {
    width: 100%; max-width: 780px; border: 3px solid #111;
    display: flex; flex-direction: column;
    position: relative; z-index: 1;
  }
  @media (min-width: 600px) {
    .hs-features { flex-direction: row; }
    .hs-feat { border-bottom: none !important; border-right: 3px solid #111; }
    .hs-feat:last-child { border-right: none; }
  }
  .hs-feat {
    flex: 1; padding: 16px 18px;
    border-bottom: 3px solid #111;
    display: flex; flex-direction: column; gap: 6px;
  }
  .hs-feat:last-child { border-bottom: none; }
  .hs-feat-top { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .hs-feat-icon {
    width: 32px; height: 32px; background: #FFDD00; border: 2px solid #111;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hs-feat-title { font-size: 13px; font-weight: 700; color: #111; margin: 0; }
  .hs-feat-desc  { font-size: 12px; color: #555; line-height: 1.5; margin: 0; }
`;

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: globalCSS }} />;
}

function Home() {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/google/", {
        id_token: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("user", JSON.stringify(res.data.user));  // ✅ ADD THIS

      navigate("/interview");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const features = [
    {
      title: "Smart Analysis",
      desc: "AI scores each candidate on skill and problem-solving ability.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      title: "Live AI Interview",
      desc: "Dynamic questions that adapt to every candidate's responses.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Hire Smarter",
      desc: "Detailed reports and rankings so you pick the right fit, fast.",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <InjectStyles />
      <div className="hs-root">

        {/* ── Navbar ── */}
        <nav className="hs-nav">
          <div className="hs-logo">
            <span className="hs-logo-dot" />
            Hirescope
          </div>
          <div className="hs-nav-links">
            <span>How it works</span>
          </div>
          <div className="hs-hamburger" aria-label="Open menu">
            <span /><span /><span />
          </div>
        </nav>

        {/* ── Hero ── */}
        <main className="hs-main">
          <div className="hs-shape1" />
          <div className="hs-shape2" />

          <div className="hs-badge">AI-Powered Hiring</div>

          <h1 className="hs-h1">
            Analyze. Interview.
            <br className="hs-mobile-br" />
            {" "}<span className="hs-h1-highlight">Hire Smarter.</span>
          </h1>

          <p className="hs-tagline">
            Stop guessing. Start hiring with confidence using AI-driven screening.
          </p>

          {/* ── Sign-in card ── */}
          <div className="hs-card">
            <p className="hs-card-title">Get started in seconds</p>
            <div className="hs-divider" />

            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login Failed")}
              render={({ onClick }) => (
                <button className="hs-google-btn" onClick={onClick}>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Start Interview with Google
                </button>
              )}
            />

            <p className="hs-terms">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* ── Feature strip ── */}
          <div className="hs-features">
            {features.map((f) => (
              <div className="hs-feat" key={f.title}>
                <div className="hs-feat-top">
                  <div className="hs-feat-icon">{f.icon}</div>
                  <p className="hs-feat-title">{f.title}</p>
                </div>
                <p className="hs-feat-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </main>

      </div>
    </>
  );
}

export default Home;