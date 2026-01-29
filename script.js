let tasks = [];
let currentCategoryFilter = "All";
let currentStatusFilter = "All";


//////////DOM ELEMENTS/////////
const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');
const addBtn = document.getElementById('add-btn');
const errMsg = document.getElementById('err-msg');
const categoryBox = document.querySelector(".category-box");
const filterIcon = document.getElementById("categoryFilterIcon");
const statusFilterIcon = document.getElementById("statusFilterIcon");
const filterBox = document.querySelector(".filterBox");
const categoryErr = document.getElementById("category-err");
const statusBox = document.querySelector(".statusBox");
const filterDisplay = document.querySelector(".filterDisplay");




///Display saved tasks on page load///
document.addEventListener("DOMContentLoaded", () => {
      tasks = loadTasks();
      renderFilteredTasks(currentCategoryFilter);
});

/// HELPER FUNCTIONS ///

/// Show and remove error message
function showError(message) {
      errMsg.textContent = message;
      errMsg.classList.add("show");
}
function clearError() {
      errMsg.classList.remove("show");
}

/// Add and remove shake animation
function addShake(element) {
      element.classList.add("shake");
}
function removeShake(element) {
      element.classList.remove("shake");
}

/// Show and remove Category container
function showCategory() {
      categoryBox.classList.add("show");
      categoryErr.classList.remove("show");
}
function removeCategory() {
      categoryBox.classList.remove("show");
}

/// Save tasks to local storage and get tasks array from local storage
function saveTask() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
}
function loadTasks() {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
} 

// console.log(tasks);
// console.log(tasks.map(t => ({ text: t.text, completed: t.completed })));

/// Display the contents of the array in the UI
function renderUI(arr = tasks) {

      listContainer.innerHTML = "";
      
      if (arr.length === 0) {
            categoryErr.classList.add("show");
            filterBox.classList.remove("show");
            return;
      }

      arr.forEach(task => {

            /// Create li and delete button for each task added ///
            const li = document.createElement('li');
            li.innerHTML = task.text;
            li.dataset.id = task.id;

            if (task.completed) li.classList.add("checked");
            switch (task.category) {
                  case "Work": li.classList.add("work"); break;
                  case "Personal": li.classList.add("personal"); break;
                  case "Study": li.classList.add("study"); break;
                  default: break;
            }

            const btn = document.createElement('button');
            btn.className = "delete";
            btn.textContent = "\u00d7";

            const editBtn = document.createElement("button");
            editBtn.className = "edit";
            const editIcon = document.createElement('img');
            editIcon.className = "editIcon";
            editIcon.src = "images/edit3.png";
            editIcon.alt = "Edit Task";
            editBtn.appendChild(editIcon);

            li.appendChild(editBtn);
            li.appendChild(btn);
            listContainer.appendChild(li);
      });
}

function createTask(text, category) {
      const task = {
            id: Date.now(),
            text: text,
            completed: false,
            category: category,
            createdAt: new Date().toISOString()                   
      }
      return task;
}

function addTask() {
      const text = inputBox.value.trim();
      let task;
      let category = selectedCategory ? selectedCategory.textContent : "Uncategorized";

      if (!text) {
            showError("You haven't written anything!");
            addShake(inputBox);
            setTimeout(clearError, 3000);
            setTimeout(() => {
                  inputBox.classList.remove("shake");
            }, 500);
            return;
      }

      const match = findMatch(text);

       if (match) {
             const matchingLi = listContainer.querySelector(`li[data-id="${match.id}"]`);

            if (matchingLi) {
                   matchingLi.classList.add("highlight", "shake");
                   errMsg.textContent = "This task already exists!";
                   errMsg.classList.add("show");
                   setTimeout(() => {
                        matchingLi.classList.remove("highlight");
                        errMsg.classList.remove("show");
                   }, 3000);
                  setTimeout(() => {
                        matchingLi.classList.remove("shake");
                  }, 500);
            }
             return;
       } 

      if (selectedCategory) {
            selectedCategory.classList.remove("selected");
            selectedCategory = null;
      }

      task = createTask(text, category);

      // Clear out input field and remove category box //
      inputBox.value = "";
      removeCategory();
      
      // Add task to array and save to local storage //
      tasks.push(task);
      saveTask();
      renderFilteredTasks(currentCategoryFilter);

      // console.log(tasks);
}                       

