const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// @route   GET /api/tasks
router.get('/', taskController.getTasks);

// @route   GET /api/tasks/:id
router.get('/:id', taskController.getTask);

// @route   POST /api/tasks (Admin only)
router.post('/', roleCheck('admin'), [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ min: 2, max: 200 }).withMessage('Task title must be 2-200 characters'),
  body('project')
    .notEmpty().withMessage('Project is required')
], taskController.createTask);

// @route   PUT /api/tasks/:id (Admin: all, Member: status only)
router.put('/:id', taskController.updateTask);

// @route   DELETE /api/tasks/:id (Admin only)
router.delete('/:id', roleCheck('admin'), taskController.deleteTask);

module.exports = router;
