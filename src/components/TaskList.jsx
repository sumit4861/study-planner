import styles from "./TaskList.module.css";

function TaskList({ tasks, deleteTask }) {
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks added yet 📭</p>
      </div>
    );
  }

  return (
    <div className={styles.taskList}>
      {tasks.map((task) => (
        <div key={task._id} className={styles.taskCard}>

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
                className={`${styles.badge} ${styles[task.difficulty]
                  }`}
              >
                {task.difficulty}
              </span>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.taskRight}>
            <p className={styles.date}>
              {new Date(task.date).toLocaleDateString()}
            </p>

            <button
              onClick={() => deleteTask(task._id)}
              className={styles.deleteBtn}
            >
              ✕
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}

export default TaskList;