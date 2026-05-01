function TaskList({tasks, deleteTask}) {
  return (
    <ul>
      {tasks.map((value) => (
        <li key = {value._id}>
          <p>{value.title} - {value.date}</p>
          <button onClick = {()=>deleteTask(value._id)} className="cut">X</button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;