function findMatch(text) {
      return tasks.find(task => task.text.toLowerCase() === text.toLowerCase());
}

function startEditing(li, task) {
      const originalText = task.text;

      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;
      input.className = "edit-input";

      const buttons = document.querySelectorAll(".edit, .delete");
      li.innerHTML = "";
      li.appendChild(input);
      buttons.forEach(btn => li.appendChild(btn));

      input.focus();
      input.select();

      input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                  saveEdit(task, input.value.trim());
            }
            if (e.key === "Escape") {
                  renderFilteredTasks(currentCategoryFilter);
            }
      });

      input.addEventListener("blur", () => {
            saveEdit(task, input.value.trim());
      });
}

function saveEdit(task, newText) {

      if(!newText) {
            showError("Task cannot be empty!");
            setTimeout(clearError, 3000);
            renderFilteredTasks(currentCategoryFilter);
            return;
      }

      const duplicate = tasks.find(t => t.id !== task.id && t.text.toLowerCase() === newText.toLowerCase());

      if (duplicate) {
            showError("Task already exists!");
            setTimeout(clearError, 3000);
            renderFilteredTasks(currentCategoryFilter);
            return;
      }

      task.text = newText;
      saveTask();
      renderFilteredTasks(currentCategoryFilter);
}

function renderFilteredTasks(filterValue) {
      currentCategoryFilter = filterValue;

      if (filterValue === "All") {
             renderUI(tasks);
             return;
      }

      const filteredTasks = tasks.filter(task => task.category === filterValue);

      renderUI(filteredTasks);
}

function applyFilter() {
      let filtered = tasks;

      if (currentCategoryFilter !== "All") {
            filtered = filtered.filter(task => task.category === currentCategoryFilter);
      }

      if (currentStatusFilter === "Active") {
             filtered = tasks.filter(task => !task.completed);
      } else if (currentStatusFilter === "Completed") {
             filtered = tasks.filter(task => task.completed);
      }

      renderUI(filtered);
}



/// EVENT LISTENERS ///

let selectedCategory = null;

categoryBox.addEventListener("click", (e) => {
      const p = e.target.closest("p");

      // Remove the selected class from the old selected category each time a new category is selected
      if (selectedCategory) {
            selectedCategory.classList.remove("selected");
      }

      // Makes the "Category:" pill unselectable
      if (!p || p.textContent === "Category:") return;

      p.classList.add("selected");
      selectedCategory = p;
});

addBtn.addEventListener("click", addTask); 

inputBox.addEventListener("input", showCategory); 

inputBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
            addBtn.click();
      }
});

listContainer.addEventListener("click", (e) => {
      const li = e.target.closest('li');

      if (!li) return;

      // Delete action if delete button is clicked //
      if (e.target.closest('.delete') ) {
            const taskId = Number(li.dataset.id);
            tasks = tasks.filter(task => task.id !== taskId);

            saveTask();
            renderFilteredTasks(currentCategoryFilter);
            return;
      }

      if (e.target.closest('.edit')) {
            const taskId = Number(li.dataset.id);
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                  startEditing(li, task);
            }
            return;
      }

      // Toggle completed when li is clicked //
      if (!e.target.closest('button')) {
            const taskId = Number(li.dataset.id);
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                  task.completed = !task.completed;
                  saveTask();
                  renderFilteredTasks(currentCategoryFilter);
            }
      }
});

filterIcon.addEventListener("click", () => {
      filterBox.classList.toggle("show");
})

