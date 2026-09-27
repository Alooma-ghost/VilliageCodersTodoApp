const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const dataDir = path.join(__dirname, '../../data');
const localDbPath = path.join(dataDir, 'local_db.json');
const tempDbPath = path.join(dataDir, 'local_db.json.tmp');

// Ensure storage directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create data dir:', err.message);
  }
}

// In-memory master database to prevent concurrent file truncation bugs
let memoryDB = { users: [], tasks: [] };

function loadLocalDB() {
  if (fs.existsSync(localDbPath)) {
    try {
      const content = fs.readFileSync(localDbPath, 'utf8');
      if (content && content.trim()) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.users)) {
          memoryDB.users = parsed.users;
        }
        if (Array.isArray(parsed.tasks)) {
          memoryDB.tasks = parsed.tasks;
        }
      }
    } catch (e) {
      console.warn('Warning reading local_db.json, using in-memory state:', e.message);
    }
  } else {
    saveLocalDB(memoryDB);
  }
  return memoryDB;
}

// Atomic file writer: writes to tmp first, then safely replaces to prevent empty/corrupt reads
function saveLocalDB(data) {
  if (data && typeof data === 'object') {
    if (Array.isArray(data.users)) memoryDB.users = data.users;
    if (Array.isArray(data.tasks)) memoryDB.tasks = data.tasks;
  }
  try {
    const serialized = JSON.stringify(memoryDB, null, 2);
    fs.writeFileSync(tempDbPath, serialized, 'utf8');
    fs.renameSync(tempDbPath, localDbPath);
  } catch (e) {
    try {
      fs.writeFileSync(localDbPath, JSON.stringify(memoryDB, null, 2), 'utf8');
    } catch (err2) {
      console.error('Local DB disk write error:', err2.message);
    }
  }
}

// Initialize on module load
loadLocalDB();

const isMongoLive = () => mongoose.connection && mongoose.connection.readyState === 1;

// Generate MongoDB-compatible 24-character hexadecimal ObjectID
function generateMongoCompatibleId() {
  try {
    return new mongoose.Types.ObjectId().toString();
  } catch (_) {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(16, '0');
    return (timestamp + random).slice(0, 24);
  }
}

// --- USER OPERATIONS ---
async function findUserByEmail(email) {
  if (!email) return null;
  const cleanEmail = email.trim().toLowerCase();

  // Check MongoDB if live
  if (isMongoLive()) {
    try {
      const mongoUser = await User.findOne({ email: cleanEmail });
      if (mongoUser) {
        // Sync to memory
        const uObj = mongoUser.toObject();
        const existingIdx = memoryDB.users.findIndex(
          (u) => u.email.toLowerCase() === cleanEmail
        );
        if (existingIdx >= 0) {
          memoryDB.users[existingIdx] = { ...memoryDB.users[existingIdx], ...uObj };
        } else {
          memoryDB.users.push(uObj);
        }
        saveLocalDB(memoryDB);
        return mongoUser;
      }
    } catch (err) {
      console.warn('Mongo findUserByEmail error:', err.message);
    }
  }

  // Fallback to in-memory/local DB
  loadLocalDB();
  const user = memoryDB.users.find(
    (u) => u.email && u.email.toLowerCase() === cleanEmail
  );
  return user || null;
}

async function findUserById(id) {
  if (!id) return null;
  const idStr = id.toString();

  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        const mongoUser = await User.findById(idStr).select('-password');
        if (mongoUser) return mongoUser;
      }
    } catch (err) {
      console.warn('Mongo findUserById error:', err.message);
    }
  }

  loadLocalDB();
  const user = memoryDB.users.find(
    (u) => (u._id && u._id.toString() === idStr) || (u.id && u.id.toString() === idStr)
  );

  if (!user) return null;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    _id: safeUser._id || safeUser.id || idStr,
    id: safeUser._id || safeUser.id || idStr,
  };
}

async function createUser({ name, email, password, role, title }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanRole = role === 'Boss' ? 'Boss' : 'Member';
  const cleanTitle = title ? title.trim() : (cleanRole === 'Boss' ? 'Team Lead' : 'Developer');
  const userId = generateMongoCompatibleId();

  let mongoCreated = null;
  if (isMongoLive()) {
    try {
      mongoCreated = await User.create({
        _id: userId,
        name: cleanName,
        email: cleanEmail,
        password,
        role: cleanRole,
        title: cleanTitle,
      });
    } catch (err) {
      console.warn('Mongo User.create error:', err.message);
    }
  }

  loadLocalDB();
  const localUser = {
    _id: mongoCreated?._id?.toString() || userId,
    id: mongoCreated?._id?.toString() || userId,
    name: cleanName,
    email: cleanEmail,
    password,
    role: cleanRole,
    title: cleanTitle,
    createdAt: new Date().toISOString(),
  };

  // Prevent duplicate in memory
  const existingIdx = memoryDB.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
  if (existingIdx >= 0) {
    memoryDB.users[existingIdx] = localUser;
  } else {
    memoryDB.users.push(localUser);
  }
  saveLocalDB(memoryDB);

  const { password: _, ...safeUser } = localUser;
  return safeUser;
}

