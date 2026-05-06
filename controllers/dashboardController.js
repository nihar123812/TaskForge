const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    // Get user's projects
    let projectFilter;
    if (req.user.role === 'admin') {
      projectFilter = { owner: req.user._id };
    } else {
      projectFilter = { members: req.user._id };
    }

    const projects = await Project.find(projectFilter).select('_id name color status');
    const projectIds = projects.map(p => p._id);

    // Get all tasks from user's projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('project', 'name color');

    // Task counts by status
    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      done: 0,
      total: tasks.length
    };
    tasks.forEach(t => { statusCounts[t.status]++; });

    // Priority distribution
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };
    tasks.forEach(t => { priorityCounts[t.priority]++; });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    );

    // Tasks due soon (next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const dueSoonTasks = tasks.filter(t =>
      t.dueDate && 
      new Date(t.dueDate) >= now && 
      new Date(t.dueDate) <= threeDaysFromNow && 
      t.status !== 'done'
    );

    // Recent tasks (last 5)
    const recentTasks = tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // My tasks (assigned to current user)
    const myTasks = tasks.filter(t => 
      t.assignee && t.assignee._id.toString() === req.user._id.toString()
    );
    const myTaskCounts = {
      todo: 0, 'in-progress': 0, review: 0, done: 0, total: myTasks.length
    };
    myTasks.forEach(t => { myTaskCounts[t.status]++; });

    // Per-project stats
    const projectStats = projects.map(project => {
      const projectTasks = tasks.filter(t => t.project._id.toString() === project._id.toString());
      const done = projectTasks.filter(t => t.status === 'done').length;
      const total = projectTasks.length;
      return {
        id: project._id,
        name: project.name,
        color: project.color,
        status: project.status,
        totalTasks: total,
        completedTasks: done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });

    res.json({
      statusCounts,
      priorityCounts,
      overdueTasks: overdueTasks.slice(0, 10),
      overdueCount: overdueTasks.length,
      dueSoonTasks: dueSoonTasks.slice(0, 10),
      dueSoonCount: dueSoonTasks.length,
      recentTasks,
      myTaskCounts,
      projectStats,
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats.' });
  }
};