filterBox.addEventListener("click", (e) => {
      const filter = e.target.closest("p");
      if (!filter || e.target.closest("#filter-label")) return;

      if (tasks.length === 0) {
            filterBox.classList.remove("show");
            filterDisplay.classList.remove("show");
            errMsg.classList.add("shake");
            showError("No tasks to filter!");
            setTimeout(clearError, 4000);
            return;
      }

      const filterValue = filter.dataset.filter;

      const filteredTasks = filterValue === "All" ? tasks : tasks.filter(task => task.category === filterValue);

      const categoryDisplay = document.querySelector(".fName");
      categoryDisplay.textContent = filterValue;

      filterDisplay.classList.add("show");
      categoryErr.classList.remove("show");
      filterBox.classList.remove("show");
      
      renderFilteredTasks(filterValue);
});

document.addEventListener("click", (e) => {
      const isClickInside = filterBox.contains(e.target) || statusBox.contains(e.target);
      const isToggleButton = filterIcon.contains(e.target)  || statusFilterIcon.contains(e.target);

      if (!isClickInside && !isToggleButton) {
            filterBox.classList.remove("show");
            statusBox.classList.remove("show");
            return;
      }
});

statusFilterIcon.addEventListener("click", () => {
      statusBox.classList.toggle("show");
});

statusBox.addEventListener("click", (e) => {
      const status = e.target.closest("p");
      const statusBtn = statusBox.querySelectorAll('.status-btn');
      const filterStatus = status.dataset.status;

      const categoryDisplay = document.querySelector(".fName");
      categoryDisplay.textContent = filterStatus;

      if (status.classList.contains('status-btn')) {
            statusBtn.forEach(btn => btn.classList.remove("active"));
      }

      /// Display the staus filter selected and remove both the error message and the popup menu ///
      filterDisplay.classList.add("show");
      categoryErr.classList.remove("show");
      statusBox.classList.remove("show");


      status.classList.add("active");
      currentStatusFilter = filterStatus;
      applyFilter();
})














// /////Previous Code Before Major Refactor/////

// addBtn.addEventListener('click', () => {
    
//     /////Guard Clause To Check For Empty Input////
//     const value = inputBox.value.trim();

//       if(!value) {
//             errMsg.textContent = `You haven't written anything!`;
//             errMsg.classList.add('show');
//             setTimeout(() => {
//                   errMsg.classList.remove('show');
//             }, 2000);
//             return;
//       }

//       const match = findMatch(value);

//       if (match) {
//             match.classList.add('highlight', 'shake');
//             errMsg.textContent = `This task already exists!`;
//             errMsg.classList.add('show');
//             setTimeout(() => {
//                   match.classList.remove('highlight');
//                   match.classList.remove('shake');
//                   errMsg.classList.remove('show');
//             }, 2000);
//             inputBox.value = '';
//             return;
//       } else {
//             ////Create A New List Item Alongside Delete Btn////
//             const li = document.createElement('li');
//             li.innerHTML = value;
//             const button = document.createElement('button');
//             button.className = "delete";
//             button.innerHTML = "\u00d7";
//             li.appendChild(button);
//             listContainer.appendChild(li);

//             //Save changes to local storage
//     }
//       ////Clear Out The Input Field After Creating A New Task////
//       inputBox.value = '';
//       errMsg.classList.remove('show');
//       saveTasks() 
      
// });

// listContainer.addEventListener('click', (e) => {
//       const li = e.target.closest('li');
//       if (!li || !listContainer.contains(li)) return;

//       //Delete action if a delete control is clicked//
//       if (e.target.closest('.delete')) {
//             li.remove();
//             saveTasks() 
//             return;
//       }

//       //Toggle checked when li is clicked//
//       li.classList.toggle('checked');
//       saveTasks() 
// });

// ///Helper Functions///

// //Local Storage
// function saveTasks() {
//       localStorage.setItem("tasks", listContainer.innerHTML);
// }
// function renderTasks() {
//       listContainer.innerHTML = localStorage.getItem("tasks");
// }

// //Find li that matches text in the input field
// function findMatch(value) {
//       const tasks = listContainer.querySelectorAll('li');
//       return Array.from(tasks).find(li => 
//             li.firstChild.textContent.trim().toLowerCase() === value.trim().toLowerCase()
//       );
// }