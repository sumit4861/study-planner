function Pending({ tasks }) {
  return (
    <ul>
      {tasks.map((task) => {
        if (task.status === 'pending') {
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

export default Pending;