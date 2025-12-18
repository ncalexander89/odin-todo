export function selectProject(state, projectId) {
  return { ...state, selectedProjectId: projectId };
}

export function toggleTodo(state, todoId) {
  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId ? { ...t, completed: !t.completed } : t
    ),
  };
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random()}`;
}

export function addTodo(state, { projectId, title, description, dueDate, priority }) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return state;

  const todo = {
    id: uid(),
    projectId,
    title: trimmedTitle,
    description: (description ?? "").trim(),
    dueDate: dueDate || "",
    priority: priority || "medium",
    completed: false,
  };

  return { ...state, todos: [todo, ...state.todos] };
}

export function deleteTodo(state, todoId) {
  return { ...state, todos: state.todos.filter((t) => t.id !== todoId) };
}

export function updateTodo(state, todoId, patch) {
  return {
    ...state,
    todos: state.todos.map((t) =>
      t.id === todoId ? { ...t, ...patch } : t
    ),
  };
}

export function setEditingTodo(state, todoIdOrNull) {
  return { ...state, editingTodoId: todoIdOrNull };
}

export function addProject(state, name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return state;

  const exists = state.projects.some(
    (p) => p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return state;

  const project = { id: uid(), name: trimmed };
  return {
    ...state,
    projects: [...state.projects, project],
    selectedProjectId: project.id,
  };
}

export function renameProject(state, projectId, newName) {
  const trimmed = String(newName ?? "").trim();
  if (!trimmed) return state;

  // prevent renaming Inbox
  if (projectId === "inbox") return state;

  const exists = state.projects.some(
    (p) => p.id !== projectId && p.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return state;

  return {
    ...state,
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, name: trimmed } : p
    ),
  };
}

export function deleteProject(state, projectId) {
  if (projectId === "inbox") return state; // never delete Inbox

  const inboxId = "inbox";
  const projects = state.projects.filter((p) => p.id !== projectId);

  // move todos to Inbox
  const todos = state.todos.map((t) =>
    t.projectId === projectId ? { ...t, projectId: inboxId } : t
  );

  const selectedProjectId =
    state.selectedProjectId === projectId ? inboxId : state.selectedProjectId;

  return { ...state, projects, todos, selectedProjectId };
}

export function setEditingProject(state, projectIdOrNull) {
  return { ...state, editingProjectId: projectIdOrNull };
}

export function setView(state, view) {
  return { ...state, view, editingTodoId: null };
}

export function setHideCompleted(state, hideCompleted) {
  return { ...state, hideCompleted: Boolean(hideCompleted) };
}

export function setSortMode(state, sortMode) {
  return { ...state, sortMode };
}

