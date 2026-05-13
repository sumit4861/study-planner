import styles from "./TodaysPlan.module.css";

function TodaysPlan({
  todaysTasks = [],
  toggleStatus
}) {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className={styles.container}>

      {/* EMPTY STATE */}
      {todaysTasks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No tasks for today 🎉</p>
          <span>
            You're all caught up
          </span>
        </div>
      ) : (
        <div className={styles.taskList}>

          {todaysTasks.map((task) => {

            const taskDate = new Date(task.date);

            taskDate.setHours(0, 0, 0, 0);

            let label = "";
            let statusClass = "";

            if (taskDate < today) {
              label = "🔴 Overdue";
              statusClass = styles.overdue;
            }

            else if (
              taskDate.getTime() === today.getTime()
            ) {
              label = "🟡 Today";
              statusClass = styles.today;
            }

            else {
              label = "🟢 Upcoming";
              statusClass = styles.upcoming;
            }

            return (
              <div
                key={task._id}
                className={styles.taskCard}
              >

                {/* LEFT */}
                <div className={styles.left}>

                  <input
                    type="checkbox"
                    checked={task.status === "done"}
                    onChange={() =>
                      toggleStatus(task._id)
                    }
                    className={styles.checkbox}
                  />

                  <div className={styles.taskInfo}>

                    <h3
                      className={`${styles.taskTitle} ${task.status === "done"
                          ? styles.completed
                          : ""
                        }`}
                    >
                      {task.title}
                    </h3>

                    <div className={styles.meta}>

                      <span className={styles.duration}>
                        ⏱ {task.duration}h
                      </span>

                      <span
                        className={`${styles.badge} ${styles[task.difficulty]
                          }`}
                      >
                        {task.difficulty}
                      </span>

                    </div>

                  </div>

                </div>

                {/* RIGHT */}
                <div className={styles.right}>

                  <span
                    className={`${styles.status} ${statusClass}`}
                  >
                    {label}
                  </span>

                  <p className={styles.date}>
                    {taskDate.toLocaleDateString()}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default TodaysPlan;