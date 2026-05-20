require("dotenv").config();


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

const bcrypt = require("bcryptjs");  // Hashed the password
const jwt = require("jsonwebtoken"); // generate the token
const OpenAI = require("openai");

const User = require("./models/User");
const Task = require("./models/Task");
const auth = require("./middleware/auth");
const generateSmartPlan = require("./utils/scheduler");
// middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:4173",
    "https://study-planner-1-qnul.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());


// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

mongoose.connect(process.env.MONGO_URL) 
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// Signup route

app.post("/api/auth/signup", async (req, res) => {
  try{
    const {name, email, password} = req.body;
    const existed = await User.findOne({email});
    if(existed) {
      return res.status(400).json({msg: "User already exists"});
    }
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({name, email, password: hashed});
    await user.save();

    res.json({msg: "User registered successfully"});

  } catch(err) {
    res.status(500).json({error: err.message});
  }
})

// Login route
app.post("/api/auth/login", async(req, res) => {
  try{
    const { email, password} = req.body;
    const user = await User.findOne({email});
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({msg: "Invalid password"});

    const token = jwt.sign(
      {id: user._id},
      process.env.JWT_SECRET,
      {expiresIn: "1d"}
    );

    res.json({token});

  } catch(err) {
    res.status(500).json({error: err.message});
  }
})

// AI route
app.post("/api/generate-plan", async (req, res) => {
  const plan = req.body.tasks;
  try {
    // Build simplified input — don't send full mongo docs
    const simplifiedPlan = {};
    const validTasks = new Set();

    Object.entries(plan).forEach(([date, day]) => {
      if (!day.tasks || day.tasks.length === 0) return;
      simplifiedPlan[date] = day.tasks.map(task => {
        validTasks.add(task.title);
        return { title: task.title, duration: task.duration };
      });
    });

    const prompt = `Optimize this study plan. Rules:
- Use ONLY these task titles: ${JSON.stringify([...validTasks])}
- Max 5 hours per day
- You may split tasks: "DSA" → "DSA - Part 1", "DSA - Part 2"
- Preserve total duration of each task
- Move/rebalance tasks across days freely

Input plan:
${JSON.stringify(simplifiedPlan)}

Return ONLY a JSON object like:
{"2026-05-18": [{"title": "DSA - Part 1", "duration": 2}]}`;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a JSON API. You output only valid JSON with no explanation, no markdown, no code blocks, no backticks. Raw JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }, // forces JSON output on Groq
      temperature: 0.3, // lower = more predictable output
    });

    const text = response.choices[0].message.content;

    let json;
    try {
      // Still strip fences defensively
      const clean = text.replace(/```json|```/g, "").trim();
      json = JSON.parse(clean);
    } catch (err) {
      console.log("BAD JSON:", text);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    // Validate titles
    for (const dayTasks of Object.values(json)) {
      if (!Array.isArray(dayTasks)) continue;
      for (const task of dayTasks) {
        const baseTitle = task.title.replace(/ - Part \d+$/i, "").trim();
        if (!validTasks.has(baseTitle)) {
          console.log("Invalid AI task:", task.title);
          return res.status(400).json({ error: "AI generated invalid task title" });
        }
      }
    }

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.post("/api/plan/ai", auth, async (req, res) => {
  try {
    const { plan } = req.body;

    const prompt = `
    You are a smart study planner assistant.

    Here is a student's study plan:
    ${JSON.stringify(plan)}

    Analyze it and suggest improvements:
    - balance workload
    - avoid too many hard tasks in one day
    - improve efficiency

    Give 4-5 very short bullet points of atmost 5 words in a point.
    `;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }]
    });

    const aiText = response.choices[0].message.content;

    res.json({ suggestions: aiText });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "AI failed" });
  }
});

// Smart plan
app.get("/api/plan", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });

    const plan = generateSmartPlan(tasks);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// route
app.route("/api/tasks")
  .get( auth, async (req, res) => {
    const tasks = await Task.find({userId: req.user.id});
    res.json(tasks);
  })
  .post(auth, async (req, res) => {
    const newTask = new Task({
      title: req.body.title,
      date: req.body.date,
      status: req.body.status || "pending",
      source: req.body.source,
      userId: req.user.id,
      difficulty: req.body.difficulty || "medium",
      duration: req.body.duration || 1,
      priority: req.body.priority
    });
    await newTask.save();
    res.json(newTask);
  });

app.route("/api/tasks/:id")
  .put(auth, async (req, res) => {
    const task = await Task.findById(req.params.id);
    //toggle status
    task.status = task.status === "pending" ? "done" : "pending";
    await task.save();
    res.json(task);
  })
  .post(auth, async (req, res) => {
    const newTask = new Task(req.body);
    console.log(newTask);
    await newTask.save(); 
    res.json(newTask);
  })
  .delete(auth, async (req, res) => {
    try{
      const id = req.params.id;  // req.params = {id : "5"};
      await Task.findByIdAndDelete(id);
      res.json({ message: "Deleted" });
    } catch(err) {
      res.status(500).json({error: err.message});
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
