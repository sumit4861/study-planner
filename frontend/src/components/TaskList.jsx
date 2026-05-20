import styles from "../styles/TaskList.module.css";

function TaskList({ tasks, deleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks added yet 📭</p>
      </div>
    );
  }
  const groupedTasks = tasks.reduce((acc, task) => {

    const date =
      new Date(task.date)
        .toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(task);

    return acc;

  }, {});

  return (
    <div className={styles.taskList}>

      {Object.entries(groupedTasks)
        .map(([date, dateTasks]) => (

          <div
            key={date}
            className={styles.dateGroup}
          >

            {/* DATE HEADER */}

            <div className={styles.dateHeader}>
              📅 {date}
            </div>

            {/* TASKS */}

            <div className={styles.groupTasks}>

              {dateTasks.map((task) => (

                <div
                  key={task._id}
                  className={styles.taskCard}
                >

                  {/* LEFT */}

                  <div className={styles.taskInfo}>

                    <h3 className={styles.taskTitle}>
                      {task.title}
                    </h3>

                    <div className={styles.meta}>

                      <span className={styles.duration}>
                        ⏱ {task.duration}h
                      </span>

                      <span
                        className={`${styles.badge}
                        ${styles[task.difficulty]}`}
                      >
                        {task.difficulty}
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className={styles.taskRight}>

                    <button
                      onClick={() =>
                        deleteTask(task._id)
                      }

                      className={styles.deleteBtn}
                    >
                      ✕
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        ))}
    </div>
  );
}

export default TaskList;