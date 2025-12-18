export function makeSampleState() {
  return {
    selectedProjectId: "inbox",
    editingTodoId: null,
    editingProjectId: null,
    view: "project", // "project" | "all" | "today" | "week"
    hideCompleted: false,
sortMode: "dueDate", // "dueDate" | "priority" | "created"

    projects: [
      { id: "inbox", name: "Inbox" },
      { id: "work", name: "Work" },
    ],
    todos: [
      {
        id: "t1",
        projectId: "inbox",
        title: "Set up project structure",
        description: "Webpack + modules + localStorage",
        dueDate: "2025-12-20",
        priority: "medium",
        completed: false,
      },
      {
        id: "t2",
        projectId: "work",
        title: "Write UI render functions",
        description: "Sidebar + list",
        dueDate: "2025-12-22",
        priority: "high",
        completed: true,
      },
    ],
  };
}
