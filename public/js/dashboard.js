document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  setupSidebar();
  await loadDashboard();
});

async function loadDashboard() {
  try {
    const data = await API.get('/dashboard/stats');
    renderStats(data);
    renderOverdue(data.overdueTasks, data.overdueCount);
    renderDueSoon(data.dueSoonTasks, data.dueSoonCount);
    renderProjectProgress(data.projectStats);
    renderRecentTasks(data.recentTasks);
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

function renderStats(data) {
  const s = data.statusCounts;
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = `
    <div class="stat-card" style="animation-delay:0.1s"><div class="stat-icon">📁</div><div class="stat-value">${data.totalProjects}</div><div class="stat-label">Total Projects</div></div>
    <div class="stat-card" style="animation-delay:0.2s"><div class="stat-icon">📋</div><div class="stat-value">${s.total}</div><div class="stat-label">Total Tasks</div></div>
    <div class="stat-card" style="animation-delay:0.3s"><div class="stat-icon">🔄</div><div class="stat-value">${s['in-progress'] + s.review}</div><div class="stat-label">In Progress</div></div>
    <div class="stat-card" style="animation-delay:0.4s"><div class="stat-icon">✅</div><div class="stat-value">${s.done}</div><div class="stat-label">Completed</div></div>
    <div class="stat-card" style="animation-delay:0.5s"><div class="stat-icon">⚠️</div><div class="stat-value">${data.overdueCount}</div><div class="stat-label">Overdue</div></div>
  `;
}

function renderOverdue(tasks, count) {
  document.getElementById('overdueCount').textContent = count;
  const el = document.getElementById('overdueList');
  if (!tasks.length) { el.innerHTML = '<div class="empty-state"><p>No overdue tasks 🎉</p></div>'; return; }
  el.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-title">${t.title}</div>
      <div class="task-meta">
        <span class="priority-badge priority-${t.priority}">${t.priority}</span>
        <span class="overdue-badge">Due ${formatDate(t.dueDate)}</span>
      </div>
    </div>`).join('');
}

function renderDueSoon(tasks, count) {
  document.getElementById('dueSoonCount').textContent = count;
  const el = document.getElementById('dueSoonList');
  if (!tasks.length) { el.innerHTML = '<div class="empty-state"><p>Nothing due soon</p></div>'; return; }
  el.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-title">${t.title}</div>
      <div class="task-meta">
        <span class="priority-badge priority-${t.priority}">${t.priority}</span>
        <span class="due-date">Due ${formatDate(t.dueDate)}</span>
      </div>
    </div>`).join('');
}

function renderProjectProgress(projects) {
  const el = document.getElementById('projectProgress');
  if (!projects.length) { el.innerHTML = '<div class="empty-state"><p>No projects yet</p></div>'; return; }
  el.innerHTML = projects.map(p => `
    <div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span><span class="color-dot" style="background:${p.color}"></span>${p.name}</span>
        <span style="color:var(--text-secondary);font-size:0.85rem">${p.completedTasks}/${p.totalTasks} tasks · ${p.progress}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${p.progress}%"></div></div>
    </div>`).join('');
}

function renderRecentTasks(tasks) {
  const el = document.getElementById('recentTasks');
  if (!tasks.length) { el.innerHTML = '<div class="empty-state"><p>No tasks yet</p></div>'; return; }
  el.innerHTML = `<div class="table-container"><table><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due</th></tr></thead><tbody>
    ${tasks.map(t => `<tr>
      <td>${t.title}</td>
      <td>${t.project?.name || '—'}</td>
      <td><span class="status-badge status-${t.status}">${t.status}</span></td>
      <td><span class="priority-badge priority-${t.priority}">${t.priority}</span></td>
      <td>${t.dueDate ? (isOverdue(t.dueDate) && t.status !== 'done' ? '<span class="overdue-badge">' + formatDate(t.dueDate) + '</span>' : formatDate(t.dueDate)) : '—'}</td>
    </tr>`).join('')}</tbody></table></div>`;
}
