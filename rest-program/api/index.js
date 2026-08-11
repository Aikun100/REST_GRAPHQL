const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// In-Memory Database
let tasksDb = [
  {
    id: "T1",
    title: "Finalize GraphQL Serverless Setup",
    description: "Convert the express server endpoints to export the default module handler, ensuring instant integration with Vercel serverless configurations.",
    completed: true,
    priority: "High"
  },
  {
    id: "T2",
    title: "Draft Web Dashboard Stylesheet",
    description: "Write premium, high-fidelity styles utilizing backdrop-blur, custom variables, neon indicator rings, and floating keyframes.",
    completed: false,
    priority: "High"
  },
  {
    id: "T3",
    title: "Set up 5 REST API Handlers",
    description: "Expose Express HTTP methods for Listing, Detailed Lookup, Creating, Patching, and Deleting records in the memory workspace.",
    completed: false,
    priority: "Medium"
  },
  {
    id: "T4",
    title: "Validate Cross-Origin Requests",
    description: "Configure CORS middleware options to allow cross-origin requests from sandbox visual clients and automated rest testing apps.",
    completed: false,
    priority: "Low"
  }
];

// Helper to generate IDs
let taskCounter = 5;
const generateId = () => `T${taskCounter++}`;

// 1. GET /api/tasks - Retrieve all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasksDb);
});

// 2. GET /api/tasks/:id - Retrieve a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = tasksDb.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }
  res.json(task);
});

// 3. POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  if (!title || !priority) {
    return res.status(400).json({ error: "Missing required fields: title and priority." });
  }

  const newTask = {
    id: generateId(),
    title: String(title),
    description: String(description || ""),
    completed: false,
    priority: String(priority)
  };

  tasksDb.push(newTask);
  res.status(201).json(newTask);
});

// 4. PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasksDb.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }

  const { title, description, completed, priority } = req.body;
  const currentTask = tasksDb[taskIndex];

  // Update properties if provided in the body
  if (title !== undefined) currentTask.title = String(title);
  if (description !== undefined) currentTask.description = String(description);
  if (completed !== undefined) currentTask.completed = Boolean(completed);
  if (priority !== undefined) currentTask.priority = String(priority);

  tasksDb[taskIndex] = currentTask;
  res.json(currentTask);
});

// 5. DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasksDb.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }

  const deletedTask = tasksDb.splice(taskIndex, 1)[0];
  res.json({ message: "Task successfully deleted.", id: deletedTask.id });
});

// Serve static assets for local run
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;
