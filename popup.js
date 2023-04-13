let todoList = document.getElementById("todoList");
let todoInput = document.getElementById("todoInput");
let addButton = document.getElementById("addButton");

function init() {
  addButton.addEventListener("click", addTodo);
  todoList.addEventListener("click", deleteTodo);
  getTodos();
}

todoInput.addEventListener("keypress", (event) => {
    const value = todoInput.value.trim();
    if (event.key === "Enter" && value) {
        addTodo(value);
        todoInput.value = "";
    }
  });

function getTodos() {
  chrome.storage.sync.get("todos", function (result) {
    if (result.todos) {
      todoList.innerHTML = "";
      result.todos.forEach(function (todo) {
        renderTodoElement(todo);
      });
    }
  });
}

function renderTodoElement(todo) {
    const li = document.createElement("li");
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.checked = todo.completed;
    checkBox.addEventListener("change", function () {
      updateTodoCompletion(todo.id, !todo.completed);
      if (!todo.completed) {
        todoList.appendChild(li);
      } else {
        const lastCompletedItem = todoList.querySelector('.completed');
        if (lastCompletedItem) {
          todoList.insertBefore(li, lastCompletedItem.nextSibling);
        } else {
          todoList.insertBefore(li, null);
        }
      }
    });
    const span = document.createElement("span");
    span.innerHTML = todo.title;
    const button = document.createElement("button");
    button.innerHTML = "X";
    button.addEventListener("click", function () {
      deleteTodoFromStorage(todo.id);
      li.remove();
    });
  
    li.appendChild(checkBox);
    li.appendChild(span);
    li.appendChild(button);
    li.setAttribute("data-id", todo.id);
  
    if (todo.completed) {
      li.classList.add('completed');
      const lastCompletedItem = todoList.querySelector('.completed');
      if (lastCompletedItem) {
        todoList.insertBefore(li, lastCompletedItem.nextSibling);
      } else {
        todoList.insertBefore(li, null);
      }
    } else {
      todoList.insertBefore(li, null);
    }
  }
  
  

function addTodo() {
  const title = todoInput.value.trim();
  if (title !== "") {
    const todo = {
      id: Date.now(),
      title: title,
      completed: false,
    };
    saveTodoToStorage(todo);
    renderTodoElement(todo);
    todoInput.value = "";
  }
}

function saveTodoToStorage(todo) {
  chrome.storage.sync.get("todos", function (result) {
    const todos = result.todos || [];
    todos.push(todo);
    chrome.storage.sync.set({ todos: todos });
  });
}

function deleteTodoFromStorage(id) {
  chrome.storage.sync.get("todos", function (result) {
    const todos = result.todos || [];
    const updatedTodos = todos.filter(function (todo) {
      return todo.id !== id;
    });
    chrome.storage.sync.set({ todos: updatedTodos });
  });
}

function deleteTodo(event) {
  if (event.target.classList.contains("delete-button")) {
    const todoItem = event.target.parentElement;
    const id = todoItem.getAttribute("data-id");
    deleteTodoFromStorage(id);
    todoItem.remove();
  }
}

function updateTodoCompletion(id, completed) {
  chrome.storage.sync.get("todos", function (result) {
    const todos = result.todos || [];
    const updatedTodos = todos.map(function (todo) {
      if (todo.id === id) {
        return { ...todo, completed: completed };
      }
      return todo;
    });
    chrome.storage.sync.set({ todos: updatedTodos });
  });
}

document.addEventListener("DOMContentLoaded", init);
