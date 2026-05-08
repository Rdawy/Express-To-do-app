const state = { todos: [], filter: 'all' };

const todoList = document.getElementById('todoList');
const todoForm = document.getElementById('todoForm');
const alertBox = document.getElementById('alertBox');
const stats = document.getElementById('stats');
const filterButtons = document.querySelectorAll('.filter-btn');

const showAlert = (message, type = 'success') => {
  alertBox.innerHTML = `<div class="alert alert-${type} py-2">${message}</div>`;
  setTimeout(() => (alertBox.innerHTML = ''), 1800);
};

const fetchTodos = async () => {
  const query = state.filter === 'all' ? '' : `?status=${state.filter}`;
  const res = await fetch(`/api/todos${query}`);
  state.todos = await res.json();
  renderTodos();
};

const renderTodos = () => {
  if (!state.todos.length) {
    todoList.innerHTML = '<li class="list-group-item text-muted">No tasks yet. Add one above.</li>';
    stats.textContent = '0 tasks';
    return;
  }

  const completedCount = state.todos.filter((t) => t.completed).length;
  stats.textContent = `${state.todos.length} tasks • ${completedCount} done`;

  todoList.innerHTML = state.todos
    .map((todo) => `
      <li class="list-group-item todo-item d-flex justify-content-between align-items-start gap-3 ${todo.completed ? 'completed' : ''}">
        <div>
          <div class="fw-semibold todo-title">${todo.title}</div>
          <small class="text-muted">${todo.details || 'No details'} </small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm ${todo.completed ? 'btn-warning' : 'btn-success'}" data-action="toggle" data-id="${todo.id}">
            ${todo.completed ? 'Undo' : 'Done'}
          </button>
          <button class="btn btn-sm btn-danger" data-action="delete" data-id="${todo.id}">Delete</button>
        </div>
      </li>`)
    .join('');
};

todoForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const details = document.getElementById('details').value;

  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, details })
  });

  if (!res.ok) {
    showAlert('Could not add task.', 'danger');
    return;
  }

  todoForm.reset();
  showAlert('Task added!');
  fetchTodos();
});

todoList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const { id, action } = button.dataset;

  if (action === 'delete') {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    showAlert('Task removed.');
    fetchTodos();
    return;
  }

  if (action === 'toggle') {
    const todo = state.todos.find((item) => item.id === id);
    if (!todo) return;

    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed })
    });

    showAlert(todo.completed ? 'Task marked active.' : 'Task completed.');
    fetchTodos();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    state.filter = button.dataset.filter;
    fetchTodos();
  });
});

document.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth) * 100;
  const y = (event.clientY / window.innerHeight) * 100;
  document.querySelector('.aurora').style.setProperty('--x', `${x}%`);
  document.querySelector('.aurora').style.setProperty('--y', `${y}%`);
});

fetchTodos();
