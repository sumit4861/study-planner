function TaskInput({task, date, setDate, setTask, addTask}) {
  return (
    <div>
      <input
       value = {task}
       onChange = {(e) => setTask(e.target.value)}
       placeholder = "Enter Task"
      />
      <input type = "date" 
        value = {date}
        onChange = {(d) => setDate(d.target.value)}
        placeholder="Deadline" 
      />
      <button onClick = {addTask} >Add</button>
    </div>
  );
}
export default TaskInput;