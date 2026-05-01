import { useState, useEffect } from "react";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import TodaysPlan from "../components/TodaysPlan";
import Completed from "../components/Completed";
import Pending from "../components/Pending";


function Dashboard({setIsLoggedIn}) {
  const [task, setTask] = useState("");
  const [date, setDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiTasks, setAiTasks]  = useState([]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.log("Auth error:", data);
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }

      } catch (err) {
        console.log(err);
        setTasks([]);
      }
    };

    getTasks();
  }, []);

  const addTask = async () => {
    if (!task.trim() || !date) return;
    const newTask = { title: task, date: date };

    const res = await fetch("http://localhost:5000/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(newTask)
    });

    const data = await res.json();
    setTasks(prev => [...prev, data]);
    setTask("");
    setDate("");
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setTasks(prev => prev.filter(task => task._id !== id));
    } catch(err) {
      console.log(err);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      const updatedTask = await res.json();
      setTasks(prev => prev.map(task =>
        task._id === id ? updatedTask : task
      ));
    } catch(err) {
      console.log(err);
    }
  };

  const generatePlan = async () => {
    setLoadingAI(true);

    try{
      const res = await fetch("http://localhost:5000/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subjects: ["DSA", "DBMS"],
          hours: 3
        })
      });
      
      const data = await res.json();
      setAiTasks(data);
    } catch(err)  {
      console.log("AI error: ", err);
    }
    setLoadingAI(false);
  }

  const addAiTask = async (task) => {
    const exists = tasks.some(
      t => t.title === task.title && t.date === task.date
    );
    if (exists) {
      setAiTasks(prev => prev.filter(t => !(t.title === task.title && t.date === task.date)));
      return;
    }

    try{
      const res = await fetch("http://localhost:5000/api/tasks" ,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({...task, source: "ai"})
      });

      const data = await res.json();
      setTasks(prev =>[...prev, data]);

      setAiTasks(prev =>
        prev.filter(t => !(t.title === task.title && t.date === task.date))
      );
    }catch(err) {
      console.log(err);
    }
  }
    
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "done").length;

  const sortTasks = () => {
    const sorted = [...tasks].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    setTasks(sorted);
    console.log("sorting");
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daily_limit = 3;
  const todaysTasks = [...tasks]
    // .filter(t => t.status !== 'done')
    .sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      da.setHours(0, 0, 0, 0);
      db.setHours(0, 0, 0, 0);
      if(da < today && db >= today) return -1;
      if(db < today && da >= today) return 1;
      return da - db;
    })
    .slice(0, daily_limit);

  return (
    <div>
      <button onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }}>Logout</button>

      <TaskInput task={task} date={date} setDate={setDate} setTask={setTask} addTask={addTask} />
      
      <h1>All Tasks</h1>
      <TaskList tasks={tasks} deleteTask={deleteTask} />

      <h1>Today's Study Plan</h1>
      <TodaysPlan todaysTasks={todaysTasks} toggleStatus={toggleStatus} />

      <button onClick={generatePlan}>
        <h2>{loadingAI ? "Generating..." : "Generate AI Plan"}</h2>
      </button>

      {aiTasks.map(t => (
        <div key={t.title}>
          {t.title} - {t.date}
          <button onClick={() => addAiTask(t)}>Add</button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;