const KEY = "odin_todo_state_v1";

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}

// ensures old saved states still work after you add new fields
export function migrateState(state) {
  if (!state) return null;

  const migrated = {
    selectedProjectId: "inbox",
    editingTodoId: null,
    editingProjectId: null,
    expandedTodoId: null,
    view: "project",
    hideCompleted: false,
    sortMode: "dueDate",
    projects: [],
    todos: [],
    ...state,
  };

  // ensure Inbox exists
  const hasInbox = migrated.projects.some((p) => p.id === "inbox");
  if (!hasInbox) migrated.projects.unshift({ id: "inbox", name: "Inbox" });

  // ensure selected project exists
  const selectedExists = migrated.projects.some((p) => p.id === migrated.selectedProjectId);
  if (!selectedExists) migrated.selectedProjectId = "inbox";

  return migrated;
}
