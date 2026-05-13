import styles from "./TaskInput.module.css";

function TaskInput({
  task,
  date,
  difficulty,
  duration,
  priority,
  setTask,
  setDate,
  setDifficulty,
  setDuration,
  setPriority,
  addTask
}) {

  return (
    <div className={styles.taskInputCard}>

      <div className={styles.header}>
        <h2>Add New Task</h2>
        <p>Plan smarter. Stay consistent.</p>
      </div>

      <div className={styles.formGrid}>

        {/* TASK NAME */}
        <div className={styles.inputGroup}>
          <label>Task Name</label>

          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter task..."
            className={styles.input}
          />
        </div>

        {/* DEADLINE */}
        <div className={styles.inputGroup}>
          <label>Deadline</label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* DIFFICULTY */}
        <div className={styles.inputGroup}>
          <label>Difficulty</label>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>
              Select Difficulty
            </option>

            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* PRIORITY */}
        <div className={styles.inputGroup}>
          <label>Priority</label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className={styles.select}
          >
            <option value="" disabled>
              Choose Priority
            </option>

            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* DURATION */}
        <div className={styles.inputGroup}>
          <label>Duration (hours)</label>

          <input
            type="number"
            min="1"
            max="12"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            placeholder="Hours"
            className={styles.input}
          />
        </div>

      </div>

      {/* BUTTON */}
      <button
        type="button"
        onClick={addTask}
        className={styles.addBtn}
      >
        ➕ Add Task
      </button>

    </div>
  );
}

export default TaskInput;