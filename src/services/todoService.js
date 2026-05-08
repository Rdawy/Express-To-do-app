const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'todos.json');

const ensureDataFile = async () => {
  try {
    await fs.access(dataPath);
  } catch {
    await fs.writeFile(dataPath, '[]', 'utf-8');
  }
};

const readTodos = async () => {
  await ensureDataFile();
  const raw = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(raw);
};

const writeTodos = async (todos) => {
  await fs.writeFile(dataPath, JSON.stringify(todos, null, 2), 'utf-8');
};

const getAll = async () => readTodos();

const create = async ({ title, details = '' }) => {
  const todos = await readTodos();
  const now = new Date().toISOString();

  const todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    details: details.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  todos.unshift(todo);
  await writeTodos(todos);
  return todo;
};

const update = async (id, payload) => {
  const todos = await readTodos();
  const index = todos.findIndex((todo) => todo.id === id);

  if (index === -1) {
    return null;
  }

  const existing = todos[index];
  const updated = {
    ...existing,
    ...payload,
    title: typeof payload.title === 'string' ? payload.title.trim() : existing.title,
    details: typeof payload.details === 'string' ? payload.details.trim() : existing.details,
    updatedAt: new Date().toISOString()
  };

  todos[index] = updated;
  await writeTodos(todos);
  return updated;
};

const remove = async (id) => {
  const todos = await readTodos();
  const filtered = todos.filter((todo) => todo.id !== id);

  if (filtered.length === todos.length) {
    return false;
  }

  await writeTodos(filtered);
  return true;
};

module.exports = {
  getAll,
  create,
  update,
  remove
};
