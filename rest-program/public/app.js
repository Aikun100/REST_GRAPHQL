document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const taskForm = document.getElementById('taskForm');
  const taskTitle = document.getElementById('taskTitle');
  const taskDesc = document.getElementById('taskDesc');
  const taskPriority = document.getElementById('taskPriority');
  const taskList = document.getElementById('taskList');
  const statsCount = document.getElementById('statsCount');
  
  const detailPanel = document.getElementById('detailPanel');
  const detailContent = document.getElementById('detailContent');
  const closeDetailBtn = document.getElementById('closeDetailBtn');

  const inspectorMeta = document.getElementById('inspectorMeta');
  const reqInspectorCode = document.getElementById('reqInspectorCode');
  const resInspectorCode = document.getElementById('resInspectorCode');
  
  const toast = document.getElementById('toast');

  let activeTaskId = null;

  // 1. Initial Load: GET Tasks
  fetchTasks();

  // Close details panel event
  closeDetailBtn.addEventListener('click', deselectTasks);

  // Form submission: POST new task
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = taskTitle.value.trim();
    const description = taskDesc.value.trim();
    const priority = taskPriority.value;

    const payload = { title, description, priority };

    logInspector('POST', '/api/tasks', {
      'Content-Type': 'application/json'
    }, payload);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        taskTitle.value = '';
        taskDesc.value = '';
        taskPriority.value = 'Medium';
        showToast('Task Created Successfully!');
        fetchTasks();
      } else {
        showToast(result.error || 'Failed to create task.', true);
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
      showToast('Network error, check server terminal.', true);
    }
  });

  // Fetch all tasks (GET method)
  async function fetchTasks() {
    logInspector('GET', '/api/tasks', { 'Accept': 'application/json' });
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        renderTasks(result);
      } else {
        taskList.innerHTML = `<div class="list-placeholder"><p class="text-error">Error fetching tasks</p></div>`;
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
      taskList.innerHTML = `<div class="list-placeholder"><p class="text-error">Server disconnected</p></div>`;
    }
  }

  // Fetch single task details (GET method by ID)
  async function fetchTaskDetails(id) {
    logInspector('GET', `/api/tasks/${id}`, { 'Accept': 'application/json' });
    try {
      const response = await fetch(`/api/tasks/${id}`);
      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        renderDetailsEditor(result);
      } else {
        detailContent.innerHTML = `<div class="detail-placeholder"><p>Error retrieving task details.</p></div>`;
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
    }
  }

  // Toggle Task Status (PUT status method)
  async function toggleTaskStatus(id, completed) {
    const payload = { completed };
    logInspector('PUT', `/api/tasks/${id}`, {
      'Content-Type': 'application/json'
    }, payload);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        showToast(completed ? 'Task Completed!' : 'Task Reopened!');
        fetchTasks();
        // If this task is active in details panel, reload details editor
        if (activeTaskId === id) {
          fetchTaskDetails(id);
        }
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
    }
  }

  // Update Task Details (PUT edits method)
  async function updateTaskDetails(id, title, description, priority) {
    const payload = { title, description, priority };
    logInspector('PUT', `/api/tasks/${id}`, {
      'Content-Type': 'application/json'
    }, payload);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        showToast('Task Details Saved!');
        fetchTasks();
      } else {
        showToast(result.error || 'Failed to save changes.', true);
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
    }
  }

  // Delete Task (DELETE method)
  async function deleteTask(id) {
    logInspector('DELETE', `/api/tasks/${id}`, {});
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      logInspectorResponse(response.status, response.statusText, result);

      if (response.ok) {
        showToast('Task Deleted!');
        deselectTasks();
        fetchTasks();
      } else {
        showToast(result.error || 'Failed to delete task.', true);
      }
    } catch (err) {
      console.error(err);
      logInspectorResponse(0, 'Network Error', { error: err.message });
    }
  }

  // Rendering Helpers
  function renderTasks(tasks) {
    // Stats calculation
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    statsCount.textContent = `${completed}/${total}`;

    if (total === 0) {
      taskList.innerHTML = `
        <div class="list-placeholder">
          <p>No tasks found. Add a task to start!</p>
        </div>
      `;
      return;
    }

    taskList.innerHTML = '';
    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card p-${task.priority.toLowerCase()} ${task.completed ? 'completed' : ''} ${activeTaskId === task.id ? 'active' : ''}`;
      card.dataset.id = task.id;

      card.innerHTML = `
        <label class="checkbox-container" onclick="event.stopPropagation();">
          <input type="checkbox" ${task.completed ? 'checked' : ''}>
          <span class="checkmark"></span>
        </label>
        <div class="task-card-content">
          <span class="task-card-title">${escapeHtml(task.title)}</span>
          <div class="task-card-meta">
            <span class="task-card-id">${task.id}</span>
            <span class="priority-dot"></span>
          </div>
        </div>
      `;

      // Select Card event
      card.addEventListener('click', () => {
        document.querySelectorAll('.task-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        activeTaskId = task.id;
        fetchTaskDetails(task.id);
      });

      // Toggle checkbox event
      const checkbox = card.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', (e) => {
        toggleTaskStatus(task.id, e.target.checked);
      });

      taskList.appendChild(card);
    });
  }

  function renderDetailsEditor(task) {
    detailContent.className = 'detail-content';
    detailContent.innerHTML = `
      <div class="detail-editor">
        <div class="form-group">
          <label>Task ID</label>
          <input type="text" value="${task.id}" disabled style="opacity: 0.5; font-family: 'Fira Code', monospace;">
        </div>

        <div class="form-group">
          <label for="detailTitle">Title</label>
          <input type="text" id="detailTitle" value="${escapeHtml(task.title)}">
        </div>

        <div class="form-group">
          <label for="detailDesc">Description</label>
          <textarea id="detailDesc" rows="4">${escapeHtml(task.description)}</textarea>
        </div>

        <div class="form-group">
          <label for="detailPriority">Priority</label>
          <select id="detailPriority">
            <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High Priority</option>
            <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium Priority</option>
            <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low Priority</option>
          </select>
        </div>

        <div class="form-group">
          <label>Status</label>
          <div style="font-size: 0.95rem; font-weight: 600; color: ${task.completed ? 'var(--success)' : 'var(--warning)'}">
            ${task.completed ? '✔ Completed' : '⚙ In Progress'}
          </div>
        </div>

        <div class="detail-actions">
          <button id="saveDetailBtn" class="btn primary-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Save</span>
          </button>
          
          <button id="deleteDetailBtn" class="btn danger-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;

    // Save changes click event
    document.getElementById('saveDetailBtn').addEventListener('click', () => {
      const uTitle = document.getElementById('detailTitle').value.trim();
      const uDesc = document.getElementById('detailDesc').value.trim();
      const uPriority = document.getElementById('detailPriority').value;

      if (!uTitle) {
        showToast('Title is required!', true);
        return;
      }

      updateTaskDetails(task.id, uTitle, uDesc, uPriority);
    });

    // Delete click event
    document.getElementById('deleteDetailBtn').addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete Task ${task.id}?`)) {
        deleteTask(task.id);
      }
    });
  }

  function deselectTasks() {
    document.querySelectorAll('.task-card').forEach(c => c.classList.remove('active'));
    activeTaskId = null;
    detailContent.className = 'detail-content empty';
    detailContent.innerHTML = `
      <div class="detail-placeholder">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <p>Select an active task card from the center list to view details or modify values.</p>
      </div>
    `;
  }

  // Toast Alert popup helper
  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.background = isError ? 'var(--error)' : 'var(--success)';
    toast.classList.remove('hidden');

    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  // HTTP Inspector Helpers
  function logInspector(method, endpoint, headers, body = null) {
    inspectorMeta.innerHTML = `<span class="inspector-status-badge">Sending ${method} Request...</span>`;
    
    const requestLog = {
      Request: `${method} ${endpoint}`,
      Headers: headers,
      Body: body
    };

    reqInspectorCode.textContent = JSON.stringify(requestLog, null, 2);
    resInspectorCode.textContent = '// Waiting for response...';
  }

  function logInspectorResponse(statusCode, statusText, responseBody) {
    let statusClass = 'status-2xx';
    if (statusCode >= 400) {
      statusClass = 'status-4xx';
    } else if (statusCode === 0) {
      statusClass = 'status-4xx';
    }

    inspectorMeta.innerHTML = `
      <span class="inspector-status-badge ${statusClass}">
        HTTP Status: ${statusCode} ${statusText}
      </span>
    `;

    resInspectorCode.textContent = JSON.stringify(responseBody, null, 2);
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
