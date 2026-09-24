const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const dataDir = path.join(__dirname, '../../data');
const localDbPath = path.join(dataDir, 'local_db.json');

// Ensure local fallback storage directory exists and local_db.json is initialized
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
// Initialize local DB file on first load if it doesn't exist
loadLocalDBInit();

function loadLocalDBInit() {
  if (!fs.existsSync(localDbPath)) {
    const initial = { users: [], tasks: [] };
    fs.writeFileSync(localDbPath, JSON.stringify(initial, null, 2));
  }
}

function loadLocalDB() {
  if (!fs.existsSync(localDbPath)) {
    const initial = { users: [], tasks: [] };
    fs.writeFileSync(localDbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  } catch (e) {
    return { users: [], tasks: [] };
  }
}

function saveLocalDB(data) {
  fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2));
}

const isMongoLive = () => mongoose.connection.readyState === 1;

// --- USER OPERATIONS ---
async function findUserByEmail(email) {
  if (isMongoLive()) {
    return await User.findOne({ email: email.toLowerCase() });
  }
  const db = loadLocalDB();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(id) {
  if (isMongoLive()) {
    return await User.findById(id).select('-password');
  }
  const db = loadLocalDB();
  const user = db.users.find((u) => u._id === id || u.id === id);
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

async function createUser({ name, email, password, role, title }) {
  if (isMongoLive()) {
    return await User.create({ name, email, password, role, title });
  }
  const db = loadLocalDB();
  const newUser = {
    _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name,
    email: email.toLowerCase(),
    password,
    role: role || 'Member',
    title: title || (role === 'Boss' ? 'Team Lead / Boss' : 'Developer'),
    createdAt: new Date().toISOString(),
  };
  db.users.push(newUser);
  saveLocalDB(db);
  const { password: _, ...safeUser } = newUser;
  return safeUser;
}

async function getAllUsers() {
  if (isMongoLive()) {
    return await User.find().select('-password').sort({ role: 1, name: 1 });
  }
  const db = loadLocalDB();
  return db.users.map(({ password, ...u }) => u);
}

// --- TASK OPERATIONS ---
async function getTasks({ status, priority, filter, currentUserId }) {
  if (isMongoLive()) {
    let query = {};
    if (filter === 'assignedToMe') query.assignedTo = currentUserId;
    else if (filter === 'assignedByMe') query.assignedBy = currentUserId;
    else if (filter === 'blocked') query.status = 'Cannot Do';

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;

    return await Task.find(query)
      .populate('assignedTo', 'name email role title')
      .populate('assignedBy', 'name email role title')
      .sort({ createdAt: -1 });
  }

  const db = loadLocalDB();
  let tasks = [...db.tasks];

  if (filter === 'assignedToMe') {
    tasks = tasks.filter((t) => (t.assignedTo?._id || t.assignedTo) === currentUserId);
  } else if (filter === 'assignedByMe') {
    tasks = tasks.filter((t) => (t.assignedBy?._id || t.assignedBy) === currentUserId);
  } else if (filter === 'blocked') {
    tasks = tasks.filter((t) => t.status === 'Cannot Do');
  }

  if (status && status !== 'All') {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (priority && priority !== 'All') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  // Populate users in local DB
  return tasks.map((task) => {
    const assignedToUser = db.users.find(
      (u) => u._id === (task.assignedTo?._id || task.assignedTo)
    );
    const assignedByUser = db.users.find(
      (u) => u._id === (task.assignedBy?._id || task.assignedBy)
    );
    return {
      ...task,
      assignedTo: assignedToUser ? { name: assignedToUser.name, email: assignedToUser.email, role: assignedToUser.role, title: assignedToUser.title, _id: assignedToUser._id } : task.assignedTo,
      assignedBy: assignedByUser ? { name: assignedByUser.name, email: assignedByUser.email, role: assignedByUser.role, title: assignedByUser.title, _id: assignedByUser._id } : task.assignedBy,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createTask({ title, description, priority, deadline, assignedTo, assignedBy }) {
  if (isMongoLive()) {
    const task = await Task.create({
      title,
      description: description || '',
      priority: priority || 'Medium',
      deadline: new Date(deadline),
      assignedTo,
      assignedBy,
      status: 'Pending',
    });
    return await Task.findById(task._id)
      .populate('assignedTo', 'name email role title')
      .populate('assignedBy', 'name email role title');
  }

  const db = loadLocalDB();
  const assignedToUser = db.users.find((u) => u._id === assignedTo);
  const assignedByUser = db.users.find((u) => u._id === assignedBy);

  const newTask = {
    _id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    title,
    description: description || '',
    priority: priority || 'Medium',
    deadline: new Date(deadline).toISOString(),
    status: 'Pending',
    assignedTo: assignedToUser ? { _id: assignedToUser._id, name: assignedToUser.name, email: assignedToUser.email, role: assignedToUser.role, title: assignedToUser.title } : assignedTo,
    assignedBy: assignedByUser ? { _id: assignedByUser._id, name: assignedByUser.name, email: assignedByUser.email, role: assignedByUser.role, title: assignedByUser.title } : assignedBy,
    cannotDoReason: '',
    cannotDoReportedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.tasks.unshift(newTask);
  saveLocalDB(db);
  return newTask;
}

async function updateTaskStatus(id, status, cannotDoReason = '') {
  if (isMongoLive()) {
    const task = await Task.findById(id);
    if (!task) return null;
    task.status = status;
    if (status === 'Cannot Do') {
      task.cannotDoReason = cannotDoReason.trim();
      task.cannotDoReportedAt = new Date();
    } else if (task.status === 'Cannot Do') {
      task.cannotDoReason = '';
      task.cannotDoReportedAt = null;
    }
    await task.save();
    return await Task.findById(task._id)
      .populate('assignedTo', 'name email role title')
      .populate('assignedBy', 'name email role title');
  }

  const db = loadLocalDB();
  const task = db.tasks.find((t) => t._id === id);
  if (!task) return null;

  const previousStatus = task.status;
  task.status = status;
  if (status === 'Cannot Do') {
    task.cannotDoReason = cannotDoReason.trim();
    task.cannotDoReportedAt = new Date().toISOString();
  } else if (previousStatus === 'Cannot Do') {
    task.cannotDoReason = '';
    task.cannotDoReportedAt = null;
  }
  task.updatedAt = new Date().toISOString();
  saveLocalDB(db);
  return task;
}

async function updateTask(id, updateData) {
  if (isMongoLive()) {
    return await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTo', 'name email role title')
      .populate('assignedBy', 'name email role title');
  }
  const db = loadLocalDB();
  const task = db.tasks.find((t) => t._id === id);
  if (!task) return null;
  Object.assign(task, updateData, { updatedAt: new Date().toISOString() });
  saveLocalDB(db);
  return task;
}

async function deleteTask(id) {
  if (isMongoLive()) {
    return await Task.findByIdAndDelete(id);
  }
  const db = loadLocalDB();
  db.tasks = db.tasks.filter((t) => t._id !== id);
  saveLocalDB(db);
  return true;
}

async function getTaskById(id) {
  if (isMongoLive()) {
    return await Task.findById(id);
  }
  const db = loadLocalDB();
  return db.tasks.find((t) => t._id === id) || null;
}

async function clearAllData() {
  if (isMongoLive()) {
    try {
      await User.deleteMany({});
      await Task.deleteMany({});
    } catch (e) {
      console.error('Error clearing Mongo collections:', e.message);
    }
  }
  const empty = { users: [], tasks: [] };
  saveLocalDB(empty);
  return { success: true, message: 'All test users and tasks cleared successfully' };
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  getTasks,
  getTaskById,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  clearAllData,
  isMongoLive,
};
