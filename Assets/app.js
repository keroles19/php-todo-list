document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const messages = document.getElementById('messages');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    const restoreBtn = document.getElementById('restore-btn');

    let tasks = [];

    // Load tasks from the server
    function loadTasks() {
        fetch('api.php')
            .then(response => response.json())
            .then(data => {
                tasks = data;
                updateTaskList();
            })
            .catch(error => {
                // console.error('Error:', error);
            });
    }

    loadTasks(); // Load tasks on page load

    // Add Task
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const taskTitle = document.getElementById('task-title').value;

        if (taskTitle.trim() === '') {
            return;
        }

        const task = {
            title: taskTitle,
            dateAdded: new Date().toISOString(),
        };

        fetch('api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'taskTitle=' + encodeURIComponent(task.title),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    messages.innerText = 'Error: ' + data.error;
                } else {
                    loadTasks(); // Reload tasks from the server
                    document.getElementById('task-title').value = '';
                    messages.innerText = 'Task added successfully';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messages.style.color='red';
                messages.innerText = 'An error occurred while adding the task';
            });
    });

    // Delete Task
    taskList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const taskIndex = e.target.parentElement.parentElement.getAttribute('data-index');
            if (taskIndex !== null) {
                const taskId = tasks[taskIndex].id;
                // Use AJAX to delete the task
                fetch(`api.php`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: 'taskId=' + taskId,
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            messages.innerText = 'Error: ' + data.error;
                        } else {
                            loadTasks(); // Reload tasks from the server
                            messages.innerText = 'Task deleted successfully';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        messages.style.color='red';
                        messages.innerText = 'An error occurred while deleting the task';
                    });
            }
        }
    });

    // Handle inline editing of task titles
    taskList.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const taskIndex = e.target.parentElement.parentElement.getAttribute('data-index');
            if (taskIndex !== null) {
                const newTitle = prompt('Edit task title:', tasks[taskIndex].title);
                if (newTitle !== null) {
                    tasks[taskIndex].title = newTitle;
                    updateTaskList();
                    // Use AJAX to update the task title on the server
                    const taskId = tasks[taskIndex].id;
                    fetch('api.php', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `taskId=${taskId}&newTitle=${encodeURIComponent(newTitle)}`,
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                messages.innerText = 'Error: ' + data.error;
                            } else {
                                loadTasks(); // Reload tasks from the server
                                messages.innerText = 'Task updated successfully';
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            messages.style.color='red';
                            messages.innerText = 'An error occurred while updating the task';
                        });
                }
            }
        }
    });

    // Filter
    sortSelect.addEventListener('change', function() {
        if (sortSelect.value === 'newest') {
            tasks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        } else if (sortSelect.value === 'oldest') {
            tasks.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
        }
        updateTaskList();
    });

    // Search
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm)
        );
        updateTaskList(filteredTasks);
    });


    function updateTaskList(filteredTasks = null) {
        taskList.innerHTML = '';

        const tasksToDisplay = filteredTasks || tasks;

        tasksToDisplay.forEach((task, index) => {
            const li = document.createElement('li');
            li.setAttribute('data-index', index);
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span class="task-title">${task.title}</span>
                <div class="btn-group" role="group">
                    <button class="edit-btn btn btn-secondary btn-sm">Edit <i class="fas fa-edit"></i></button>
                    <button class="delete-btn btn btn-danger btn-sm">Delete <i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

});
