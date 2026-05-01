function TodaysPlan({todaysTasks, toggleStatus}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    todaysTasks.length === 0 ? (<p>No Tasks for Today</p>) : (
      <ul>
        {todaysTasks.map(task => {
          const taskDate = new Date(task.date);
          taskDate.setHours(0, 0, 0, 0);
          const isOverdue = taskDate < today;
          return (
            <li key={task._id}>

              <span
                style={{
                  textDecoration: task.status === "done" ? "line-through" : "none",
                  marginLeft: "8px"
                }}
              >
                {task.title}
                {task.status !== "done" && isOverdue && " 🔴 Overdue"}
                            {" - "}
                            {task.date}
              </span>
              
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => toggleStatus(task._id)}
                />
          </li>
        );
        })}
      </ul>
    )
  );
}

export default TodaysPlan;