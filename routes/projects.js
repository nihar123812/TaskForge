const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// @route   GET /api/projects
router.get('/', projectController.getProjects);

// @route   GET /api/projects/:id
router.get('/:id', projectController.getProject);

// @route   POST /api/projects (Admin only)
router.post('/', roleCheck('admin'), [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters')
], projectController.createProject);

// @route   PUT /api/projects/:id (Admin/Owner only)
router.put('/:id', roleCheck('admin'), projectController.updateProject);

// @route   DELETE /api/projects/:id (Admin/Owner only)
router.delete('/:id', roleCheck('admin'), projectController.deleteProject);

// @route   POST /api/projects/:id/members (Admin/Owner only)
router.post('/:id/members', roleCheck('admin'), [
  body('userId').notEmpty().withMessage('User ID is required')
], projectController.addMember);

// @route   DELETE /api/projects/:id/members/:userId (Admin/Owner only)
router.delete('/:id/members/:userId', roleCheck('admin'), projectController.removeMember);

module.exports = router;
