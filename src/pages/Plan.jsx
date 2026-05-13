import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import styles from "./Dashboard.module.css";
import planStyles from "./Plan.module.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DIFF_COLORS = {
  easy: { bg: "rgba(34,197,94,0.18)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  medium: { bg: "rgba(250,204,21,0.18)", color: "#facc15", border: "rgba(250,204,21,0.3)" },
  hard: { bg: "rgba(239,68,68,0.18)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

function Plan() {
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // for mobile popup

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  useEffect(() => {
    fetch("http://localhost:5000/api/tasks", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []));
  }, []);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getTasksForDay = (day) =>
    tasks.filter((t) => {
      const d = new Date(t.date);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className={styles.dashboard}>
      <Sidebar />

      <main className={styles.mainContent}>

        {/* ── TOPBAR ── */}
        <div className={styles.topbar}>
          <div>
            <h1>🗓 Study Calendar</h1>
            <p>Visual overview of all scheduled tasks</p>
          </div>
          <div className={planStyles.monthBadge}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className={planStyles.statsRow}>
          <div className={planStyles.statChip}>
            <span className={planStyles.statChipIcon}>📋</span>
            <div>
              <p className={planStyles.statChipVal}>{totalTasks}</p>
              <p className={planStyles.statChipLabel}>Total Tasks</p>
            </div>
          </div>
          <div className={planStyles.statChip}>
            <span className={planStyles.statChipIcon}>✅</span>
            <div>
              <p className={planStyles.statChipVal}>{completedTasks}</p>
              <p className={planStyles.statChipLabel}>Completed</p>
            </div>
          </div>
          <div className={planStyles.statChip}>
            <span className={planStyles.statChipIcon}>⏱</span>
            <div>
              <p className={planStyles.statChipVal}>{totalHours}h</p>
              <p className={planStyles.statChipLabel}>Scheduled</p>
            </div>
          </div>
        </div>

        {/* ── CALENDAR CARD ── */}
        <section className={`${styles.allTasksSection} ${planStyles.calendarSection}`}>

          {/* Weekday headers */}
          <div className={planStyles.weekdays}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className={planStyles.weekdayLabel}>{d}</div>
            ))}
          </div>

          {/* ── DESKTOP grid (full task pills) ── */}
          <div className={planStyles.calendarGrid}>
            {days.map((day, index) => {
              const dayTasks = day ? getTasksForDay(day) : [];
              const isToday = day === today.getDate();

              return (
                <div
                  key={index}
                  className={`${planStyles.dayCard} ${isToday ? planStyles.today : ""} ${!day ? planStyles.emptyCell : ""}`}
                >
                  {day && (
                    <>
                      <div className={`${planStyles.dayHeader} ${isToday ? planStyles.todayHeader : ""}`}>
                        <span className={planStyles.dayNum}>{day}</span>
                        {isToday && <span className={planStyles.todayDot} />}
                      </div>
                      <div className={planStyles.taskContainer}>
                        {dayTasks.length === 0 ? (
                          <p className={planStyles.emptyText}>—</p>
                        ) : (
                          dayTasks.map((task) => (
                            <div
                              key={task._id}
                              className={`${planStyles.taskPill} ${planStyles[task.difficulty]}`}
                            >
                              <span className={planStyles.taskTitle}>{task.title}</span>
                              <span className={planStyles.taskDur}>{task.duration}h</span>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── MOBILE grid (compact dots, tap to open popup) ── */}
          <div className={planStyles.mobileGrid}>
            {days.map((day, index) => {
              const dayTasks = day ? getTasksForDay(day) : [];
              const isToday = day === today.getDate();
              const hasTasks = dayTasks.length > 0;
              // dominant difficulty colour for the dot
              const diffPrio = ["hard", "medium", "easy"];
              const dominant = diffPrio.find((d) => dayTasks.some((t) => t.difficulty === d));
              const dotColor = dominant ? DIFF_COLORS[dominant].color : null;

              return (
                <div
                  key={index}
                  className={`
                    ${planStyles.mobileDay}
                    ${isToday ? planStyles.mobileDayToday : ""}
                    ${!day ? planStyles.mobileDayEmpty : ""}
                    ${hasTasks ? planStyles.mobileDayHasTasks : ""}
                  `}
                  onClick={() => day && hasTasks && setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <span className={planStyles.mobileDayNum}>{day}</span>
                      {hasTasks && (
                        <span
                          className={planStyles.mobileDot}
                          style={{ background: dotColor }}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className={planStyles.legend}>
            <span className={`${planStyles.legendDot} ${planStyles.easy}`} />Easy
            <span className={`${planStyles.legendDot} ${planStyles.medium}`} />Medium
            <span className={`${planStyles.legendDot} ${planStyles.hard}`} />Hard
            <span className={planStyles.legendSep} />
            <span className={planStyles.legendToday}>■</span>Today
          </div>
        </section>
      </main>

      {/* ── MOBILE POPUP OVERLAY ── */}
      {selectedDay && (
        <div
          className={planStyles.popupOverlay}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className={planStyles.popup}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup header */}
            <div className={planStyles.popupHeader}>
              <div>
                <h3 className={planStyles.popupTitle}>
                  {MONTH_NAMES[currentMonth]} {selectedDay}
                </h3>
                <p className={planStyles.popupSub}>
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
              <button
                className={planStyles.popupClose}
                onClick={() => setSelectedDay(null)}
              >✕</button>
            </div>

            {/* Task list */}
            <div className={planStyles.popupTasks}>
              {selectedTasks.map((task) => {
                const dc = DIFF_COLORS[task.difficulty] || DIFF_COLORS.medium;
                return (
                  <div
                    key={task._id}
                    className={planStyles.popupTask}
                    style={{
                      background: dc.bg,
                      borderColor: dc.border,
                      color: dc.color,
                    }}
                  >
                    <div className={planStyles.popupTaskTop}>
                      <span className={planStyles.popupTaskTitle}>{task.title}</span>
                      <span className={planStyles.popupTaskDur}>{task.duration}h</span>
                    </div>
                    <div className={planStyles.popupTaskMeta}>
                      <span className={planStyles.popupBadge} style={{ borderColor: dc.border }}>
                        {task.difficulty}
                      </span>
                      {task.priority && (
                        <span className={planStyles.popupBadge} style={{ borderColor: dc.border }}>
                          {task.priority}
                        </span>
                      )}
                      {task.status === "done" && (
                        <span className={planStyles.popupDone}>✓ Done</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Plan;