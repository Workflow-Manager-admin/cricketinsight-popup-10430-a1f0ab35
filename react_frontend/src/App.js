import React, { useState, useEffect } from "react";
import "./App.css";

// Helper: Simple Spinner component
function Spinner() {
  return (
    <div className="spinner">
      <svg className="spinner-svg" viewBox="0 0 50 50">
        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
      </svg>
    </div>
  );
}

// PUBLIC_INTERFACE
function MatchDetailsForm({ onSubmit, loading }) {
  /** Form to input live match details from user.
   *  onSubmit({teamA, teamB, overs, scoreA, wicketsA, oversA, scoreB, wicketsB, oversB})
   */
  const [form, setForm] = useState({
    teamA: "",
    teamB: "",
    overs: 20,
    scoreA: "",
    wicketsA: "",
    oversA: "",
    scoreB: "",
    wicketsB: "",
    oversB: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }
  return (
    <form className="match-input-form" onSubmit={handleSubmit}>
      <h2>Enter Live Match Details</h2>
      <div className="input-row">
        <label>Team A</label>
        <input name="teamA" required autoComplete="off" value={form.teamA} onChange={handleChange} />
        <label>Team B</label>
        <input name="teamB" required autoComplete="off" value={form.teamB} onChange={handleChange} />
      </div>
      <div className="input-row">
        <label>Format</label>
        <select name="overs" value={form.overs} onChange={handleChange}>
          <option value={20}>T20</option>
          <option value={50}>ODI</option>
        </select>
      </div>
      <div className="input-row">
        <div>
          <label>{form.teamA || "Team A"} Score</label>
          <input
            name="scoreA"
            type="number"
            placeholder="Runs"
            value={form.scoreA}
            onChange={handleChange}
            min="0"
            required
          />
          <input
            name="wicketsA"
            type="number"
            placeholder="Wkts"
            value={form.wicketsA}
            onChange={handleChange}
            min="0"
            max="10"
            style={{ width: "70px", marginLeft: 4 }}
            required
          />
          <input
            name="oversA"
            type="number"
            placeholder="Overs"
            value={form.oversA}
            onChange={handleChange}
            min="0"
            max={form.overs}
            step="0.1"
            style={{ width: "80px", marginLeft: 4 }}
            required
          />
        </div>
        <div>
          <label>{form.teamB || "Team B"} Score</label>
          <input name="scoreB" type="number" placeholder="Runs" value={form.scoreB} onChange={handleChange} min="0" />
          <input
            name="wicketsB"
            type="number"
            placeholder="Wkts"
            value={form.wicketsB}
            onChange={handleChange}
            min="0"
            max="10"
            style={{ width: "70px", marginLeft: 4 }}
          />
          <input
            name="oversB"
            type="number"
            placeholder="Overs"
            value={form.oversB}
            onChange={handleChange}
            min="0"
            max={form.overs}
            step="0.1"
            style={{ width: "80px", marginLeft: 4 }}
          />
        </div>
      </div>
      <button className="primary-btn" type="submit" disabled={loading}>
        {loading ? <Spinner /> : "Analyze Match"}
      </button>
    </form>
  );
}

// PUBLIC_INTERFACE
function ScenarioCard({ scenario, loading }) {
  /** Displays generated match scenario **/
  return (
    <div className="scenario-card">
      <h3>Current Scenario</h3>
      {loading ? <Spinner /> : <p className="scenario-text">{scenario}</p>}
    </div>
  );
}

// PUBLIC_INTERFACE
function QuestionControls({ question, loading, onAnswer, userAnswer }) {
  // Yes/No selection for generated question. Calls onAnswer("yes"|"no")
  return (
    <div className="question-block">
      <h4>Prediction Question</h4>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <p className="question-text">{question}</p>
          <div className="yesno-btns">
            <button
              className={`yes-btn ${userAnswer === "yes" ? "selected" : ""}`}
              onClick={() => onAnswer("yes")}
              disabled={!!userAnswer}
            >
              Yes
            </button>
            <button
              className={`no-btn ${userAnswer === "no" ? "selected" : ""}`}
              onClick={() => onAnswer("no")}
              disabled={!!userAnswer}
            >
              No
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function AnalysisCard({ analysis, loading }) {
  return (
    <div className="analysis-block">
      <h4>AI Analysis</h4>
      {loading ? <Spinner /> : <p className="analysis-text">{analysis}</p>}
    </div>
  );
}

// PUBLIC_INTERFACE
function PlayerCharts({ playerData, loading }) {
  /* Shows a player's mock stats as bar and line charts: batsmen (runs/strike-rate), bowlers (wickets/economy)
    playerData: [{name:'Player', runs:..., sr:..., wickets:..., economy:...}, ...]
   */
  if (loading) return <Spinner />;
  if (!playerData || playerData.length === 0) return null;

  const batsmen = playerData
    .filter((p) => p.runs !== undefined)
    .slice(0, 4); // Top 4 batsmen
  const bowlers = playerData
    .filter((p) => p.wickets !== undefined)
    .slice(0, 3);

  // Helper: inline Bar chart SVG
  function BarChart({ data, field, color, label }) {
    const max = Math.max(...data.map((d) => d[field]), 1);
    return (
      <div className="chart-section">
        <h5>{label}</h5>
        <div className="bar-chart">
          {data.map((d) => (
            <div className="bar-row" key={d.name}>
              <div className="bar-label">{d.name}</div>
              <div
                className="bar"
                style={{
                  background: color,
                  width: `${((d[field] / max) * 90) | 0}%`,
                }}
                title={d[field]}
              >
                <span className="bar-value">{d[field]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // Helper: inline Mini line chart SVG for run progression across overs, for demo only
  function LineChart({ players, field, color, label }) {
    return (
      <div className="chart-section">
        <h5>{label}</h5>
        <svg height={80} width="100%" viewBox="0 0 220 60">
          {players.map((p, i) => (
            <polyline
              key={p.name}
              points={p[field]
                .map((v, idx) => `${idx * 30 + 10},${60 - (v / 100) * 55}`)
                .join(" ")}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.7 - i * 0.12}
            />
          ))}
        </svg>
        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {players.map((p) => (
            <span key={p.name} style={{ marginRight: 14 }}>
              <span style={{ color }}>{p.name}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="player-charts">
      <BarChart data={batsmen} field="runs" color="var(--accent-color)" label="Top Batsmen Runs" />
      <BarChart data={batsmen} field="sr" color="var(--primary-color)" label="Strike Rate" />
      <BarChart data={bowlers} field="wickets" color="orange" label="Top Wickets" />
      {batsmen.length > 0 && batsmen[0].runProgression && (
        <LineChart players={batsmen} field="runProgression" color="#61dafb" label="Run Progression" />
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function PopupContainer({ children }) {
  // Wrapper that positions the popup over the live video feed
  return (
    <div className="popup-modal-bg">
      <div className="popup-modal">{children}</div>
    </div>
  );
}

// --- API helpers ---
// PUBLIC_INTERFACE
async function fetchBackend(endpoint, body) {
  // POST for scenario, question, analysis; GET for player/mock data
  const urlBase =
    process.env.REACT_APP_API_BASE || "https://vscode-internal-5352-beta.beta01.cloud.kavia.ai:3001";
  let resp;
  if (endpoint === "/api/mock_player_data") {
    resp = await fetch(urlBase + endpoint, { credentials: "omit", mode: "cors" });
    return resp.json();
  } else {
    resp = await fetch(urlBase + endpoint, {
      method: "POST",
      credentials: "omit",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error("Backend error");
    return resp.json();
  }
}

// --- Main App ---
// PUBLIC_INTERFACE
function App() {
  // UI state
  const [theme, setTheme] = useState("dark");
  const [step, setStep] = useState(0); // 0: input, 1: scenario, 2: question, 3: analysis, 4: charts
  const [form, setForm] = useState(null);

  // Backend data
  const [scenario, setScenario] = useState("");
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [playerData, setPlayerData] = useState([]);

  // Loading states
  const [loadingScenario, setLoadingScenario] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Apply dark theme to root element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  // PUBLIC_INTERFACE
  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  // Handle input and scenario generation
  async function handleFormSubmit(details) {
    setForm(details);
    setLoadingScenario(true);
    setScenario("");
    setQuestion("");
    setAnalysis("");
    setUserAnswer(null);
    try {
      const result = await fetchBackend("/api/generate_scenario", details);
      setScenario(result.scenario || "Unable to fetch scenario.");
      setStep(1);
      setLoadingScenario(false);

      // Trigger question fetch immediately after scenario
      setLoadingQuestion(true);
      const qResult = await fetchBackend("/api/generate_question", { scenario: result.scenario });
      setQuestion(qResult.question || "No question generated.");
      setLoadingQuestion(false);
      setStep(2);
    } catch (e) {
      setScenario("Backend error: " + e.message);
      setLoadingScenario(false);
      setLoadingQuestion(false);
      setStep(1);
    }
  }
  async function handleAnswer(ans) {
    setUserAnswer(ans);
    setAnalysis("");
    setLoadingAnalysis(true);
    try {
      const result = await fetchBackend("/api/analyze_prediction", {
        scenario,
        question,
        answer: ans,
      });
      setAnalysis(result.analysis || "No analysis generated.");
      setLoadingAnalysis(false);
      setStep(3);
      // Also load player data for final step
      setLoadingPlayers(true);
      const mockPlayers = await fetchBackend("/api/mock_player_data");
      setPlayerData(formatPlayerData(mockPlayers));
      setLoadingPlayers(false);
      setStep(4);
    } catch (e) {
      setAnalysis("Backend error: " + e.message);
      setLoadingAnalysis(false);
    }
  }
  // Demo: add run progression per batsman as small array for lines
  function formatPlayerData(data) {
    return Array.isArray(data)
      ? data.map((p, i) => ({
          ...p,
          runProgression: p.runs
            ? Array.from({ length: 7 }, (_, idx) =>
                Math.round((p.runs * (idx + 1)) / 7 + Math.random() * 5)
              )
            : undefined,
        }))
      : [];
  }

  // --- RENDER UI (flow by step) ---
  return (
    <PopupContainer>
      <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
      </button>
      <h1 className="app-title">CricketInsight Analysis</h1>
      <p className="subtitle">Live scenario & AI-powered match insight</p>
      <div className="step-block">
        {step === 0 && (
          <MatchDetailsForm loading={loadingScenario} onSubmit={handleFormSubmit} />
        )}

        {step >= 1 && (
          <ScenarioCard scenario={scenario} loading={loadingScenario} />
        )}
        {step >= 2 && (
          <QuestionControls
            question={question}
            loading={loadingQuestion}
            onAnswer={handleAnswer}
            userAnswer={userAnswer}
          />
        )}
        {step >= 3 && (
          <AnalysisCard analysis={analysis} loading={loadingAnalysis} />
        )}
        {step === 4 && (
          <PlayerCharts playerData={playerData} loading={loadingPlayers} />
        )}
      </div>
      <footer>
        <div className="footer-note">
          <span role="img" aria-label="cricket">
            🏏
          </span>{" "}
          CricketInsight Popup &mdash; Powered by OpenAI
        </div>
      </footer>
    </PopupContainer>
  );
}

export default App;
