// backend/utils/scheduler.js

const generateSmartPlan = (tasks) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const plan = {};
  const daily_hours = 5;
  const max_hard_tasks = 1;

  // create 5-day window
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const key = d.toISOString().split("T")[0];

    plan[key] = {
      tasks: [],
      totalHours: 0,
      hardCount: 0
    };
  }

  const dayKeys = Object.keys(plan).sort();

  const diffWeight = { easy: 1, medium: 2, hard: 3 };
  const priorityWeight = { low: 1, medium: 2, high: 3 };

  const getScore = (task) => {
    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (taskDate - today) / (1000 * 60 * 60 * 24)
    );

    let score = 0;
    score += Math.max(0, 10 - diffDays);
    score += (priorityWeight[task.priority] || 2) * 10;
    score += (diffWeight[task.difficulty] || 2) * 5;

    return score;
  };

  const isValid = (task, day) => {
    const deadline = new Date(task.date);
    deadline.setHours(0, 0, 0, 0);
    return day <= deadline;
  };

  const sortedTasks = [...tasks]
    .filter(t => t.status !== "done")
    .sort((a, b) => getScore(b) - getScore(a)); // descending

  for (let task of sortedTasks) {
    const duration = Number(task.duration) || 1;
    const isHard = task.difficulty === "hard";

    let assigned = false;

    for (let dayKey of dayKeys) {
      const day = new Date(dayKey);

      if (!isValid(task, day)) continue;
      if (plan[dayKey].totalHours + duration > daily_hours) continue;
      if (isHard && plan[dayKey].hardCount >= max_hard_tasks) continue;

      plan[dayKey].tasks.push(task);
      plan[dayKey].totalHours += duration;

      if (isHard) plan[dayKey].hardCount++;

      assigned = true;
      break;
    }

    // fallback
    if (!assigned) {
      const lastDay = dayKeys[dayKeys.length - 1];
      plan[lastDay].tasks.push(task);
    }
  }

  return plan;
};

module.exports = generateSmartPlan;