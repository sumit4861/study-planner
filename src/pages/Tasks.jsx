import { useEffect, useState } from "react";

import styles from "./Dashboard.module.css";
import Sidebar   from "../components/Sidebar";
import TaskList from "../components/TaskList";

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

  return (
    <div className={styles.dashboard}>

      {/* SIDEBAR */}

      <Sidebar />

      {/* MAIN CONTENT */}

      <div className={styles.mainContent}>

        <section className={styles.allTasksSection}>

          <div className={styles.sectionHeader}>

            <h2>📋 All Tasks</h2>

            <span className={styles.taskCount}>
              {tasks.length} Total
            </span>

          </div>

          <TaskList
            tasks={tasks}
            deleteTask={deleteTask}
          />

        </section>

      </div>
    </div>
  );
}

export default Tasks;