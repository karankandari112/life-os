
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

        // Save updated task status
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // CHANGE: Refresh both pages and all dashboard stats
        renderTasks();
    });


    // ===== EDIT TASK BUTTON =====

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.classList.add("edit-Btn");
    taskElement.append(editBtn);

    editBtn.addEventListener("click", function () {
        // Prevent opening another editor for the same task
        if (taskElement.querySelector(".edit-wrapper")) return;

        // Create edit input
        const input = document.createElement("input");
        input.type = "text";
        input.value = task.text;
        input.classList.add("edit-task-input");

        // Replace task text with input
        taskTextElement.replaceWith(input);

        let cancelEdit = false;

        // Create wrapper for input and hint
        const editWrapper = document.createElement("div");
        editWrapper.classList.add("edit-wrapper");

        input.replaceWith(editWrapper);
        editWrapper.append(input);

        // Create keyboard hint
        const editHint = document.createElement("small");
        editHint.textContent = "Enter to save · Esc to cancel";
        editHint.classList.add("edit-hint");
        editWrapper.append(editHint);

        // Focus input
        input.focus();
        input.select();


        // ===== SAVE OR CLEAN UP WHEN INPUT LOSES FOCUS =====

        input.addEventListener("blur", function () {
            if (cancelEdit) return;

            // Empty input: cancel editing
            if (input.value.trim() === "") {
                editWrapper.replaceWith(taskTextElement);
                return;
            }

            // Save updated task text
            task.text = input.value.trim();
            localStorage.setItem("tasks", JSON.stringify(tasks));

            // CHANGE: Stop blur from repeating during refresh
            cancelEdit = true;
            renderTasks();
        });


        // ===== ENTER TO SAVE, ESCAPE TO CANCEL =====

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();

                // Do not save an empty task
                if (input.value.trim() === "") {
                    cancelEdit = true;
                    editWrapper.replaceWith(taskTextElement);
                    return;
                }

                // Update task text
                task.text = input.value.trim();

                // Save updated task
                localStorage.setItem("tasks", JSON.stringify(tasks));

                // CHANGE: Stop blur from repeating and sync both pages
                cancelEdit = true;
                renderTasks();
            }

            if (event.key === "Escape") {
                // Cancel without saving
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
        // Remove task from array
        tasks = tasks.filter(function (item) {
            return item !== task;
        });

        // Save updated tasks
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // CHANGE: Refresh both lists, empty states and stats
        renderTasks();
    });

    list.append(taskElement);
}


/* ===== RENDER SAVED TASKS ON BOTH PAGES & UPDATE DASHBOARD STATS ===== */

function renderTasks() {
    // Clear both lists before rendering saved tasks
    taskLists.forEach(function (list) {
        list.innerHTML = "";
    });

    // Show empty state only when there are no saved tasks
    if (tasks.length === 0) {
        taskLists.forEach(function (list, index) {
            if (emptyStates[index]) {
                list.append(emptyStates[index]);
            }
        });
    }

    // Render every task on both pages
    tasks.forEach(function (task) {
        taskLists.forEach(function (list) {
            createTask(task, list);
        });
    });

    // Update total task count
    taskCount.textContent = tasks.length;

    // Update completed task count
    completedCount.textContent = tasks.filter(function (item) {
        return item.completed;
    }).length;

    // Update Day Score
    dayScore.textContent = tasks.length > 0
        ? Math.round(
            (tasks.filter(function (item) {
                return item.completed;
            }).length / tasks.length) * 100
        ) + "%"
        : "0%";
}

// CHANGE: Load saved tasks and stats when the page opens
renderTasks();


/* ===== ADD TASK ===== */

addTaskBtns.forEach(function (addTaskBtn) {
    addTaskBtn.addEventListener("click", function () {
        // Select the task list for the clicked button
        const taskList = addTaskBtn
            .closest(".page-section")
            .querySelector(".task-list");

        // Prevent multiple task inputs
        if (taskList.querySelector(".task-input")) return;

        // Create input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter your task...";
        input.classList.add("task-input");

        // Add input to the page where the button was clicked
        taskList.append(input);
        input.focus();

        // ===== CREATE TASK ON ENTER =====

        input.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                if (input.value.trim() === "") return;

                // Create new task object
                const newTask = {
                    text: input.value.trim(),
                    completed: false
                };

                // Add task to array
                tasks.push(newTask);

                // Save tasks
                localStorage.setItem("tasks", JSON.stringify(tasks));

                // CHANGE: Remove input, then refresh both pages
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

        // Remove active class from all navigation links
        navLinks.forEach(function (navLink) {
            navLink.classList.remove("active");
        });

        // Add active class to the clicked link
        link.classList.add("active");

        pageSections.forEach(function (section) {
            section.classList.remove("active");
        });

        // Show the selected page if it exists
        const selectedPage = document.getElementById(pageName);

        if (selectedPage) {
            selectedPage.classList.add("active");
        }
    });
});
