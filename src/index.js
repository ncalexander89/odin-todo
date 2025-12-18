import "./style.css";
import { render } from "./modules/ui.js";
import { makeSampleState } from "./modules/sampleData.js";
import { loadState, saveState, clearState, migrateState } from "./modules/storage.js";
import {
  selectProject,
  toggleTodo,
  addTodo,
  deleteTodo,
  updateTodo,
  setEditingTodo,
  addProject,
  renameProject,
  deleteProject,
  setEditingProject,
  setView,
  setHideCompleted,
  setSortMode,
  toggleExpandedTodo
} from "./modules/state.js";

const appRoot = document.querySelector("#app");

let state = migrateState(loadState()) ?? makeSampleState();
state = migrateState(state);
saveState(state);

// migration defaults (prevents blank screen when you add new state fields)
state = {
  view: "project",
  editingTodoId: null,
  editingProjectId: null,
  hideCompleted: false,
  sortMode: "dueDate",
  ...state,
};
saveState(state);



const handlers = {
  onSelectProject(projectId) {
    state = selectProject(state, projectId);
    saveState(state);
    render(appRoot, state, handlers);
  },
  onToggleTodo(todoId) {
    state = toggleTodo(state, todoId);
    saveState(state);
    render(appRoot, state, handlers);
  },
  onAddTodo({ title, description, dueDate, priority }) {
    state = addTodo(state, {
      projectId: state.selectedProjectId,
      title,
      description,
      dueDate,
      priority,
    });
    saveState(state);
    render(appRoot, state, handlers);
  },
  onDeleteTodo(todoId) {
  state = deleteTodo(state, todoId);
  saveState(state);
  render(appRoot, state, handlers);
},

onStartEditTodo(todoId) {
  state = setEditingTodo(state, todoId);
  saveState(state);
  render(appRoot, state, handlers);
},

onCancelEditTodo() {
  state = setEditingTodo(state, null);
  saveState(state);
  render(appRoot, state, handlers);
},

onSaveEditTodo(todoId, { title, description, dueDate, priority }) {
  state = updateTodo(state, todoId, {
    title: String(title ?? "").trim(),
    description: String(description ?? "").trim(),
    dueDate: dueDate || "",
    priority: priority || "medium",
  });
  state = setEditingTodo(state, null);
  saveState(state);
  render(appRoot, state, handlers);
},
onAddProject(name) {
  state = addProject(state, name);
  saveState(state);
  render(appRoot, state, handlers);
},

onDeleteProject(projectId) {
  const project = state.projects.find((p) => p.id === projectId);
  const name = project?.name ?? "this project";

  const ok = window.confirm(`Delete "${name}"?\n\nIts todos will be moved to Inbox.`);
  if (!ok) return;

  state = deleteProject(state, projectId);
  saveState(state);
  render(appRoot, state, handlers);
},


onStartProjectRename(projectId) {
  state = setEditingProject(state, projectId);
  saveState(state);
  render(appRoot, state, handlers);
},

onCancelProjectRename() {
  state = setEditingProject(state, null);
  saveState(state);
  render(appRoot, state, handlers);
},

onSaveProjectRename(projectId, newName) {
  state = renameProject(state, projectId, newName);
  state = setEditingProject(state, null);
  saveState(state);
  render(appRoot, state, handlers);
},

onSetView(view) {
  state = setView(state, view);
  saveState(state);
  render(appRoot, state, handlers);
},

onToggleHideCompleted(checked) {
  state = setHideCompleted(state, checked);
  saveState(state);
  render(appRoot, state, handlers);
},

onSetSortMode(sortMode) {
  state = setSortMode(state, sortMode);
  saveState(state);
  render(appRoot, state, handlers);
},

onResetApp() {
  clearState();
  state = migrateState(makeSampleState());
  saveState(state);
  render(appRoot, state, handlers);
},
onToggleExpandedTodo(todoId) {
  state = toggleExpandedTodo(state, todoId);
  saveState(state);
  render(appRoot, state, handlers);
},


};


render(appRoot, state, handlers);


