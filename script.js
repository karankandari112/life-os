
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


// ===== GOALS FUNCTIONALITY =====
// Handles displaying goals and managing the empty state.

const addGoalBtn = document.querySelector(".add-goal-btn");
const goalList = document.querySelector(".goal-list");
const goalEmptyState = document.querySelector("#goals .empty-state");
let goals = JSON.parse(localStorage.getItem("goals")) || [];


// Display goals and update the empty state
function renderGoals() {
    goalList.innerHTML = "";
    goals.forEach(function (goal) {
        // create the goalItem

        const goalItem = document.createElement("div");
        goalItem.classList.add("goal-item");

        // create the goalText
        const goalText = document.createElement("span");
        goalText.textContent = goal;
        goalItem.append(goalText);

        // Create the Edit button
        const editBtn = document.createElement("button")
        editBtn.textContent = "Edit"
        editBtn.classList.add("edit-Btn");
        goalItem.append(editBtn)

        editBtn.addEventListener("click", function () {

            // Find the current goal's position
            const goalIndex = goals.indexOf(goal);

            // Ask the user for the new goal name
            const updatedGoal = prompt("Edit your goal:", goal);

            // Stop if Cancel is clicked or the input is empty
            if (updatedGoal === null || updatedGoal.trim() === "") {
                return;
            }

            // Check whether another goal already has the new name
            const duplicateGoal = goals.some(function (item, index) {
                // Ignore the current goal being edited
                return index !== goalIndex &&
                    item.toLowerCase() === updatedGoal.trim().toLowerCase();
            });

            // Stop editing if another goal has the same name
            if (duplicateGoal) {
                alert("This goal already exists!");
                return;
            }

            // Update the goal name at its position
            goals[goalIndex] = updatedGoal.trim();

            // Save the updated goals in LocalStorage
            localStorage.setItem("goals", JSON.stringify(goals));

            // Refresh the goal list
            renderGoals();
        });
        // create the delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        goalItem.append(deleteBtn);

        // Delete the goal when the Delete button is clicked
        deleteBtn.addEventListener("click", function () {

            // Remove the selected goal from the goals array
            goals = goals.filter(function (item) {
                return item !== goal;
            });

            // Update LocalStorage after deleting the goal
            localStorage.setItem("goals", JSON.stringify(goals));

            // Refresh the list and empty state
            renderGoals();
        });




        goalList.append(goalItem);
    });

    // Show the empty message only when no goals exist
    goalEmptyState.style.display =
        goalList.children.length === 0 ? "block" : "none";
}

/* Add a new goal */
addGoalBtn.addEventListener("click", function () {
    // Get the goal name from the user
    const goalName = prompt("Enter your goal:");

    // Prevent empty goals and handle Cancel
    if (goalName !== null && goalName.trim() !== "") {
        // Check whether this goal already exists
        const goalExists = goals.some(function (goal) {
            return goal.toLowerCase() === goalName.trim().toLowerCase();
        });

        // Stop if the goal already exists
        if (goalExists) {
            alert("This goal already exists!");
            return;
        }

        // Add the new goal to the goals array
        goals.push(goalName.trim());

        // Save all goals in LocalStorage as a JSON string
        localStorage.setItem("goals", JSON.stringify(goals));

        // Refresh the goal list to display saved goals
        renderGoals();
    }
});

// Set the correct empty state when the page loads
renderGoals();


/* ===== FOCUS TIMER ===== */

const focusTimer = document.querySelector("#focus-timer");
const startFocusBtn = document.querySelector("#start-focus");
const pauseFocusBtn = document.querySelector("#pause-focus");
const resetFocusBtn = document.querySelector("#reset-focus");
const focusTimeStat = document.querySelector("#focus-time-stat");

// Get today's date
function getTodayDate() {
    const now = new Date();

    return now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
}

// Load saved timer data
let savedRemaining = localStorage.getItem("remainingSeconds");

let remainingSeconds =
    savedRemaining !== null ? Number(savedRemaining) : 25 * 60;

let focusInterval = null;

// Load focus history for all dates
let focusHistory = JSON.parse(
    localStorage.getItem("focusHistory")
) || {};

// Today's focus time
let totalFocusSeconds = focusHistory[getTodayDate()] || 0;
let currentFocusDate = getTodayDate();

// Show timer and total focus time
function updateFocusDisplay() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    focusTimer.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");

    focusTimeStat.textContent =
        Math.floor(totalFocusSeconds / 60) + " min";
}
// Show daily focus history
function updateFocusHistory() {
    const historyList = document.querySelector("#focus-history-list");

    if (!historyList) return;

    historyList.innerHTML = "";

    const dates = Object.keys(focusHistory).sort().reverse();

    dates.forEach(function (date) {
        const seconds = focusHistory[date];
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const item = document.createElement("p");

        item.textContent =
            date + " — " +
            (hours > 0 ? hours + " hr " : "") +
            minutes + " min";

        historyList.appendChild(item);
    });
}
// Save focus data in LocalStorage
function saveFocusData() {
    // Save remaining timer seconds
    localStorage.setItem("remainingSeconds", remainingSeconds);

    // Save today's focus time in history
    const today = getTodayDate();
    focusHistory[today] = totalFocusSeconds;

    // Save complete daily history
    localStorage.setItem(
        "focusHistory",
        JSON.stringify(focusHistory)
    );

    // Update history on screen
    updateFocusHistory();
}

// Start timer
startFocusBtn.addEventListener("click", function () {
    if (focusInterval !== null) return;
    if (remainingSeconds <= 0) return;

    focusInterval = setInterval(function () {

        // Check if a new day has started
        const today = getTodayDate();

        if (today !== currentFocusDate) {
            currentFocusDate = today;
            totalFocusSeconds = focusHistory[today] || 0;
            updateFocusDisplay();
        }
        remainingSeconds--;
        totalFocusSeconds++;

        updateFocusDisplay();
        saveFocusData();

        if (remainingSeconds <= 0) {
            clearInterval(focusInterval);
            focusInterval = null;
            alert("Focus session completed!");
        }
    }, 1000);
});
// Pause timer
pauseFocusBtn.addEventListener("click", function () {
    clearInterval(focusInterval);
    focusInterval = null;
    saveFocusData();
});

// Reset timer
resetFocusBtn.addEventListener("click", function () {
    clearInterval(focusInterval);
    focusInterval = null;

    remainingSeconds = 25 * 60;
    updateFocusDisplay();
    saveFocusData();
});

// Initial display
updateFocusDisplay();
updateFocusHistory();
