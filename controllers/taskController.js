const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks (with filters)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignee, search } = req.query;
    const filter = {};

    // Filter by project
    if (project) {
      filter.project = project;
    } else {
      // Only show tasks from user's projects
      const userProjects = await Project.find({ members: req.user._id }).select('_id');
      filter.project = { $in: userProjects.map(p => p._id) };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee === 'me' ? req.user._id : assignee;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks.' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Error fetching task.' });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { title, description, project, assignee, priority, dueDate, status } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify user owns the project
    if (projectDoc.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can create tasks.' });
    }

    // If assignee specified, verify they're a project member
    if (assignee) {
      const isMember = projectDoc.members.some(m => m.toString() === assignee);
      if (!isMember) {
        return res.status(400).json({ message: 'Assignee must be a member of the project.' });
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      project,
      assignee: assignee || null,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.status(201).json({ message: 'Task created!', task: populated });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task.' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Admin: all fields, Member: status only for assigned tasks)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const isOwner = project && project.owner.toString() === req.user._id.toString();
    const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();

    if (req.user.role === 'member') {
      // Members can only update status of tasks assigned to them
      if (!isAssignee) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you.' });
      }
      // Only allow status update
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({ message: 'Members can only update task status.' });
      }
    } else {
      // Admin/Owner can update everything
      const { title, description, assignee, status, priority, dueDate } = req.body;
      
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee !== undefined) task.assignee = assignee || null;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name color');

    res.json({ message: 'Task updated!', task: populated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task.' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    if (!project || project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete tasks.' });
    }

    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error deleting task.' });
  }
};