async function getAllUsers() {
  loadLocalDB();
  let usersMap = new Map();

  // First seed from local memory
  for (const u of memoryDB.users) {
    if (u && u.email) {
      const { password, ...safe } = u;
      const uid = (safe._id || safe.id || '').toString();
      usersMap.set(u.email.toLowerCase(), {
        ...safe,
        _id: uid,
        id: uid,
      });
    }
  }

  // If Mongo is live, merge from Mongo as well
  if (isMongoLive()) {
    try {
      const mongoUsers = await User.find().select('-password').sort({ role: 1, name: 1 });
      for (const mu of mongoUsers) {
        const uObj = mu.toObject();
        const uid = (uObj._id || uObj.id || '').toString();
        usersMap.set(uObj.email.toLowerCase(), {
          ...uObj,
          _id: uid,
          id: uid,
        });
      }
    } catch (err) {
      console.warn('Mongo getAllUsers error:', err.message);
    }
  }

  // Return sorted array: Boss first, then alphabetical
  const usersList = Array.from(usersMap.values());
  return usersList.sort((a, b) => {
    if (a.role === 'Boss' && b.role !== 'Boss') return -1;
    if (b.role === 'Boss' && a.role !== 'Boss') return 1;
    return (a.name || '').localeCompare(b.name || '');
  });
}

// --- TASK OPERATIONS ---
function populateTaskUsers(task, usersList) {
  const getUserId = (target) => {
    if (!target) return '';
    if (typeof target === 'string') return target;
    return (target._id || target.id || '').toString();
  };

  const toId = getUserId(task.assignedTo);
  const byId = getUserId(task.assignedBy);

  const assignedToUser = usersList.find(
    (u) => (u._id && u._id.toString() === toId) || (u.id && u.id.toString() === toId)
  );
  const assignedByUser = usersList.find(
    (u) => (u._id && u._id.toString() === byId) || (u.id && u.id.toString() === byId)
  );

  return {
    ...task,
    _id: (task._id || task.id || '').toString(),
    id: (task._id || task.id || '').toString(),
    assignedTo: assignedToUser
      ? {
          _id: (assignedToUser._id || assignedToUser.id || toId).toString(),
          id: (assignedToUser._id || assignedToUser.id || toId).toString(),
          name: assignedToUser.name,
          email: assignedToUser.email,
          role: assignedToUser.role,
          title: assignedToUser.title,
        }
      : typeof task.assignedTo === 'object' && task.assignedTo?.name
      ? task.assignedTo
      : { _id: toId, id: toId, name: 'Team Member', email: '', role: 'Member', title: 'Developer' },
    assignedBy: assignedByUser
      ? {
          _id: (assignedByUser._id || assignedByUser.id || byId).toString(),
          id: (assignedByUser._id || assignedByUser.id || byId).toString(),
          name: assignedByUser.name,
          email: assignedByUser.email,
          role: assignedByUser.role,
          title: assignedByUser.title,
        }
      : typeof task.assignedBy === 'object' && task.assignedBy?.name
      ? task.assignedBy
      : { _id: byId, id: byId, name: 'Team Lead', email: '', role: 'Boss', title: 'Lead' },
  };
}

async function getTasks({ status, priority, filter, currentUserId }) {
  const currIdStr = currentUserId ? currentUserId.toString() : '';

  if (isMongoLive()) {
    try {
      let query = {};
      if (filter === 'assignedToMe' && mongoose.Types.ObjectId.isValid(currIdStr)) {
        query.assignedTo = currIdStr;
      } else if (filter === 'assignedByMe' && mongoose.Types.ObjectId.isValid(currIdStr)) {
        query.assignedBy = currIdStr;
      } else if (filter === 'blocked') {
        query.status = 'Cannot Do';
      }

      if (status && status !== 'All') query.status = status;
      if (priority && priority !== 'All') query.priority = priority;

      const mongoTasks = await Task.find(query)
        .populate('assignedTo', 'name email role title')
        .populate('assignedBy', 'name email role title')
        .sort({ createdAt: -1 });

      if (mongoTasks && mongoTasks.length > 0) {
        return mongoTasks.map((t) => t.toObject());
      }
    } catch (err) {
      console.warn('Mongo getTasks error:', err.message);
    }
  }

  loadLocalDB();
  const allUsers = await getAllUsers();
  let tasks = [...memoryDB.tasks];

  const getTargetId = (target) => {
    if (!target) return '';
    if (typeof target === 'string') return target;
    return (target._id || target.id || '').toString();
  };

  if (filter === 'assignedToMe' && currIdStr) {
    tasks = tasks.filter((t) => getTargetId(t.assignedTo) === currIdStr);
  } else if (filter === 'assignedByMe' && currIdStr) {
    tasks = tasks.filter((t) => getTargetId(t.assignedBy) === currIdStr);
  } else if (filter === 'blocked') {
    tasks = tasks.filter((t) => t.status === 'Cannot Do');
  }

  if (status && status !== 'All') {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (priority && priority !== 'All') {
    tasks = tasks.filter((t) => t.priority === priority);
  }

  return tasks
    .map((t) => populateTaskUsers(t, allUsers))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

async function createTask({ title, description, priority, deadline, assignedTo, assignedBy }) {
  const taskId = generateMongoCompatibleId();
  const allUsers = await getAllUsers();

  const toId = typeof assignedTo === 'string' ? assignedTo : (assignedTo?._id || assignedTo?.id);
  const byId = typeof assignedBy === 'string' ? assignedBy : (assignedBy?._id || assignedBy?.id);

  let mongoTask = null;
  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(toId) && mongoose.Types.ObjectId.isValid(byId)) {
        const created = await Task.create({
          _id: taskId,
          title: title.trim(),
          description: description ? description.trim() : '',
          priority: priority || 'Medium',
          deadline: new Date(deadline),
          assignedTo: toId,
          assignedBy: byId,
          status: 'Pending',
        });
        mongoTask = await Task.findById(created._id)
          .populate('assignedTo', 'name email role title')
          .populate('assignedBy', 'name email role title');
      }
    } catch (err) {
      console.warn('Mongo createTask error:', err.message);
    }
  }

  loadLocalDB();
  const newTaskRaw = {
    _id: mongoTask?._id?.toString() || taskId,
    id: mongoTask?._id?.toString() || taskId,
    title: title.trim(),
    description: description ? description.trim() : '',
    priority: priority || 'Medium',
    deadline: new Date(deadline).toISOString(),
    status: 'Pending',
    assignedTo: toId,
    assignedBy: byId,
    cannotDoReason: '',
    cannotDoReportedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryDB.tasks.unshift(newTaskRaw);
  saveLocalDB(memoryDB);

  return populateTaskUsers(newTaskRaw, allUsers);
}

