function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [k, v] of Object.entries(attrs)) {
    if (k === "className") node.className = v;
    else if (k === "checked") node.checked = Boolean(v);
    else if (k === "value") node.value = v ?? "";
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (v === true) {
      node.setAttribute(k, "");
    } else if (v != null && v !== false) {
      node.setAttribute(k, String(v));
    }
  }

  for (const child of children) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }

  return node;
}

function localYYYYMMDD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isDueToday(isoDate) {
  if (!isoDate) return false;              // isoDate is already "YYYY-MM-DD" from <input type="date">
  return isoDate === localYYYYMMDD();
}


function isDueThisWeek(isoDate) {
  if (!isoDate) return false;

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // local midnight
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const [y, m, d] = isoDate.split("-").map(Number);
  const due = new Date(y, m - 1, d); // local midnight of due date

  return due >= start && due < end;
}



export function render(appRoot, state, handlers) {
  appRoot.innerHTML = "";

const sidebar = el(
  "aside",
  { className: "sidebar" },
  el("h2", {}, "Projects"),

  // Add Project form
  el(
    "form",
    {
      className: "project-form",
      onSubmit: (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        handlers.onAddProject(fd.get("projectName"));
        e.target.reset();
      },
    },
    el("input", { name: "projectName", placeholder: "New project…", required: true }),
    el("button", { type: "submit" }, "Add")
  ),

  // Project list
  el(
    "ul",
    { className: "project-list" },
    ...state.projects.map((p) => {
      const isActive = p.id === state.selectedProjectId;
      const isEditing = p.id === state.editingProjectId;

      if (isEditing) {
        return el(
          "li",
          { className: "project editing" },
          el(
            "form",
            {
              className: "project-edit-form",
              onSubmit: (e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                handlers.onSaveProjectRename(p.id, fd.get("name"));
              },
            },
            el("input", { name: "name", value: p.name }),
            el("button", { type: "submit" }, "Save"),
            el("button", { type: "button", onClick: () => handlers.onCancelProjectRename() }, "Cancel")
          )
        );
      }

      return el(
        "li",
        { className: isActive ? "project active" : "project" },
        el(
          "div",
          {
            className: "project-row",
            onClick: () => handlers.onSelectProject(p.id),
          },
          el("span", {}, p.name)
        ),
        p.id === "inbox"
          ? null
          : el(
              "div",
              { className: "project-actions" },
              el("button", { type: "button", onClick: () => handlers.onStartProjectRename(p.id) }, "Rename"),
              el("button", { type: "button", onClick: () => handlers.onDeleteProject(p.id) }, "Delete")
            )
      );
    })
  )
);


const selectedProject = state.projects.find((p) => p.id === state.selectedProjectId) ?? null;

const projectNameById = new Map(state.projects.map((p) => [p.id, p.name]));


// compute visible todos by view
const todosForProject = state.todos.filter((t) => t.projectId === state.selectedProjectId);

let visibleTodos = todosForProject;
if (state.view === "all") visibleTodos = state.todos;
else if (state.view === "today") visibleTodos = state.todos.filter((t) => isDueToday(t.dueDate));
else if (state.view === "week") visibleTodos = state.todos.filter((t) => isDueThisWeek(t.dueDate));

let list = visibleTodos;

if (state.hideCompleted) {
  list = list.filter((t) => !t.completed);
}

function dueKey(t) {
  // empty due dates sort last
  return t.dueDate ? t.dueDate : "9999-12-31";
}

function priorityRank(p) {
  if (p === "high") return 0;
  if (p === "medium") return 1;
  return 2; // low
}

if (state.sortMode === "priority") {
  list = [...list].sort((a, b) => {
    const pr = priorityRank(a.priority) - priorityRank(b.priority);
    if (pr !== 0) return pr;
    return dueKey(a).localeCompare(dueKey(b));
  });
} else if (state.sortMode === "dueDate") {
  list = [...list].sort((a, b) => {
    const dd = dueKey(a).localeCompare(dueKey(b));
    if (dd !== 0) return dd;
    return priorityRank(a.priority) - priorityRank(b.priority);
  });
} else {
  // "created": do nothing if you're already unshifting new todos to the front
}


const main = el(
  "main",
  { className: "main" },
  el("h1", {}, selectedProject ? selectedProject.name : "Todos"),

  el(
    "div",
    { className: "view-tabs" },
    el("button", {
      type: "button",
      className: state.view === "project" ? "tab active" : "tab",
      onClick: () => handlers.onSetView("project"),
    }, "Project"),
    el("button", {
      type: "button",
      className: state.view === "all" ? "tab active" : "tab",
      onClick: () => handlers.onSetView("all"),
    }, "All"),
    el("button", {
      type: "button",
      className: state.view === "today" ? "tab active" : "tab",
      onClick: () => handlers.onSetView("today"),
    }, "Today"),
    el("button", {
      type: "button",
      className: state.view === "week" ? "tab active" : "tab",
      onClick: () => handlers.onSetView("week"),
    }, "This Week")
  ),

  el(
  "div",
  { className: "controls" },

  el("label", { className: "control" },
    el("input", {
      type: "checkbox",
      checked: state.hideCompleted,
      onChange: (e) => handlers.onToggleHideCompleted(e.target.checked),
    }),
    " Hide completed"
  ),

  el("label", { className: "control" }, "Sort: ",
    el(
      "select",
      {
        value: state.sortMode,
        onChange: (e) => handlers.onSetSortMode(e.target.value),
      },
      el("option", { value: "dueDate" }, "Due date"),
      el("option", { value: "priority" }, "Priority"),
      el("option", { value: "created" }, "Created (newest first)")
    )
  )
),



    // Add Todo form
    el(
      "form",
      {
        className: "todo-form",
        onSubmit: (e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          handlers.onAddTodo({
            title: fd.get("title"),
            description: fd.get("description"),
            dueDate: fd.get("dueDate"),
            priority: fd.get("priority"),
          });
          e.target.reset();
        },
      },
      el(
        "div",
        { className: "row" },
        el("input", { name: "title", placeholder: "New todo title…", required: true }),
        el(
          "select",
          { name: "priority" },
          el("option", { value: "low" }, "low"),
          el("option", { value: "medium" }, "medium"),
          el("option", { value: "high" }, "high")
        ),
        el("input", { name: "dueDate", type: "date" }),
        el("button", { type: "submit" }, "Add")
      ),
      el("textarea", { name: "description", placeholder: "Description (optional)…", rows: 2 })
    ),

    // Todo list
    el(
      "div",
      { className: "todo-list" },
      list.length === 0
        ? el("p", {}, "No todos yet. (Soon.)")
        : el(
            "ul",
            {},
            ...list.map((t) => {
              const isEditing = t.id === state.editingTodoId;

              if (isEditing) {
                return el(
                  "li",
                  { className: "todo editing" },
                  el(
                    "form",
                    {
                      className: "edit-form",
                      onSubmit: (e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        handlers.onSaveEditTodo(t.id, {
                          title: fd.get("title"),
                          description: fd.get("description"),
                          dueDate: fd.get("dueDate"),
                          priority: fd.get("priority"),
                        });
                      },
                    },
                    el(
                      "div",
                      { className: "row" },
                      el("input", { name: "title", value: t.title }),
                      el(
                        "select",
                        { name: "priority", value: t.priority || "medium" },
                        el("option", { value: "low" }, "low"),
                        el("option", { value: "medium" }, "medium"),
                        el("option", { value: "high" }, "high")
                      ),
                      el("input", { name: "dueDate", type: "date", value: t.dueDate || "" }),
                      el("button", { type: "submit" }, "Save")
                    ),
                    el("textarea", { name: "description", rows: 2 }, t.description || ""),
                    el(
                      "div",
                      { className: "actions" },
                      el("button", { type: "button", onClick: () => handlers.onCancelEditTodo() }, "Cancel")
                    )
                  )
                );
              }

              return el(
                "li",
                { className: t.completed ? "todo done" : "todo" },
                el(
                  "div",
                  { className: "todo-top" },
                  el(
                    "label",
                    {},
                    el("input", {
                      type: "checkbox",
                      checked: t.completed,
                      onChange: () => handlers.onToggleTodo(t.id),
                    }),
                    " ",
el(
  "strong",
  {},
  t.title,
  state.view !== "project"
    ? el("span", { className: "badge" }, ` [${projectNameById.get(t.projectId) ?? "Unknown"}]`)
    : null
),
                    " ",
                    el(
                      "span",
                      { className: "meta" },
                      `(${t.priority}${t.dueDate ? `, due ${t.dueDate}` : ""})`
                    )
                  ),
                  el(
                    "div",
                    { className: "actions" },
                    el("button", { type: "button", onClick: () => handlers.onStartEditTodo(t.id) }, "Edit"),
                    el("button", { type: "button", onClick: () => handlers.onDeleteTodo(t.id) }, "Delete")
                  )
                ),
                t.description ? el("div", { className: "desc" }, t.description) : null
              );
            })
          )
    )
  );

  appRoot.append(el("div", { className: "layout" }, sidebar, main));
}

