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

// middleware
app.use(cors());
app.use(express.json());


// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

mongoose.connect("mongodb://localhost:27017/stu-planner") 
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
  const {subjects, hours} = req.body;
  try {    
    const prompt = `
    Create a 5-day study plan.
    Subjects: ${subjects.join(", ")}
    Time per day: ${hours} hours
    
    Return ONLY JSON:
    [
      { "title": "...", "date": "2026-05-01" }
    ]
    `;
    const response = await client.chat.completions.create({
      // best first
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: prompt
      }]
    });
    const text = response.choices[0].message.content;

    // Extract JSON safely
    const json = JSON.parse(text.match(/\[.*\]/s)[0]);

    //convert AI output into DB format
    const aiTasks = json.map(task => ({
      title: task.title,
      date: task.date,
      status: "pending",
      source: "ai"
    }));

    res.json(aiTasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
}) 

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
      userId: req.user.id
    });
    await newTask.save();
    res.json(newTask);
  });

app.route("/api/tasks/:id")
  .put( async (req, res) => {
    const task = await Task.findById(req.params.id);
    //toggle status
    task.status = task.status === "pending" ? "done" : "pending";
    await task.save();
    res.json(task);
  })
  .post( async (req, res) => {
    const newTask = new Task(req.body);
    console.log(newTask);
    await newTask.save(); 
    res.json(newTask);
  })
  .delete(async (req, res) => {
    try{
      const id = req.params.id;  // req.params = {id : "5"};
      await Task.findByIdAndDelete(id);
      res.json({ message: "Deleted" });
    } catch(err) {
      res.status(500).json({error: err.message});
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));