import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import dashStyles from "./Dashboard.module.css";
import planStyles from "./Plan.module.css";

const API = import.meta.env.VITE_API_URL;

function Plan() {
  const [tasks, setTasks] = useState([]);
  const [plan, setPlan] = useState({});
  const [aiPlan, setAIPlan] = useState({});
  const [loadingAI, setLoadingAI] = useState(false);

  /* FETCH TASKS */
  useEffect(() => {
    fetch(`${API}/api/tasks`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  /* GENERATE NORMAL PLAN */
  const fetchPlan = async () => {
    try {
      const res = await fetch(`${API}/api/plan`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      console.log(err);
    }
  };

  /* GENERATE AI PLAN */
  const generateAIPlan = async () => {
    if (Object.keys(plan).length === 0) {
      alert("Generate Smart Plan first");
      return;
    }
    setLoadingAI(true);
    try {
      const res = await fetch(`${API}/api/generate-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tasks: plan }),
      });
      const data = await res.json();
      setAIPlan(data);
    } catch (err) {
      console.log(err);
    }
    setLoadingAI(false);
  };

  /* ADD AI TASK */
  const addAITask = async (task, date) => {
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...task,
          date,
          source: "ai",
          status: "pending",
        }),
      });
      const data = await res.json();
      setTasks((prev) => [...prev, data]);
    } catch (err) {
      console.log(err);
    }
  };

  /* STATS */
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    /* Use Dashboard's grid shell — sidebar + content column */
    <div className={dashStyles.dashboard}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* PAGE WRAPPER — takes the remaining grid column(s) */}
      <div className={planStyles.pageWrapper}>

        {/* ── TOP BAR ── */}
        <div className={planStyles.topBar}>

          <div className={planStyles.topBarLeft}>
            <div className={planStyles.topBarTitle}>
              <h1>🧠 Smart Planning</h1>
              <p>AI optimized study management</p>
            </div>

            <div className={planStyles.statsRow}>
              <div className={planStyles.statPill}>
                <span className={planStyles.statNum}>{totalTasks}</span>
                <span className={planStyles.statLabel}>Total</span>
              </div>
              <div className={planStyles.statPill}>
                <span className={planStyles.statNum} style={{ color: "#4ade80" }}>
                  {completedTasks}
                </span>
                <span className={planStyles.statLabel}>Done</span>
              </div>
              <div className={planStyles.statPill}>
                <span className={planStyles.statNum} style={{ color: "#f59e0b" }}>
                  {pendingTasks}
                </span>
                <span className={planStyles.statLabel}>Pending</span>
              </div>
            </div>
          </div>

          <div className={planStyles.topActions}>
            <button className={dashStyles.aiBtn} onClick={fetchPlan}>
              📅 Generate Plan
            </button>
            <button className={dashStyles.aiBtn} onClick={generateAIPlan}>
              {loadingAI ? "Generating..." : "🤖 AI Optimize"}
            </button>
          </div>
        </div>

        {/* ── TWO-PANEL SPLIT ── */}
        <div className={planStyles.splitPane}>

          {/* LEFT — Smart Plan */}
          <section className={planStyles.pane}>
            <div className={dashStyles.sectionHeader}>
              <h2>📅 Smart Study Plan</h2>
            </div>
            <div className={planStyles.paneScroll}>
              {Object.keys(plan).length === 0 ? (
                <p className={planStyles.empty}>
                  No plan generated yet. Click "Generate Plan" to start.
                </p>
              ) : (
                Object.entries(plan).map(([day, data]) => (
                  <div key={day} className={planStyles.dayCard}>
                    <div className={planStyles.dayTop}>
                      <h3>{day}</h3>
                      <span>{data.totalHours}h</span>
                    </div>
                    <div className={planStyles.taskList}>
                      {(data?.tasks || []).map((task) => (
                        <div key={task._id} className={planStyles.taskItem}>
                          <div>
                            <h4>{task.title}</h4>
                            <p>⏱ {task.duration}h</p>
                          </div>
                          <span className={planStyles[task.difficulty]}>
                            {task.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* DIVIDER */}
          <div className={planStyles.divider} />

          {/* RIGHT — AI Plan */}
          <section className={planStyles.pane}>
            <div className={dashStyles.sectionHeader}>
              <h2>🤖 AI Generated Plan</h2>
            </div>
            <div className={planStyles.paneScroll}>
              {Object.keys(aiPlan).length === 0 ? (
                <p className={planStyles.empty}>
                  No AI plan yet. Generate a Smart Plan first, then click "AI Optimize".
                </p>
              ) : (
                Object.entries(aiPlan).map(([day, dayTasks]) => (
                  <div key={day} className={planStyles.dayCard}>
                    <div className={planStyles.dayTop}>
                      <h3>{day}</h3>
                      <span>AI Optimized</span>
                    </div>
                    <div className={planStyles.taskList}>
                      {Array.isArray(dayTasks) ? (
                        dayTasks.map((task, index) => (
                          <div
                            key={index}
                            className={`${planStyles.taskItem} ${planStyles.aiTask}`}
                          >
                            <div>
                              <h4>{task.title}</h4>
                              <p>⏱ {task.duration}h</p>
                            </div>
                            <button
                              className={planStyles.addBtn}
                              onClick={() => addAITask(task, day)}
                            >
                              + Add
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className={planStyles.empty}>No AI tasks for this day.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default Plan;