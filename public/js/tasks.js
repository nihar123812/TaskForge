let allTasks = [];
let allProjects = [];
let allUsers = [];
let currentTaskId = null;
let searchTimeout = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  setupSidebar();
  await loadFilters();
  await loadTasks();
});

async function loadFilters() {
  try {
    const pData = await API.get('/projects');
    allProjects = pData.projects;
    const sel = document.getElementById('filterProject');
    allProjects.forEach(p => { sel.innerHTML += `<option value="${p._id}">${p.name}</option>`; });
    const uData = await API.get('/auth/users');
    allUsers = uData.users;
  } catch (err) { console.error(err); }
}

async function loadTasks() {
  try {
    const params = new URLSearchParams();
    const project = document.getElementById('filterProject').value;
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const search = document.getElementById('filterSearch').value;
    if (project) params.set('project', project);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (search) params.set('search', search);
    const data = await API.get(`/tasks?${params}`);
    allTasks = data.tasks;
    renderBoard();
  } catch (err) { console.error(err); }
}

function debounceSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadTasks, 400); }

function renderBoard() {
  const statuses = [
    { key: 'todo', label: 'To Do', icon: '📋' },
    { key: 'in-progress', label: 'In Progress', icon: '🔄' },
    { key: 'review', label: 'Review', icon: '👀' },
    { key: 'done', label: 'Done', icon: '✅' }
  ];
  const board = document.getElementById('taskBoard');
  board.innerHTML = statuses.map(s => {
    const tasks = allTasks.filter(t => t.status === s.key);
    return `<div class="task-column">
      <div class="task-column-header"><h4>${s.icon} ${s.label}</h4><span class="task-count">${tasks.length}</span></div>
      ${tasks.length ? tasks.map(t => renderTaskCard(t)).join('') : '<div class="empty-state" style="padding:20px"><p style="font-size:0.8rem">No tasks</p></div>'}
    </div>`;
  }).join('');
}

function renderTaskCard(t) {
  const overdue = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done';
  return `<div class="task-item" onclick="openEditTask('${t._id}')">
    <div class="task-title">${t.title}</div>
    <div class="task-project">${t.project?.name || ''}</div>
    ${t.description ? `<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px">${t.description.slice(0,80)}${t.description.length>80?'...':''}</div>` : ''}
    <div class="task-meta">
      <span class="priority-badge priority-${t.priority}">${t.priority}</span>
      ${t.dueDate ? `<span class="${overdue ? 'overdue-badge' : 'due-date'}">${overdue ? '⚠️ ' : ''}${formatDate(t.dueDate)}</span>` : ''}
    </div>
    ${t.assignee ? `<div style="display:flex;align-items:center;gap:6px;margin-top:10px"><img src="${t.assignee.avatar}" class="user-avatar" style="width:22px;height:22px" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(t.assignee.name)}&background=667eea&color=fff&size=22'"><span style="font-size:0.75rem;color:var(--text-secondary)">${t.assignee.name}</span></div>` : ''}
  </div>`;
}

async function openTaskModal(task = null) {
  currentTaskId = task ? task._id : null;
  document.getElementById('taskModalTitle').textContent = task ? 'Edit Task' : 'New Task';
  document.getElementById('taskSubmitBtn').textContent = task ? 'Save Changes' : 'Create Task';

  // Populate project select
  const pSel = document.getElementById('taskProject');
  pSel.innerHTML = '<option value="">Select project</option>' + allProjects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');

  // Populate assignee
  const aSel = document.getElementById('taskAssignee');
  aSel.innerHTML = '<option value="">Unassigned</option>' + allUsers.map(u => `<option value="${u._id}">${u.name} (${u.role})</option>`).join('');

  if (task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskProject').value = task.project?._id || '';
    document.getElementById('taskAssignee').value = task.assignee?._id || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
  } else {
    document.getElementById('taskForm').reset();
  }
  document.getElementById('taskModal').classList.remove('hidden');
}

function closeTaskModal() { document.getElementById('taskModal').classList.add('hidden'); }

async function openEditTask(id) {
  const task = allTasks.find(t => t._id === id);
  if (!task) return;
  // Members can only change status
  if (!API.isAdmin()) {
    const user = API.getUser();
    if (task.assignee && task.assignee._id === user.id) {
      const newStatus = prompt('Update status (todo / in-progress / review / done):', task.status);
      if (newStatus && ['todo','in-progress','review','done'].includes(newStatus)) {
        try { await API.put(`/tasks/${id}`, { status: newStatus }); await loadTasks(); } catch (err) { alert(err.message); }
      }
    } else { alert('You can only update tasks assigned to you.'); }
    return;
  }
  openTaskModal(task);
}

async function handleTaskSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('taskSubmitBtn');
  btn.disabled = true;
  try {
    const body = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      project: document.getElementById('taskProject').value,
      assignee: document.getElementById('taskAssignee').value || null,
      priority: document.getElementById('taskPriority').value,
      status: document.getElementById('taskStatus').value,
      dueDate: document.getElementById('taskDueDate').value || null
    };
    if (currentTaskId) { await API.put(`/tasks/${currentTaskId}`, body); }
    else { await API.post('/tasks', body); }
    closeTaskModal();
    await loadTasks();
  } catch (err) {
    showAlert(document.getElementById('taskAlertContainer'), err.message);
  } finally { btn.disabled = false; }
}
