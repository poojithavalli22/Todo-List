class TodoList {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    bindEvents() {
        // Add todo
        document.getElementById('addBtn').addEventListener('click', () => this.addTodo());
        document.getElementById('todoInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Clear completed
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.clearCompleted();
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text) {
            const todo = {
                id: Date.now(),
                text: text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.todos.unshift(todo);
            this.saveToStorage();
            this.render();
            this.updateStats();
            
            input.value = '';
            input.focus();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
            this.updateStats();
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        if (todoElement) {
            todoElement.classList.add('removing');
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToStorage();
                this.render();
                this.updateStats();
            }, 300);
        }
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToStorage();
        this.render();
        this.updateStats();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.classList.add('show');
            return;
        }

        emptyState.classList.remove('show');
        todoList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
    }

    createTodoElement(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="todoApp.toggleTodo(${todo.id})">
                    <i class="fas fa-check"></i>
                </div>
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <button class="todo-delete" onclick="todoApp.deleteTodo(${todo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `;
    }

    updateStats() {
        const totalTasks = this.todos.length;
        const completedTasks = this.todos.filter(t => t.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        const taskCountElement = document.getElementById('taskCount');
        const clearCompletedBtn = document.getElementById('clearCompleted');
        
        if (this.currentFilter === 'all') {
            taskCountElement.textContent = `${activeTasks} of ${totalTasks} tasks remaining`;
        } else if (this.currentFilter === 'active') {
            taskCountElement.textContent = `${activeTasks} active tasks`;
        } else {
            taskCountElement.textContent = `${completedTasks} completed tasks`;
        }
        
        // Show/hide clear completed button
        clearCompletedBtn.style.display = completedTasks > 0 ? 'block' : 'none';
    }

    saveToStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
const todoApp = new TodoList();

// Add some sample todos for demonstration
if (todoApp.todos.length === 0) {
    const sampleTodos = [
        { id: 1, text: 'Welcome to your Todo List!', completed: false, createdAt: new Date().toISOString() },
        { id: 2, text: 'Click the checkbox to mark as complete', completed: true, createdAt: new Date().toISOString() },
        { id: 3, text: 'Use the filter buttons to view different tasks', completed: false, createdAt: new Date().toISOString() }
    ];
    todoApp.todos = sampleTodos;
    todoApp.saveToStorage();
    todoApp.render();
    todoApp.updateStats();
} 