document.addEventListener('DOMContentLoaded', loadTasks);

document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const taskTitle = document.getElementById('task-title').value;
    const taskDeadline = document.getElementById('task-deadline').value;
    const taskDetails = document.getElementById('task-details').value;

    addTask(taskTitle, taskDeadline, taskDetails);
    saveTask(taskTitle, taskDeadline, taskDetails);

    document.getElementById('task-form').reset();
});

function addTask(title, deadline, details) {
    const taskList = document.getElementById('task-list');

    const taskItem = document.createElement('li');

    const taskInfo = document.createElement('div');
    taskInfo.classList.add('task-info');

    const taskTitle = document.createElement('strong');
    taskTitle.textContent = title;

    const taskDeadline = document.createElement('span');
    taskDeadline.textContent = `الموعد النهائي: ${deadline}`;

    const taskDetails = document.createElement('p');
    taskDetails.textContent = details;

    const countdown = document.createElement('div');
    countdown.classList.add('task-countdown');
    const countdownDate = new Date(deadline).getTime();

    taskInfo.appendChild(taskTitle);
    taskInfo.appendChild(taskDeadline);
    taskInfo.appendChild(taskDetails);

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const completeButton = document.createElement('button');
    completeButton.textContent = 'مكتملة';
    completeButton.classList.add('complete');
    completeButton.addEventListener('click', function() {
        taskItem.style.textDecoration = 'line-through';
    });

    const editButton = document.createElement('button');
    editButton.textContent = 'تعديل';
    editButton.classList.add('edit');
    editButton.addEventListener('click', function() {
        editTask(taskItem, title, deadline, details);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'حذف';
    deleteButton.classList.add('delete');
    deleteButton.addEventListener('click', function() {
        taskList.removeChild(taskItem);
        deleteTask(title);
    });

    taskActions.appendChild(completeButton);
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);

    taskItem.appendChild(taskInfo);
    taskItem.appendChild(countdown);
    taskItem.appendChild(taskActions);

    taskList.appendChild(taskItem);

    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdown.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (distance < 0) {
            clearInterval(countdownInterval);
            countdown.textContent = 'Expired';
            showAlert(taskItem);
        }
    }, 1000);
}

function saveTask(title, deadline, details) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ title, deadline, details });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTask(task.title, task.deadline, task.details);
    });
}

function deleteTask(title) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.title !== title);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function editTask(taskItem, oldTitle, oldDeadline, oldDetails) {
    const newTitle = prompt('تعديل عنوان المهمة:', oldTitle);
    const newDeadline = prompt('تعديل الموعد النهائي:', oldDeadline);
    const newDetails = prompt('تعديل تفاصيل المهمة:', oldDetails);

    if (newTitle && newDeadline && newDetails) {
        taskItem.querySelector('strong').textContent = newTitle;
        taskItem.querySelector('span').textContent = `الموعد النهائي: ${newDeadline}`;
        taskItem.querySelector('p').textContent = newDetails;

        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const taskIndex = tasks.findIndex(task => task.title === oldTitle);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { title: newTitle, deadline: newDeadline, details: newDetails };
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }
}

function showAlert(taskItem) {
    const alertBox = document.getElementById('alert');
    alertBox.classList.remove('hidden');

    const extendBtn = document.getElementById('extend-btn');
    const completeBtn = document.getElementById('complete-btn');
    const extendOptions = document.getElementById('extend-options');

    extendBtn.classList.remove('hidden');
    completeBtn.classList.remove('hidden');
    extendOptions.classList.add('hidden');

    extendBtn.addEventListener('click', function() {
        extendBtn.classList.add('hidden');
        extendOptions.classList.remove('hidden');
    });

    completeBtn.addEventListener('click', function() {
        alertBox.classList.add('hidden');
        taskItem.style.textDecoration = 'line-through';
        alert('أحسنت الانجاز!');
    });

    document.querySelectorAll('.extend-time-btn').forEach(button => {
        button.addEventListener('click', function() {
            const hours = parseInt(button.getAttribute('data-hours'));
            extendTask(taskItem, hours);
            alertBox.classList.add('hidden');
        });
    });
}

function extendTask(taskItem, hours) {
    const taskTitle = taskItem.querySelector('strong').textContent;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.title === taskTitle);
    if (taskIndex !== -1) {
        const newDeadline = new Date(tasks[taskIndex].deadline);
        newDeadline.setHours(newDeadline.getHours() + hours);
        tasks[taskIndex].deadline = newDeadline.toISOString().slice(0, 16);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        taskItem.querySelector('span').textContent = `الموعد النهائي: ${tasks[taskIndex].deadline.replace('T', ' ')}`;
        alert('تم تمديد المهلة بنجاح! استمر في العمل الجيد.');
    }
}