async function updateTaskStatus(id, status, cannotDoReason = '') {
  const idStr = id.toString();
  const allUsers = await getAllUsers();

  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        const task = await Task.findById(idStr);
        if (task) {
          task.status = status;
          if (status === 'Cannot Do') {
            task.cannotDoReason = (cannotDoReason || '').trim();
            task.cannotDoReportedAt = new Date();
          } else {
            task.cannotDoReason = '';
            task.cannotDoReportedAt = null;
          }
          await task.save();
          return await Task.findById(task._id)
            .populate('assignedTo', 'name email role title')
            .populate('assignedBy', 'name email role title');
        }
      }
    } catch (err) {
      console.warn('Mongo updateTaskStatus error:', err.message);
    }
  }

  loadLocalDB();
  const task = memoryDB.tasks.find(
    (t) => (t._id && t._id.toString() === idStr) || (t.id && t.id.toString() === idStr)
  );
  if (!task) return null;

  task.status = status;
  if (status === 'Cannot Do') {
    task.cannotDoReason = (cannotDoReason || '').trim();
    task.cannotDoReportedAt = new Date().toISOString();
  } else {
    task.cannotDoReason = '';
    task.cannotDoReportedAt = null;
  }
  task.updatedAt = new Date().toISOString();
  saveLocalDB(memoryDB);

  return populateTaskUsers(task, allUsers);
}

async function updateTask(id, updateData) {
  const idStr = id.toString();
  const allUsers = await getAllUsers();

  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        const updated = await Task.findByIdAndUpdate(idStr, updateData, { new: true })
          .populate('assignedTo', 'name email role title')
          .populate('assignedBy', 'name email role title');
        if (updated) return updated.toObject();
      }
    } catch (err) {
      console.warn('Mongo updateTask error:', err.message);
    }
  }

  loadLocalDB();
  const task = memoryDB.tasks.find(
    (t) => (t._id && t._id.toString() === idStr) || (t.id && t.id.toString() === idStr)
  );
  if (!task) return null;

  Object.assign(task, updateData, { updatedAt: new Date().toISOString() });
  saveLocalDB(memoryDB);
  return populateTaskUsers(task, allUsers);
}

async function deleteTask(id) {
  const idStr = id.toString();

  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        await Task.findByIdAndDelete(idStr);
      }
    } catch (err) {
      console.warn('Mongo deleteTask error:', err.message);
    }
  }

  loadLocalDB();
  memoryDB.tasks = memoryDB.tasks.filter(
    (t) => (t._id && t._id.toString() !== idStr) && (t.id && t.id.toString() !== idStr)
  );
  saveLocalDB(memoryDB);
  return true;
}

async function getTaskById(id) {
  const idStr = id.toString();
  const allUsers = await getAllUsers();

  if (isMongoLive()) {
    try {
      if (mongoose.Types.ObjectId.isValid(idStr)) {
        const task = await Task.findById(idStr);
        if (task) return task.toObject();
      }
    } catch (err) {
      console.warn('Mongo getTaskById error:', err.message);
    }
  }

  loadLocalDB();
  const task = memoryDB.tasks.find(
    (t) => (t._id && t._id.toString() === idStr) || (t.id && t.id.toString() === idStr)
  );
  return task ? populateTaskUsers(task, allUsers) : null;
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
  memoryDB = { users: [], tasks: [] };
  saveLocalDB(memoryDB);
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
