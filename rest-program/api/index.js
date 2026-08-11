// --------------------------------------------------------------------------
// 1. IMPORTS & SERVER SETUP
// --------------------------------------------------------------------------
const express = require('express'); // Web framework to handle routing and requests
const cors = require('cors');       // Cross-Origin Resource Sharing (allows front-end to connect to backend)
const path = require('path');       // Node utility to resolve file directory paths

const app = express();
app.use(cors());                    // Enable CORS for all incoming client requests
app.use(express.json());            // Express middleware to parse incoming request body data as JSON

// --------------------------------------------------------------------------
// 2. MOCK DATABASE (In-Memory Data Store)
// --------------------------------------------------------------------------
// This array represents our database table. Since it's stored in the server's RAM,
// modifications made via POST/PUT/DELETE will persist until the server restarts.
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

// --------------------------------------------------------------------------
// 3. ID GENERATION HELPER
// --------------------------------------------------------------------------
// Auto-increment counter and utility to assign unique IDs when creating new tasks.
let taskCounter = 5;
const generateId = () => `T${taskCounter++}`;

// --------------------------------------------------------------------------
// 4. REST API ROUTES (The 5 CRUD Endpoints)
// --------------------------------------------------------------------------

// --- METHOD 1: GET ALL TASKS ---
// Retrieves the entire list of tasks. Returns status 200 (OK) with the JSON array.
app.get('/api/tasks', (req, res) => {
  res.json(tasksDb);
});

// --- METHOD 2: GET SINGLE TASK BY ID ---
// Retrieves a single task. Looks up task by ID parameter in URL. 
// If not found, returns status 404 (Not Found). Otherwise returns task details (status 200).
app.get('/api/tasks/:id', (req, res) => {
  const task = tasksDb.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }
  res.json(task);
});

// --- METHOD 3: CREATE A TASK (POST) ---
// Reads data (title, description, priority) from body. Performs basic validation.
// Generates a new ID, sets completed default to false, appends to database array, and returns status 201 (Created).
app.post('/api/tasks', (req, res) => {
  const { title, description, priority } = req.body;
  
  // Validation: Title and Priority must be provided
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
  res.status(201).json(newTask); // 201 = HTTP status code for successful creation
});

// --- METHOD 4: UPDATE A TASK (PUT) ---
// Finds task index matching the ID parameter. If not found, returns 404.
// Partially updates any provided fields (title, description, completed, priority) and returns the updated task.
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasksDb.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }

  const { title, description, completed, priority } = req.body;
  const currentTask = tasksDb[taskIndex];

  // Update properties only if they are sent in the body payload
  if (title !== undefined) currentTask.title = String(title);
  if (description !== undefined) currentTask.description = String(description);
  if (completed !== undefined) currentTask.completed = Boolean(completed);
  if (priority !== undefined) currentTask.priority = String(priority);

  tasksDb[taskIndex] = currentTask;
  res.json(currentTask);
});

// --- METHOD 5: DELETE A TASK (DELETE) ---
// Finds task index matching the ID. If not found, returns 404.
// Splices (removes) task from database array and returns a success confirmation response.
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasksDb.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID "${req.params.id}" not found.` });
  }

  const deletedTask = tasksDb.splice(taskIndex, 1)[0];
  res.json({ message: "Task successfully deleted.", id: deletedTask.id });
});

// --------------------------------------------------------------------------
// 5. STATIC FILES SERVING & APP EXPORT
// --------------------------------------------------------------------------
// Serves static dashboard assets (HTML, CSS, JS) from public directory for local run.
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app; // Export app for local-server.js runner or Vercel serverless functions

