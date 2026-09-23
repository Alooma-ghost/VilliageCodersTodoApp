const express = require('express');
const store = require('../services/store');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @route   GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, filter } = req.query;
    const tasks = await store.getTasks({
      status,
      priority,
      filter,
      currentUserId: req.user._id || req.user.id,
    });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching tasks' });
  }
});

// @route   POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo } = req.body;

    if (!title || !deadline || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Please provide task title, deadline, and assigned team member',
      });
    }

    const task = await store.createTask({
      title,
      description: description || '',
      priority: priority || 'Medium',
      deadline: new Date(deadline),
      assignedTo,
      assignedBy: req.user._id || req.user.id,
    });

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating task' });
  }
});

// @route   PATCH /api/tasks/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, cannotDoReason } = req.body;

    if (!['Pending', 'In Progress', 'Completed', 'Cannot Do'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status' });
    }

    // Require reason if marking as "Cannot Do"
    if (status === 'Cannot Do') {
      if (!cannotDoReason || !cannotDoReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'A clear reason is required when a task cannot be completed.',
        });
      }
    }

    const updatedTask = await store.updateTaskStatus(req.params.id, status, cannotDoReason);

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Error updating task status' });
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await store.updateTask(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({
      success: true,
      task: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await store.getTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const assignedById = task.assignedBy?._id || task.assignedBy;
    const currentUserId = req.user._id || req.user.id;
    const isAssigner = assignedById?.toString() === currentUserId?.toString();
    const isBoss = req.user.role === 'Boss';

    if (!isBoss && !isAssigner) {
      return res.status(403).json({ success: false, message: 'Only the task creator or a Boss can delete this task' });
    }

    await store.deleteTask(req.params.id);

    res.json({
      success: true,
      message: 'Task successfully deleted',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting task' });
  }
});

module.exports = router;
