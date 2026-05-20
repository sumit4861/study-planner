import { useEffect, useState } from "react";

import styles from "./Dashboard.module.css";
import Sidebar   from "../components/Sidebar";
import TaskList from "../components/TaskList";
import planStyles from "./Tasks.module.css";

import TaskInput from "../components/TaskInput";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DIFF_COLORS = {
  easy: { bg: "rgba(34,197,94,0.18)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  medium: { bg: "rgba(250,204,21,0.18)", color: "#facc15", border: "rgba(250,204,21,0.3)" },
  hard: { bg: "rgba(239,68,68,0.18)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};


function Tasks() {

  const [tasks, setTasks] = useState([]);

  useEffect(() => {

    fetch(
      "http://localhost:5000/api/tasks",
      {
        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then(res => res.json())
      .then(data => setTasks(data));

  }, []);

  const deleteTask = async (id) => {

    try {

      await fetch(
        `http://localhost:5000/api/tasks/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setTasks(prev =>
        prev.filter(t => t._id !== id)
      );

    } catch (err) {

      console.log(err);
    }
  };

  const [selectedDay, setSelectedDay] = useState(null);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();


  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const getTasksForDay = (day) =>
    tasks.filter((t) => {
      const d = new Date(t.date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

  const totalTasks = tasks.length;
  const totalHours = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const diffPrio = ["hard", "medium", "easy"];

  const sortedTasks = [...tasks]
    .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const pa = new Date(a.date);
      const pb = new Date(b.date);
      return pb - pa;
    })

  const completed = [...tasks]
    .filter(t => t.status === 'done')
    .sort((a, b) => {
      const pa = new Date(a.date);
      const pb = new Date(b.date);
      return pb - pa;
    })
  return (
    <div className={styles.dashboard}>

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
      
        {/* ── TOPBAR ── */}
        <div className={styles.topbar}>
          <div>
            <h1>🗓 Study Calendar</h1>
            <p>Click any day to view its tasks</p>
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
              <p className={planStyles.statChipVal}>{completed.length}</p>
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

          {/* Compact grid — always shown */}
          <div className={planStyles.calendarGrid}>
            {days.map((day, index) => {
              const dayTasks = day ? getTasksForDay(day) : [];
              const isToday = day === today.getDate();
              const hasTasks = dayTasks.length > 0;
              const isSelected = day === selectedDay;

              const dominant = diffPrio.find((d) =>
                dayTasks.some((t) => t.difficulty === d)
              );
              const dotColor = dominant ? DIFF_COLORS[dominant].color : null;

              return (
                <div
                  key={index}
                  className={`
                    ${planStyles.dayCell}
                    ${isToday ? planStyles.dayCellToday : ""}
                    ${!day ? planStyles.dayCellEmpty : ""}
                    ${hasTasks ? planStyles.dayCellHasTasks : ""}
                    ${isSelected ? planStyles.dayCellSelected : ""}
                  `}
                  onClick={() => day && setSelectedDay(isSelected ? null : day)}
                >
                  {day && (
                    <>
                      <span className={planStyles.dayNum}>{day}</span>
                      {hasTasks && (
                        <span
                          className={planStyles.dot}
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

      {/* ── POPUP ── */}
      {selectedDay && (
        <div
          className={planStyles.popupOverlay}
          onClick={() => setSelectedDay(null)}
        >
          <div
            className={planStyles.popup}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={planStyles.popupHeader}>
              <div>
                <h3 className={planStyles.popupTitle}>
                  {MONTH_NAMES[currentMonth]} {selectedDay}
                </h3>
                <p className={planStyles.popupSub}>
                  {selectedTasks.length === 0
                    ? "No tasks scheduled"
                    : `${selectedTasks.length} task${selectedTasks.length !== 1 ? "s" : ""} scheduled`}
                </p>
              </div>
              <button
                className={planStyles.popupClose}
                onClick={() => setSelectedDay(null)}
              >✕</button>
            </div>

            <div className={planStyles.popupTasks}>
              {selectedTasks.length === 0 ? (
                <p className={planStyles.popupEmpty}>
                  Nothing planned for this day. 🎉
                </p>
              ) : (
                selectedTasks.map((task) => {
                  const dc = DIFF_COLORS[task.difficulty] || DIFF_COLORS.medium;
                  return (
                    <div
                      key={task._id}
                      className={planStyles.popupTask}
                      style={{ background: dc.bg, borderColor: dc.border, color: dc.color }}
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
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* RIGHT PANEL */}

      <aside className={styles.aiPanel}>

          <section className={styles.allTasksSection}>

            <div className={styles.sectionHeader}>

              <h2>📋 All Tasks</h2>

              <span className={styles.taskCount}>
                {sortedTasks.length} Total
              </span>

            </div>
            <div className={styles.alltasks}>
              <TaskList
                tasks={sortedTasks}
                deleteTask={deleteTask}
                />
            </div>

          </section>

        <section className={styles.allTasksSection}>

          <div className={styles.sectionHeader}>

            <h2>📋 Completed Tasks</h2>

            <span className={styles.taskCount}>
              {completed.length} Total
            </span>

          </div>
          <div className={styles.alltasks}>
            <TaskList
              tasks={completed}
              deleteTask={deleteTask}
            />
          </div>

        </section>

      </aside>

    </div>
  );
}

export default Tasks;