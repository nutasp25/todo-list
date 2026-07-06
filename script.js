const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const addButton = document.getElementById("addButton");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const priorityButtons = document.querySelectorAll(".priority-btn");
const todayCount = document.getElementById("todayCount");
const allCount = document.getElementById("allCount");
const completedCount = document.getElementById("completedCount");
const activeCount = document.getElementById("activeCount");
const themeButton = document.getElementById("themeButton");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");
const deletedButton = document.getElementById("deletedButton");

let tasks = [];
let deletedTasks = [];

function loadData() {
    try {
        const savedTasks = localStorage.getItem("tasks");
        const savedDeleted = localStorage.getItem("deletedTasks");
        
        tasks = savedTasks ? JSON.parse(savedTasks) : [];
        deletedTasks = savedDeleted ? JSON.parse(savedDeleted) : [];
    } catch (e) {
        tasks = [];
        deletedTasks = [];
    }
}

loadData();

let selectedPriority = "low";

function autoDeleteOldTasks() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const filtered = deletedTasks.filter(task => {
        if (!task.deletedAt) return true;
        const deletedDate = new Date(task.deletedAt);
        return deletedDate > thirtyDaysAgo;
    });
    
    if (filtered.length !== deletedTasks.length) {
        deletedTasks = filtered;
        saveData();
    }
}

autoDeleteOldTasks();

function saveData() {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
        localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
    } catch (e) {
        console.error("Ошибка сохранения:", e);
    }
}

priorityButtons.forEach(button => {
    button.addEventListener("click", function () {
        priorityButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        selectedPriority = this.dataset.priority;
    });
});

addButton.addEventListener("click", addTask);
taskInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") addTask();
});

searchInput.addEventListener("input", renderTasks);

function addTask() {
    const title = taskInput.value.trim();
    if (title === "") {
        alert("Введите название задачи.");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        date: taskDate.value,
        priority: selectedPriority,
        completed: false,
        created: new Date().toLocaleString("ru-RU")
    };

    tasks.unshift(newTask);
    saveData();
    renderTasks();
    taskInput.value = "";
    taskDate.value = "";
}

function renderTasks() {
    taskList.innerHTML = "";
    const search = searchInput.value.toLowerCase();
    const filtered = tasks.filter(task => task.title.toLowerCase().includes(search));

    if (filtered.length === 0) {
        taskList.innerHTML = `<div style="text-align:center;padding:40px;color:gray;">✨ Задач пока нет</div>`;
        updateStatistics();
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        const left = document.createElement("div");
        left.className = "task-left";

        const circle = document.createElement("div");
        circle.className = "priority-color " + task.priority;

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h4");
        title.textContent = task.title;
        if (task.completed) title.classList.add("completed");

        const date = document.createElement("p");
        date.textContent = task.date ? "📅 Выполнить до: " + formatDate(task.date) : "Дата не выбрана";

        info.appendChild(title);
        info.appendChild(date);
        left.appendChild(circle);
        left.appendChild(info);

        const buttons = document.createElement("div");
        buttons.className = "task-buttons";

        const completeButton = document.createElement("button");
        completeButton.className = "complete-btn";
        completeButton.textContent = "✔";
        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveData();
            renderTasks();
        });

        const editButton = document.createElement("button");
        editButton.className = "edit-btn";
        editButton.textContent = "✏";
        editButton.addEventListener("click", function () {
            editTask(task);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "🗑";
        deleteButton.addEventListener("click", function (e) {
            e.stopPropagation();
            
            const deletedTask = {
                ...task,
                deletedAt: new Date().toLocaleString("ru-RU")
            };
            deletedTasks.unshift(deletedTask);
            
            tasks = tasks.filter(t => t.id !== task.id);
            
            saveData();
            renderTasks();
        });

        buttons.appendChild(completeButton);
        buttons.appendChild(editButton);
        buttons.appendChild(deleteButton);

        li.appendChild(left);
        li.appendChild(buttons);
        taskList.appendChild(li);
    });

    updateStatistics();
}

function updateStatistics() {
    allCount.textContent = tasks.length;
    completedCount.textContent = tasks.filter(t => t.completed).length;
    activeCount.textContent = tasks.filter(t => !t.completed).length;
    const today = new Date().toISOString().split("T")[0];
    todayCount.textContent = tasks.filter(t => t.date === today).length;
}

function formatDate(date) {
    try {
        return new Date(date).toLocaleDateString("ru-RU");
    } catch {
        return date;
    }
}

