const todoService = require('../services/todoService');

const parseStatusFilter = (todos, status) => {
  if (status === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  if (status === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  return todos;
};

exports.getTodos = async (req, res) => {
  try {
    const todos = await todoService.getAll();
    const status = req.query.status;
    const filtered = parseStatusFilter(todos, status);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load todos' });
  }
};

exports.createTodo = async (req, res) => {
  try {
    const { title, details } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = await todoService.create({ title, details });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, details, completed } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: 'Title cannot be empty' });
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (details !== undefined) payload.details = details;
    if (completed !== undefined) payload.completed = Boolean(completed);

    const updated = await todoService.update(id, payload);

    if (!updated) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update todo' });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const deleted = await todoService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete todo' });
  }
};
