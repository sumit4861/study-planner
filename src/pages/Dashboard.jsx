import { useState, useEffect } from "react";
import TaskInput from "../components/TaskInput";
import TodaysPlan from "../components/TodaysPlan";
import FiveDaysPlan from "../components/FiveDaysPlan";
import AISuggestions from "../components/AISuggestions";
import Sidebar from "../components/Sidebar";
import styles from "./Dashboard.module.css";
const API = import.meta.env.VITE_API_URL;
  import.meta.env.VITE_API_URL;
function Dashboard({ setIsLoggedIn }) {
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState(1);
  const [priority, setPriority] = useState("");
  const [plan, setPlan] = useState({});
  const [suggestions, setSuggestions] = useState();

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await fetch(`${API}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.log("Auth error:", data);
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }

      } catch (err) {
        console.log(err);
        setTasks([]);
      }
    };

    getTasks();
  }, []);

  const addTask = async () => {
    if (!task.trim() || !date || !difficulty || !duration) return;
    const newTask = {
      title: task,
      date: date,
      difficulty: difficulty,
      duration: duration,
      priority: priority
    };

    const res = await fetch(`${API}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(newTask)
    });

    const data = await res.json();
    setTasks(prev => [...prev, data]);
    setTask("");
    setDate("");
    setDifficulty("");
    setDuration(1);
    setPriority("medium");
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const updatedTask = await res.json();
      setTasks(prev => prev.map(task =>
        task._id === id ? updatedTask : task
      ));
    } catch (err) {
      console.log(err);
    }
  };

  const normalizePlan = (rawPlan) => {
    const newPlan = {};

    for (let day in rawPlan) {
      const tasksArr = Array.isArray(rawPlan[day]) ? rawPlan[day] : [];

      const totalHours = tasksArr.reduce(
        (sum, t) => sum + (Number(t.duration) || 1),
        0
      );

      newPlan[day] = {
        tasks: tasksArr,
        totalHours
      };
    }

    return newPlan;
  };

  const generateAIPlan = async () => {
    setLoadingAI(true);

    try {
      const res = await fetch(`${API}/api/generate-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ plan })
      });

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        console.log("AI failed → fallback");
        await fetchPlan();
        return;
      }

      const normalized = normalizePlan(data);
      setPlan(normalized);

    } catch (err) {
      console.log("AI error:", err);

      // 🔥 fallback on error
      await fetchPlan();
    } finally {
      setLoadingAI(false);
    }
  };

  const getAISuggestions = async () => {
    setLoadingAI(true);

    const res = await fetch(`${API}/api/plan/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token"),
      },
      body: JSON.stringify({ plan }),
    });

    const data = await res.json();
    setSuggestions(data.suggestions);
    setLoadingAI(false);
  };

  const addAiTask = async (task) => {
    const exists = tasks.some(
      t => t.title === task.title && t.date === task.date
    );
    if (exists) {
      setAiTasks(prev => prev.filter(t => !(t.title === task.title && t.date === task.date)));
      return;
    }

    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ ...task, source: "ai" })
      });

      const data = await res.json();
      setTasks(prev => [...prev, data]);

      setAiTasks(prev =>
        prev.filter(t => !(t.title === task.title && t.date === task.date))
      );
    } catch (err) {
      console.log(err);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffWeight = {
    easy: 1,
    medium: 2,
    hard: 3
  };
  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1
  };

  const isValid = (task, day) => {
    const deadline = new Date(task.date);
    deadline.setHours(0, 0, 0, 0);

    return day <= deadline;
  }
  const getScore = (task) => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    let score = 0;
    const diffDays = Math.max(0, (taskDate - today) / (1000 * 60 * 60 * 24));
    score += Math.max(0, (10 - diffDays));
    score += (priorityWeight[task.priority] || 2) * 10;
    score += (diffWeight[task.difficulty] || 2) * 5;
    return -score; //high score -> high priority
  }

  const daily_hours = 5;
  const max_hard_tasks = 1;

  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pa = getScore(a);
      const pb = getScore(b);
      return pa - pb;
    })

  const todaysTasks = [];
  let totalTime = 0;
  let hardCount = 0;

  for (let task of sortedTasks) {
    const duration = Number(task.duration) || 1;
    const isHard = task.difficulty === 'hard';

    if (!isValid(task, today)) continue;
    if (totalTime + duration > daily_hours) continue;
    if (isHard && hardCount >= max_hard_tasks) continue;

    todaysTasks.push(task);
    totalTime += duration;

    if (isHard) hardCount++;
  }

  const fetchPlan = async () => {
    const res = await fetch(`${API}/api/plan`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    setPlan(data);
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };
  const Card = ({ title, children }) => (
    <div style={{
      background: "rgba(30, 41, 59, 0.6)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      padding: "16px",
      marginBottom: "16px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.4)"
    }}>
      <h3 style={{ marginBottom: "10px", opacity: 0.9 }}>{title}</h3>
      {children}
    </div>
  );

  const hour = new Date().getHours();

  let greeting = "";

  if (hour < 12) {
    greeting = "Good Morning ☀️";
  }
  else if (hour < 17) {
    greeting = "Good Afternoon 🌤";
  }
  else {
    greeting = "Good Evening 🌙";
  }

  return (

    <div className={styles.dashboard}>
      {/* SIDEBAR */}

      <Sidebar />
      {/* MAIN CONTENT */}

      <main className={styles.mainContent}>

        {/* TOPBAR */}

        <div className={styles.topbar}>

          <div>
            <h1>
              {greeting}
            </h1>

            <p>
              Stay productive today.
            </p>
          </div>

        </div>

        {/* TODAY SECTION */}

        <section className={styles.todaySection}>

          <div className={styles.sectionHeader}>
            <h2>📌 Today's Tasks</h2>

            <span className={styles.taskCount}>
              {todaysTasks.length} Tasks
            </span>
          </div>

          <TodaysPlan
            todaysTasks={todaysTasks}
            toggleStatus={toggleStatus}
          />

        </section>

        {/* TASK INPUT */}

        <section className={styles.taskInputSection}>

          <TaskInput
            task={task}
            date={date}
            difficulty={difficulty}
            duration={duration}
            priority={priority}
            setTask={setTask}
            setDate={setDate}
            setDifficulty={setDifficulty}
            setDuration={setDuration}
            setPriority={setPriority}
            addTask={addTask}
          />  

        </section>

      </main>

      {/* RIGHT AI PANEL */}
      <aside className={styles.aiPanel}>

        {/* PROGRESS */}

        <div className={styles.aiCard}>

          <div className={styles.progressTop}>
            <h3>📊 Progress</h3>

            <span className={styles.progressText}>
              {progress}%
            </span>
          </div>

          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          <div className={styles.progressStats}>

            <div className={styles.statBox}>
              <h4>{tasks.length}</h4>
              <p>Total</p>
            </div>

            <div className={styles.statBox}>
              <h4>{completedTasks}</h4>
              <p>Done</p>
            </div>

            <div className={styles.statBox}>
              <h4>{tasks.length - completedTasks}</h4>
              <p>Left</p>
            </div>

          </div>

        </div>

        {/* PLAN */}

        <div className={styles.aiCard}>

          <FiveDaysPlan
            setPlan={setPlan}
            fetchPlan={fetchPlan}
            plan={plan}
          />

        </div>

      </aside>

    </div>
  );
}

export default Dashboard;