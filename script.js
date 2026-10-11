
/* ===== SELECT ELEMENTS ===== */

const addTaskBtns = document.querySelectorAll(".add-task-btn");
const taskLists = document.querySelectorAll(".task-list");
const emptyStates = document.querySelectorAll(".empty-state");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskCount = document.querySelector(".task-count");
const completedCount = document.querySelector(".completed-count");
const dayScore = document.querySelector(".day-score");


/* ===== CREATE TASK ===== */

function createTask(task, list) {
    // Create task container
    const taskElement = document.createElement("div");
    taskElement.classList.add("task-item");

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    taskElement.append(checkbox);

    // Create task text
    const taskTextElement = document.createElement("span");
    taskTextElement.textContent = task.text;
    taskElement.append(taskTextElement);

    // Show line-through for completed tasks
    if (task.completed) {
        taskTextElement.style.textDecoration = "line-through";
    }

    // ===== COMPLETE TASK =====

    checkbox.addEventListener("change", function () {
        task.completed = checkbox.checked;

        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    });


    // ===== EDIT TASK BUTTON =====

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-Btn");
    taskElement.append(editBtn);

    editBtn.addEventListener("click", function () {
        if (taskElement.querySelector(".edit-wrapper")) return;

        // Create edit input
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.classList.add("edit-task-input");

        taskTextElement.replaceWith(input);

        let cancelEdit = false;

        // Create wrapper
        const editWrapper = document.createElement("div");
        editWrapper.classList.add("edit-wrapper");

        input.replaceWith(editWrapper);
        editWrapper.append(input);

        // Create keyboard hint
        const editHint = document.createElement("small");
        editHint.textContent = "Enter to save · Esc to cancel";
        editHint.classList.add("edit-hint");
        editWrapper.append(editHint);

        input.focus();
        input.select();

        // Save when input loses focus
        input.addEventListener("blur", function () {
            if (cancelEdit) return;

            if (input.value.trim() === "") {
                cancelEdit = true;
                editWrapper.replaceWith(taskTextElement);
                return;
            }

            task.text = input.value.trim();
            localStorage.setItem("tasks", JSON.stringify(tasks));

            cancelEdit = true;
            renderTasks();
        });

        // Enter to save, Escape to cancel
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();

                if (input.value.trim() === "") {
                    cancelEdit = true;
                    editWrapper.replaceWith(taskTextElement);
                    return;
                }

                task.text = input.value.trim();
                localStorage.setItem("tasks", JSON.stringify(tasks));

                cancelEdit = true;
                renderTasks();
            }

            if (event.key === "Escape") {
                cancelEdit = true;
                editWrapper.replaceWith(taskTextElement);
            }
        });
    });


    // ===== DELETE TASK BUTTON =====

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    taskElement.append(deleteBtn);

    deleteBtn.addEventListener("click", function () {
        tasks = tasks.filter(function (item) {
            return item !== task;
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    });

    list.append(taskElement);
}


/* ===== RENDER TASKS SEPARATELY ON EACH PAGE ===== */

function renderTasks() {
    // Clear both lists
    taskLists.forEach(function (list) {
        list.innerHTML = "";
    });

    // Dashboard: show first 3 tasks only
    tasks.slice(0, 3).forEach(function (task) {
        createTask(task, taskLists[0]);
    });

    // Tasks page: show ALL tasks
    tasks.forEach(function (task) {
        createTask(task, taskLists[1]);
    });

    // Show empty states only when the relevant list is empty
    if (tasks.length === 0) {
        taskLists.forEach(function (list, index) {
            if (emptyStates[index]) {
                list.append(emptyStates[index]);
            }
        });
    } else if (tasks.length > 0 && taskLists[0] && tasks.length > 0) {
        // Dashboard empty state is not needed when preview tasks exist
    }

    // Dashboard stats count ALL tasks
    taskCount.textContent = tasks.length;

    completedCount.textContent = tasks.filter(function (item) {
        return item.completed;
    }).length;

    dayScore.textContent = tasks.length > 0
        ? Math.round(
            (tasks.filter(function (item) {
                return item.completed;
            }).length / tasks.length) * 100
        ) + "%"
        : "0%";
}


// Load saved tasks and stats when page opens
renderTasks();


/* ===== ADD TASK ===== */

addTaskBtns.forEach(function (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
        // Select the list belonging to the clicked page
        const taskList = addTaskBtn
            .closest(".page-section")
            .querySelector(".task-list");

        if (taskList.querySelector(".task-input")) return;

        // Create input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter your task...";
        input.classList.add("task-input");

        taskList.append(input);
        input.focus();

        // Create task on Enter
        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                if (input.value.trim() === "") return;

                const newTask = {
                    text: input.value.trim(),
                    completed: false
                };

                tasks.push(newTask);

                localStorage.setItem("tasks", JSON.stringify(tasks));

                input.remove();
                renderTasks();
            }
        });
    });
});


/* ===== NAVIGATION ===== */

const navLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");

navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const pageName = link.dataset.page;

        navLinks.forEach(function (navLink) {
            navLink.classList.remove("active");
        });

        link.classList.add("active");

        pageSections.forEach(function (section) {
            section.classList.remove("active");
        });

        const selectedPage = document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }
    });
});