function editTask(task) {
    modalTitle.textContent = "✏️ Редактирование задачи";
    modalBody.innerHTML = "";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = task.title;
    titleInput.style.cssText = "width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:14px;font-size:16px;box-sizing:border-box;";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = task.date;
    dateInput.style.cssText = "width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:14px;font-size:16px;box-sizing:border-box;";

    const priority = document.createElement("select");
    priority.style.cssText = "width:100%;padding:12px;margin-bottom:20px;border:1px solid #ddd;border-radius:14px;font-size:16px;";
    priority.innerHTML = `
        <option value="low" ${task.priority === "low" ? "selected" : ""}>🟢 Низкий</option>
        <option value="medium" ${task.priority === "medium" ? "selected" : ""}>🟡 Средний</option>
        <option value="high" ${task.priority === "high" ? "selected" : ""}>🔴 Высокий</option>
    `;

    const completed = document.createElement("label");
    completed.style.cssText = "display:block;margin-bottom:20px;";
    completed.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        Выполнено
    `;
    const checkbox = completed.querySelector("input");

    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display:flex;gap:10px;";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 Сохранить";
    saveBtn.style.cssText = "flex:1;padding:14px;border:none;border-radius:14px;background:#8fb7ff;color:white;cursor:pointer;font-size:16px;font-weight:600;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Отмена";
    cancelBtn.style.cssText = "flex:1;padding:14px;border:none;border-radius:14px;background:#e0e0e0;color:#333;cursor:pointer;font-size:16px;font-weight:600;";

    saveBtn.onclick = function () {
        const title = titleInput.value.trim();
        if (!title) {
            alert("Введите название задачи");
            return;
        }
        task.title = title;
        task.date = dateInput.value;
        task.priority = priority.value;
        task.completed = checkbox.checked;
        saveData();
        renderTasks();
        modal.classList.remove("active");
    };

    cancelBtn.onclick = function () {
        modal.classList.remove("active");
    };

    btnContainer.appendChild(saveBtn);
    btnContainer.appendChild(cancelBtn);

    modalBody.appendChild(titleInput);
    modalBody.appendChild(dateInput);
    modalBody.appendChild(priority);
    modalBody.appendChild(completed);
    modalBody.appendChild(btnContainer);
    modal.classList.add("active");
}

document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("click", function () {
        const type = this.dataset.type;
        let title = "";
        let list = [];

        if (type === "today") {
            title = "📅 Задачи на сегодня";
            const today = new Date().toISOString().split("T")[0];
            list = tasks.filter(task => task.date === today);
        } else if (type === "all") {
            title = "📋 Все задачи";
            list = tasks;
        } else if (type === "completed") {
            title = "✅ Выполненные задачи";
            list = tasks.filter(task => task.completed);
        } else if (type === "active") {
            title = "🔥 Активные задачи";
            list = tasks.filter(task => !task.completed);
        }

        openModal(title, list);
    });
});

deletedButton.addEventListener("click", function () {
    openDeletedTasks();
});

closeModal.addEventListener("click", function () {
    modal.classList.remove("active");
});

window.addEventListener("click", function (e) {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
});

themeButton.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    this.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

function loadTheme() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        themeButton.textContent = "☀️";
    }
}
loadTheme();

function openModal(title, list) {
    modalTitle.textContent = title;
    modalBody.innerHTML = "";

    if (list.length === 0) {
        modalBody.innerHTML = "<p style='text-align:center;padding:20px;color:gray;'>Нет задач.</p>";
    } else {
        list.forEach(task => {
            const item = document.createElement("div");
            item.style.cssText = "padding:12px;border-bottom:1px solid #ececec;";
            const icon = task.completed ? "✅" : "📌";
            item.innerHTML = `
                <strong>${icon} ${task.title}</strong>
                <br>
                <small style="color:gray;">${task.date ? formatDate(task.date) : "Без даты"}</small>
            `;
            modalBody.appendChild(item);
        });
    }
    modal.classList.add("active");
}

function openDeletedTasks() {
    modalTitle.textContent = "🗑 Недавно удаленные";
    modalBody.innerHTML = "";

    autoDeleteOldTasks();

    if (deletedTasks.length === 0) {
        modalBody.innerHTML = "<p style='text-align:center;padding:20px;color:gray;'>Корзина пуста.</p>";
    } else {
        deletedTasks.forEach((task, index) => {
            const item = document.createElement("div");
            item.style.cssText = "padding:15px;border-bottom:1px solid #ececec;display:flex;justify-content:space-between;align-items:center;";

            const info = document.createElement("div");
            info.innerHTML = `
                <strong>${task.title}</strong>
                <br>
                <small style="color:gray;">${task.date ? formatDate(task.date) : "Без даты"}</small>
                <br>
                <small style="color:gray;font-size:11px;">🗑 ${task.deletedAt || "Неизвестно"}</small>
            `;

            const btnGroup = document.createElement("div");
            btnGroup.style.cssText = "display:flex;gap:8px;";

            const restoreBtn = document.createElement("button");
            restoreBtn.textContent = "Восстановить";
            restoreBtn.style.cssText = "padding:8px 16px;border:none;border-radius:12px;background:#8fb7ff;color:white;cursor:pointer;font-size:14px;";
            restoreBtn.onclick = function () {
                tasks.unshift(task);
                deletedTasks.splice(index, 1);
                saveData();
                renderTasks();
                openDeletedTasks();
            };

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Удалить";
            deleteBtn.style.cssText = "padding:8px 16px;border:none;border-radius:12px;background:#ffb4be;color:white;cursor:pointer;font-size:14px;";
            deleteBtn.onclick = function () {
                deletedTasks.splice(index, 1);
                saveData();
                openDeletedTasks();
            };

            btnGroup.appendChild(restoreBtn);
            btnGroup.appendChild(deleteBtn);
            item.appendChild(info);
            item.appendChild(btnGroup);
            modalBody.appendChild(item);
        });

        const clearAll = document.createElement("button");
        clearAll.textContent = "🗑 Удалить все";
        clearAll.style.cssText = "display:block;margin:20px auto 0;padding:12px 30px;border:none;border-radius:14px;background:#ff6b6b;color:white;cursor:pointer;font-size:16px;font-weight:600;";
        clearAll.onclick = function () {
            if (deletedTasks.length === 0) return;
            if (confirm("Удалить все задачи из корзины безвозвратно?")) {
                deletedTasks = [];
                saveData();
                openDeletedTasks();
            }
        };
        modalBody.appendChild(clearAll);
    }

    modal.classList.add("active");
}

renderTasks();