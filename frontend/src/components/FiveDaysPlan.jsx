import styles from "../styles/FiveDaysPlan.module.css";

function FiveDaysPlan({ setPlan, fetchPlan, plan }) {

  const sortedDays = Object.keys(plan).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2>🧠 Smart Plan</h2>
          <p>Your optimized 5-day study schedule</p>
        </div>

        <button
          className={styles.generateBtn}
          onClick={async () => {
            const generated = await fetchPlan();

            if (generated) {
              setPlan(generated);
            }
          }}
        >
          📅 Generate
        </button>
      </div>

      {/* EMPTY */}
      {sortedDays.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No plan generated yet</p>
          <span>
            Generate a smart study plan to begin
          </span>
        </div>
      ) : (
          <div className={styles.timeline}>

            {sortedDays.map((day, index) => {

              const data = plan[day];

              const totalTasks =
                data.tasks.length;

              const hardTasks =
                data.tasks.filter(
                  t => t.difficulty === "hard"
                ).length;

              const productivity =
                Math.min(
                  100,
                  Math.round(
                    (data.totalHours / 5) * 100
                  )
                );

              const d = new Date(day);

              const formatted =
                d.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  }
                );

              return (

                <div
                  key={day}
                  className={styles.timelineCard}
                >

                  {/* LEFT TIMELINE */}

                  <div className={styles.timelineLeft}>

                    <div className={styles.timelineDot} />

                    {
                      index !==
                      sortedDays.length - 1 && (
                        <div
                          className={
                            styles.timelineLine
                          }
                        />
                      )
                    }

                  </div>

                  {/* RIGHT CONTENT */}

                  <div className={styles.timelineContent}>

                    {/* TOP */}

                    <div className={styles.cardTop}>

                      <div>

                        <h3>
                          {formatted}
                        </h3>

                        <p>
                          {totalTasks} Tasks Planned
                        </p>

                      </div>

                      <div
                        className={
                          styles.productivity
                        }
                      >
                        {productivity}%
                      </div>

                    </div>

                    {/* STATS */}

                    <div className={styles.statsRow}>

                      <div className={styles.stat}>
                        ⏱ {data.totalHours}h
                      </div>

                      <div className={styles.stat}>
                        📚 {totalTasks} Tasks
                      </div>

                      <div className={styles.stat}>
                        🔥 {hardTasks} Hard
                      </div>

                    </div>

                    {/* TASKS */}

                    <div className={styles.taskList}>

                      {data.tasks.map((t, i) => (

                        <div
                          key={i}
                          className={styles.taskItem}
                        >

                          <div>

                            <h4>
                              {t.title}
                            </h4>

                            <span
                              className={`${styles.badge}
                    ${styles[t.difficulty]}`}
                            >
                              {t.difficulty}
                            </span>

                          </div>

                          <div
                            className={
                              styles.taskRight
                            }
                          >

                            <span>
                              {t.duration}h
                            </span>

                          </div>

                        </div>
                      ))}

                    </div>

                  </div>

                </div>
              );
            })}
          </div>
      )}

    </div>
  );
}

export default FiveDaysPlan;