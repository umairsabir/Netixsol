// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TodoList
 * @author Umair
 * @notice A decentralized Todo List where each user manages their own tasks on-chain.
 */
contract TodoList {
    // ─────────────────────────────────────────────
    //  Enums
    // ─────────────────────────────────────────────

    /// @notice Priority level of a task
    enum Priority { LOW, MEDIUM, HIGH }

    // ─────────────────────────────────────────────
    //  Structs
    // ─────────────────────────────────────────────

    /**
     * @notice Represents a single task owned by a user
     * @param id          Unique auto-incremented identifier (per user)
     * @param content     Description / title of the task
     * @param completed   Whether the task has been marked as done
     * @param deleted     Soft-delete flag (task is hidden but ID is preserved)
     * @param priority    Priority level (LOW / MEDIUM / HIGH)
     * @param category    Free-text category / tag (e.g. "Work", "Personal")
     * @param createdAt   Block timestamp when the task was created
     * @param updatedAt   Block timestamp when the task was last modified
     */
    struct Task {
        uint256 id;
        string  content;
        bool    completed;
        bool    deleted;
        Priority priority;
        string  category;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // ─────────────────────────────────────────────
    //  State Variables
    // ─────────────────────────────────────────────

    /// @dev Maps user address → their task counter (used to generate unique IDs)
    mapping(address => uint256) private _taskCounter;

    /// @dev Maps user address → (taskId → Task)
    mapping(address => mapping(uint256 => Task)) private _tasks;

    // ─────────────────────────────────────────────
    //  Events
    // ─────────────────────────────────────────────

    event TaskCreated(
        address indexed owner,
        uint256 indexed taskId,
        string  content,
        Priority priority,
        string  category,
        uint256 createdAt
    );

    event TaskToggled(
        address indexed owner,
        uint256 indexed taskId,
        bool    completed,
        uint256 updatedAt
    );

    event TaskEdited(
        address indexed owner,
        uint256 indexed taskId,
        string  newContent,
        uint256 updatedAt
    );

    event TaskDeleted(
        address indexed owner,
        uint256 indexed taskId,
        uint256 deletedAt
    );

    event PriorityUpdated(
        address indexed owner,
        uint256 indexed taskId,
        Priority newPriority,
        uint256 updatedAt
    );

    // ─────────────────────────────────────────────
    //  Modifiers
    // ─────────────────────────────────────────────

    /**
     * @dev Reverts if `taskId` does not belong to the caller or has been soft-deleted.
     * Write functions still use msg.sender — it is always reliable for real transactions.
     */
    modifier validTask(uint256 taskId) {
        require(taskId > 0 && taskId <= _taskCounter[msg.sender], "TodoList: task ID out of range");
        require(!_tasks[msg.sender][taskId].deleted, "TodoList: task has been deleted");
        _;
    }

    // ─────────────────────────────────────────────
    //  Write Functions  (use msg.sender — always correct for real txs)
    // ─────────────────────────────────────────────

    /**
     * @notice Create a new task.
     * @param content  Non-empty description for the task.
     * @param priority Priority level (0 = LOW, 1 = MEDIUM, 2 = HIGH).
     * @param category Optional category string (e.g. "Work").
     * @return taskId  The newly created task's ID.
     */
    function createTask(
        string calldata content,
        Priority priority,
        string calldata category
    ) external returns (uint256 taskId) {
        require(bytes(content).length > 0, "TodoList: content cannot be empty");

        _taskCounter[msg.sender]++;
        taskId = _taskCounter[msg.sender];

        _tasks[msg.sender][taskId] = Task({
            id:        taskId,
            content:   content,
            completed: false,
            deleted:   false,
            priority:  priority,
            category:  category,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit TaskCreated(msg.sender, taskId, content, priority, category, block.timestamp);
    }

    /**
     * @notice Toggle the completion status of a task (complete ↔ incomplete).
     * @param taskId The ID of the task to toggle.
     */
    function toggleTask(uint256 taskId) external validTask(taskId) {
        Task storage task = _tasks[msg.sender][taskId];
        task.completed = !task.completed;
        task.updatedAt = block.timestamp;

        emit TaskToggled(msg.sender, taskId, task.completed, block.timestamp);
    }

    /**
     * @notice Edit the content/description of an existing task.
     * @param taskId     The ID of the task to edit.
     * @param newContent The updated description (must be non-empty).
     */
    function editTask(uint256 taskId, string calldata newContent) external validTask(taskId) {
        require(bytes(newContent).length > 0, "TodoList: content cannot be empty");

        Task storage task = _tasks[msg.sender][taskId];
        task.content   = newContent;
        task.updatedAt = block.timestamp;

        emit TaskEdited(msg.sender, taskId, newContent, block.timestamp);
    }

    /**
     * @notice Update the priority of a task.
     * @param taskId      The ID of the task.
     * @param newPriority New priority level.
     */
    function updatePriority(uint256 taskId, Priority newPriority) external validTask(taskId) {
        Task storage task = _tasks[msg.sender][taskId];
        task.priority  = newPriority;
        task.updatedAt = block.timestamp;

        emit PriorityUpdated(msg.sender, taskId, newPriority, block.timestamp);
    }

    /**
     * @notice Soft-delete a task (irreversible). The task ID is permanently retired.
     * @param taskId The ID of the task to delete.
     */
    function deleteTask(uint256 taskId) external validTask(taskId) {
        _tasks[msg.sender][taskId].deleted   = true;
        _tasks[msg.sender][taskId].updatedAt = block.timestamp;

        emit TaskDeleted(msg.sender, taskId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    //  View / Pure Functions
    //
    //  All read functions accept an explicit `owner` address parameter instead
    //  of using msg.sender. This ensures correct results regardless of whether
    //  the RPC node propagates `from` into the eth_call EVM context.
    // ─────────────────────────────────────────────

    /**
     * @notice Get a single task by ID for the given owner address.
     * @param owner  The wallet address that owns the task.
     * @param taskId The ID of the task.
     * @return task  The Task struct.
     */
    function getTask(address owner, uint256 taskId) external view returns (Task memory task) {
        require(taskId > 0 && taskId <= _taskCounter[owner], "TodoList: task ID out of range");
        task = _tasks[owner][taskId];
    }

    /**
     * @notice Get all non-deleted tasks for the given owner address.
     * @param owner  The wallet address whose tasks to fetch.
     * @return tasks Array of Task structs (excludes soft-deleted tasks).
     */
    function getAllTasks(address owner) external view returns (Task[] memory tasks) {
        uint256 total  = _taskCounter[owner];
        uint256 active = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted) active++;
        }

        tasks = new Task[](active);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted) {
                tasks[idx++] = _tasks[owner][i];
            }
        }
    }

    /**
     * @notice Get only completed tasks for the given owner address.
     * @param owner  The wallet address whose tasks to fetch.
     * @return tasks Array of completed Task structs.
     */
    function getCompletedTasks(address owner) external view returns (Task[] memory tasks) {
        uint256 total = _taskCounter[owner];
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted && _tasks[owner][i].completed) count++;
        }

        tasks = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted && _tasks[owner][i].completed) {
                tasks[idx++] = _tasks[owner][i];
            }
        }
    }

    /**
     * @notice Get only pending (incomplete) tasks for the given owner address.
     * @param owner  The wallet address whose tasks to fetch.
     * @return tasks Array of pending Task structs.
     */
    function getPendingTasks(address owner) external view returns (Task[] memory tasks) {
        uint256 total = _taskCounter[owner];
        uint256 count = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted && !_tasks[owner][i].completed) count++;
        }

        tasks = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (!_tasks[owner][i].deleted && !_tasks[owner][i].completed) {
                tasks[idx++] = _tasks[owner][i];
            }
        }
    }

    /**
     * @notice Get tasks filtered by category for the given owner address.
     * @param owner    The wallet address whose tasks to fetch.
     * @param category The category string to filter by.
     * @return tasks   Array of matching Task structs.
     */
    function getTasksByCategory(address owner, string calldata category)
        external view returns (Task[] memory tasks)
    {
        uint256 total = _taskCounter[owner];
        uint256 count = 0;
        bytes32 catHash = keccak256(bytes(category));

        for (uint256 i = 1; i <= total; i++) {
            Task storage t = _tasks[owner][i];
            if (!t.deleted && keccak256(bytes(t.category)) == catHash) count++;
        }

        tasks = new Task[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= total; i++) {
            Task storage t = _tasks[owner][i];
            if (!t.deleted && keccak256(bytes(t.category)) == catHash) {
                tasks[idx++] = t;
            }
        }
    }

    /**
     * @notice Returns the total number of tasks ever created by the given owner
     *         (including deleted ones).
     * @param owner The wallet address to query.
     */
    function getTaskCount(address owner) external view returns (uint256) {
        return _taskCounter[owner];
    }
}
