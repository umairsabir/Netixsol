import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Task Interface
interface Task {
  id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  createdAt: Date;
}

// Helper: Load tasks from file
const loadTasks = (): Task[] => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
  return [];
};

// Helper: Save tasks to file
const saveTasks = (tasks: Task[]) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

// Initialize tasks
let tasks: Task[] = loadTasks();

// GET /api/tasks -> return all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json(tasks);
});

// POST /api/tasks -> add task
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title, category } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    title: title.trim(),
    category: category || 'Personal',
    isCompleted: false,
    createdAt: new Date(),
  };

  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id -> update task status or title
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isCompleted, title, category } = req.body;

  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Valid title is required' });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (category !== undefined) {
    tasks[taskIndex].category = category;
  }

  if (isCompleted !== undefined) {
    tasks[taskIndex].isCompleted = typeof isCompleted === 'boolean' ? isCompleted : tasks[taskIndex].isCompleted;
  } else if (title === undefined && category === undefined) {
    tasks[taskIndex].isCompleted = !tasks[taskIndex].isCompleted;
  }

  saveTasks(tasks);
  res.json(tasks[taskIndex]);
});

// DELETE /api/tasks/:id -> delete task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === initialLength) {
    return res.status(404).json({ error: 'Task not found' });
  }

  saveTasks(tasks);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
