<?php
header("Content-Type: application/json");

$dataFile = 'Db/tasks.json';

// Load existing tasks
function loadTasks() {
    global $dataFile;
    return file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];
}

// Save tasks to the data file
function saveTasks($tasks) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($tasks, JSON_PRETTY_PRINT));
}

// Handle adding a new task
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $taskTitle = trim($_POST['taskTitle']);

    if (!empty($taskTitle) && strlen($taskTitle) <= 100) {
        $tasks = loadTasks();

        // Generate a unique ID for the new task
        $taskId = uniqid();

        $task = [
            'id' => $taskId,
            'title' => $taskTitle,
            'dateAdded' => date('Y-m-d H:i:s')
        ];
        $tasks[] = $task;
        saveTasks($tasks);
        echo json_encode(['message' => 'Task added successfully']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid task title']);
    }
}

// Handle listing tasks
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tasks = loadTasks();
    echo json_encode($tasks);
}

// Handle deleting a task
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents("php://input"), $data);
    $taskId = $data['taskId'];
    $tasks = loadTasks();

    foreach ($tasks as $key => $task) {
        if ($task['id'] === $taskId) {
            unset($tasks[$key]);
            saveTasks(array_values($tasks)); // Re-index the array and save
            echo json_encode(['message' => 'Task deleted successfully']);
            exit(); // Exit early since the task was found and deleted
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid task ID']);
}


// Handle updating a task title
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $data);
    $taskId = $data['taskId'];
    $newTitle = $data['newTitle'];
    $tasks = loadTasks();

    // Find the task with the matching ID
    foreach ($tasks as &$task) {
        if ($task['id'] === $taskId) {
            $task['title'] = $newTitle;
            saveTasks($tasks);
            echo json_encode(['message' => 'Task updated successfully']);
            exit();
        }
    }

    http_response_code(400);
    echo json_encode(['error' => 'Invalid task ID']);
}


?>

