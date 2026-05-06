let allProjects = [];
let currentProjectId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  setupSidebar();
  await loadProjects();
});

async function loadProjects() {
  try {
    const data = await API.get('/projects');
    allProjects = data.projects;
    renderProjects();
  } catch (err) { console.error(err); }
}

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!allProjects.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📁</div><h3>No Projects Yet</h3><p>${API.isAdmin() ? 'Create your first project to get started!' : 'You haven\'t been added to any projects yet.'}</p></div>`;
    return;
  }
  grid.innerHTML = allProjects.map(p => {
    const c = p.taskCounts || { total:0, done:0 };
    const progress = c.total > 0 ? Math.round((c.done/c.total)*100) : 0;
    return `<div class="project-card" style="--accent:${p.color}">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div class="project-name"><span class="color-dot" style="background:${p.color}"></span>${p.name}</div>
        <div style="display:flex;gap:4px">
          <button class="btn btn-icon btn-secondary" onclick="event.stopPropagation();openMembersModal('${p._id}')" title="Members">👥</button>
          ${API.isAdmin() ? `<button class="btn btn-icon btn-secondary" onclick="event.stopPropagation();editProject('${p._id}')" title="Edit">✏️</button>
          <button class="btn btn-icon btn-secondary" onclick="event.stopPropagation();deleteProject('${p._id}')" title="Delete">🗑️</button>` : ''}
        </div>
      </div>
      <div class="project-desc">${p.description || 'No description'}</div>
      <div class="project-members">${p.members.slice(0,5).map(m => `<img src="${m.avatar}" alt="${m.name}" title="${m.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=667eea&color=fff&size=30'">`).join('')}${p.members.length > 5 ? `<span style="margin-left:8px;font-size:0.8rem;color:var(--text-secondary)">+${p.members.length-5}</span>` : ''}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:0.8rem;color:var(--text-secondary)">
        <span>${c.done}/${c.total} tasks</span><span>${progress}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div style="margin-top:12px"><span class="status-badge status-${p.status === 'active' ? 'in-progress' : 'done'}">${p.status}</span></div>
    </div>`;
  }).join('');
}

function openProjectModal(project = null) {
  currentProjectId = project ? project._id : null;
  document.getElementById('projectModalTitle').textContent = project ? 'Edit Project' : 'New Project';
  document.getElementById('projectSubmitBtn').textContent = project ? 'Save Changes' : 'Create Project';
  document.getElementById('projectName').value = project ? project.name : '';
  document.getElementById('projectDesc').value = project ? project.description : '';
  document.getElementById('projectColor').value = project ? project.color : '#667eea';
  document.getElementById('projectId').value = currentProjectId || '';
  document.getElementById('projectModal').classList.remove('hidden');
}

function closeProjectModal() { document.getElementById('projectModal').classList.add('hidden'); }

function editProject(id) {
  const p = allProjects.find(p => p._id === id);
  if (p) openProjectModal(p);
}

async function handleProjectSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById('projectSubmitBtn');
  btn.disabled = true;
  try {
    const body = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDesc').value,
      color: document.getElementById('projectColor').value
    };
    if (currentProjectId) {
      await API.put(`/projects/${currentProjectId}`, body);
    } else {
      await API.post('/projects', body);
    }
    closeProjectModal();
    await loadProjects();
  } catch (err) {
    showAlert(document.getElementById('projectAlertContainer'), err.message);
  } finally { btn.disabled = false; }
}

async function deleteProject(id) {
  if (!confirm('Delete this project and all its tasks?')) return;
  try { await API.delete(`/projects/${id}`); await loadProjects(); } catch (err) { alert(err.message); }
}

async function openMembersModal(projectId) {
  currentProjectId = projectId;
  document.getElementById('membersModal').classList.remove('hidden');
  const project = allProjects.find(p => p._id === projectId);
  
  // Current members
  const el = document.getElementById('currentMembers');
  el.innerHTML = project.members.map(m => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:8px;background:var(--bg-card);margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <img src="${m.avatar}" class="user-avatar" alt="${m.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=667eea&color=fff&size=36'">
        <div><div style="font-weight:600;font-size:0.85rem">${m.name}</div><div style="font-size:0.75rem;color:var(--text-secondary)">${m.email} · ${m.role}</div></div>
      </div>
      ${API.isAdmin() && m._id !== project.owner._id ? `<button class="btn btn-sm btn-danger" onclick="removeMember('${projectId}','${m._id}')">Remove</button>` : '<span style="font-size:0.7rem;color:var(--accent-light)">OWNER</span>'}
    </div>`).join('');

  // Available users (not already members)
  if (API.isAdmin()) {
    try {
      const data = await API.get('/auth/users');
      const memberIds = project.members.map(m => m._id);
      const available = data.users.filter(u => !memberIds.includes(u._id));
      const avEl = document.getElementById('availableUsers');
      if (!available.length) { avEl.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem">All users are already members</p>'; return; }
      avEl.innerHTML = available.map(u => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px;margin-bottom:6px;border-radius:8px;background:var(--bg-card)">
          <div style="display:flex;align-items:center;gap:8px">
            <img src="${u.avatar}" class="user-avatar" style="width:28px;height:28px" alt="${u.name}">
            <span style="font-size:0.85rem">${u.name} <span style="color:var(--text-muted)">(${u.role})</span></span>
          </div>
          <button class="btn btn-sm btn-primary" onclick="addMember('${projectId}','${u._id}')">Add</button>
        </div>`).join('');
    } catch (err) { console.error(err); }
  }
}

function closeMembersModal() { document.getElementById('membersModal').classList.add('hidden'); }

async function addMember(projectId, userId) {
  try { await API.post(`/projects/${projectId}/members`, { userId }); await loadProjects(); openMembersModal(projectId); } 
  catch (err) { showAlert(document.getElementById('membersAlertContainer'), err.message); }
}

async function removeMember(projectId, userId) {
  try { await API.delete(`/projects/${projectId}/members/${userId}`); await loadProjects(); openMembersModal(projectId); } 
  catch (err) { showAlert(document.getElementById('membersAlertContainer'), err.message); }
}
