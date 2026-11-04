# Simple MERN To-Do List App — Implementation Guide

## 1. Project Overview

Build a very basic To-Do List application using the MERN stack.

**MERN** stands for:
- **MongoDB** — stores tasks
- **Express.js** — handles backend routes
- **React.js** — displays the user interface
- **Node.js** — runs the backend server

### Features

1. Add a task.
2. View all tasks.
3. Delete a task.

This project does not include login, registration, authentication, task categories, due dates, or advanced features.

---

## 2. Requirements

Install the following before starting:

- Node.js and npm
- MongoDB Community Server, or a MongoDB Atlas database
- Visual Studio Code
- A web browser

Check that Node.js and npm are installed:

```bash
node -v
npm -v
```

---

## 3. Project Folder Structure

Create a folder named `todo-app`.

```text
todo-app/
├── backend/
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    └── package.json
```

---

## 4. Backend Setup

Open the terminal in VS Code and run:

```bash
mkdir todo-app
cd todo-app
mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv
npm install nodemon --save-dev
```

Add the following scripts to the `backend/package.json` file:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 1: Create the MongoDB Model

Create `backend/models/Task.js`:

```javascript
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Task", taskSchema);
```

This model defines the task data stored in MongoDB.

### Step 2: Create the Task Routes

Create `backend/routes/taskRoutes.js`:

```javascript
const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Add a task
router.post("/", async (req, res) => {
  try {
    const newTask = new Task({
      title: req.body.title
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: "Error adding task" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;
```

### Step 3: Configure the Backend Server

Create `backend/server.js`:

```javascript
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", require("./routes/taskRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
```

### Step 4: Add the Database Connection

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/todoDB
```

This connection string is for a local MongoDB server. Make sure MongoDB is running before starting the backend.

If you use MongoDB Atlas, replace the value with your own Atlas connection string. Do not share or commit your database credentials.

### Step 5: Start the Backend

In the backend terminal:

```bash
npm run dev
```

Expected terminal messages:

```text
MongoDB connected
Server running on port 5000
```

The backend API will be available at:

```text
http://localhost:5000/api/tasks
```

---

## 5. Frontend Setup

Open a second terminal in the `todo-app` folder.

Create the React application using Vite:

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually:

```text
http://localhost:5173
```

### Step 1: Create the Main React Component

Replace the contents of `frontend/src/App.jsx` with:

```jsx
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const API_URL = "http://localhost:5000/api/tasks";

  // Get all tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add a task
  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error("Unable to add task");
      }

      setTitle("");
      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Unable to delete task");
      }

      fetchTasks();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h1>My To-Do List</h1>

      <form onSubmit={addTask}>
        <input
          type="text"
          placeholder="Enter a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button type="submit">Add</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <span>{task.title}</span>
            <button
              className="delete-btn"
              onClick={() => deleteTask(task._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

### Step 2: Add Basic CSS

Replace the contents of `frontend/src/App.css` with:

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #f4f4f4;
}

.container {
  width: 90%;
  max-width: 500px;
  margin: 80px auto;
  padding: 25px;
  background: white;
  border-radius: 10px;
}

h1 {
  text-align: center;
  color: #333;
}

form {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  padding: 10px 15px;
  border: none;
  background: #333;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

ul {
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
}

.delete-btn {
  background: #d9534f;
}
```

### Step 3: Check the React Entry Point

Make sure `frontend/src/main.jsx` contains:

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 6. Run the Complete Project

You need two terminals.

**Terminal 1 — Backend**

```bash
cd todo-app/backend
npm run dev
```

**Terminal 2 — Frontend**

```bash
cd todo-app/frontend
npm run dev
```

Open the frontend URL shown by Vite, usually `http://localhost:5173`.

---

## 7. How the Application Works

1. The user enters a task in the React application.
2. React sends a POST request to the Express backend.
3. Express receives the task and saves it in MongoDB using Mongoose.
4. React sends a GET request to retrieve all tasks.
5. The tasks are displayed on the screen.
6. When the user clicks Delete, React sends a DELETE request.
7. Express deletes the task from MongoDB.

### API Routes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Add a task |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 8. Testing Checklist

- [ ] Backend starts successfully.
- [ ] MongoDB connects successfully.
- [ ] Frontend opens in the browser.
- [ ] A new task can be added.
- [ ] All saved tasks are displayed.
- [ ] A task can be deleted.
- [ ] Deleted tasks remain deleted after refreshing the page.
- [ ] Empty tasks cannot be added.

---

## 9. Concepts Used

| Concept | Where it is used |
|---|---|
| React components | `App.jsx` |
| `useState` | Managing tasks and input |
| `useEffect` | Loading tasks on page load |
| Fetch API | Communicating with backend |
| Express routes | Handling API requests |
| Mongoose model | Defining task structure |
| MongoDB | Storing tasks |
| CRUD | Create, Read and Delete |

---

## 10. Final Project Outcome

The final application is a simple To-Do List where users can add tasks, view their saved tasks, and delete tasks they no longer need.

**Project level:** Beginner

**Main concepts:** Basic React, Node.js, Express, MongoDB, API requests, and CRUD operations.

**Note:** This is intentionally a small learning project. Once it works, you can improve it gradually, but the basic version does not require any additional features.
