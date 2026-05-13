import styles from "./FiveDaysPlan.module.css";

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
        <div className={styles.planList}>
          {sortedDays.map((day) => {

            const data = plan[day];

            const d = new Date(day);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);

            const diff =
              (d - today) /
              (1000 * 60 * 60 * 24);

            let label = day;

            if (diff === 0) label = "📍 Today";
            else if (diff === 1) label = "👉 Tomorrow";
            else label = `📅 Day ${diff + 1}`;

            return (
              <div
                key={day}
                className={styles.dayCard}
              >

                {/* TOP */}
                <div className={styles.dayTop}>
                  <h3>{label}</h3>

                  <span className={styles.hours}>
                    ⏱ {data.totalHours} hrs
                  </span>
                </div>

                {/* TASKS */}
                {data.tasks.length === 0 ? (
                  <p className={styles.noTasks}>
                    No tasks scheduled
                  </p>
                ) : (
                  <div className={styles.taskList}>
                    {data.tasks.map((t, i) => (
                      <div
                        key={i}
                        className={styles.taskItem}
                      >

                        <div>
                          <p className={styles.taskTitle}>
                            {t.title}
                          </p>

                          <span
                            className={`${styles.badge} ${styles[t.difficulty]
                              }`}
                          >
                            {t.difficulty}
                          </span>
                        </div>

                        <span className={styles.duration}>
                          {t.duration}h
                        </span>

                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default FiveDaysPlan;