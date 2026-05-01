function Completed({tasks}) {
  return (
    <ul>
      {tasks.map((task) => {
        if(task.status === 'done') {
          return (
          <li key={task._id}>
            {task.title}
            {" - "}
            {task.date}
          </li>
          )
        }
      }
    )}
    </ul>
  )
}

export default Completed;