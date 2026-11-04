const { useEffect, useState } = React;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

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

  // Edit a task
  const updateTask = async (id) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: editTitle })
      });

      if (!response.ok) {
        throw new Error("Unable to update task");
      }

      setEditId(null);
      setEditTitle("");
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
            {editId === task._id ? (
              <>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <div className="actions">
                  <button onClick={() => updateTask(task._id)}>Save</button>
                  <button onClick={() => setEditId(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <span>{task.title}</span>
                <div className="actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditId(task._id);
                      setEditTitle(task.title);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task._id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
