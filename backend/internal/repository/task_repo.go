package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/user/backend/internal/models"
	"github.com/user/backend/pkg/logger"
)

type TaskRepository struct {
	db *sql.DB
	mu sync.RWMutex
}

func NewTaskRepository(db *sql.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task *models.CreateTaskRequest) (*models.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	var dueDate interface{}
	if task.DueDate != nil && *task.DueDate != "" {
		t, err := time.Parse("2006-01-02", *task.DueDate)
		if err == nil {
			dueDate = t
		}
	}

	query := `
		INSERT INTO tasks (id, title, description, status, due_date)
		VALUES (gen_random_uuid(), $1, $2, $3, $4)
		RETURNING id, title, description, status, due_date, created_at, updated_at
	`

	var result models.Task
	err := r.db.QueryRow(query, task.Title, task.Description, task.Status, dueDate).
		Scan(&result.ID, &result.Title, &result.Description, &result.Status, &result.DueDate, &result.CreatedAt, &result.UpdatedAt)

	if err != nil {
		logger.Error("Error creating task", err)
		return nil, err
	}

	logger.Info("Task created successfully", map[string]interface{}{"task_id": result.ID})
	return &result, nil
}

func (r *TaskRepository) GetAll(status string, page int, limit int, search string) (*models.GetAllTasksResponse, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	query := "SELECT id, title, description, status, due_date, created_at, updated_at FROM tasks WHERE 1=1"
	countQuery := "SELECT COUNT(*) FROM tasks WHERE 1=1"
	var args []interface{}
	var countArgs []interface{}
	argCount := 1

	if status != "" && status != "all" {
		query += fmt.Sprintf(" AND status = $%d", argCount)
		countQuery += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
		countArgs = append(countArgs, status)
		argCount++
	}

	if search != "" {
		searchTerm := "%" + strings.ToLower(search) + "%"
		query += fmt.Sprintf(" AND (LOWER(title) LIKE $%d OR LOWER(description) LIKE $%d)", argCount, argCount+1)
		countQuery += fmt.Sprintf(" AND (LOWER(title) LIKE $%d OR LOWER(description) LIKE $%d)", argCount, argCount+1)
		args = append(args, searchTerm, searchTerm)
		countArgs = append(countArgs, searchTerm, searchTerm)
		argCount += 2
	}

	var totalTasks int
	err := r.db.QueryRow(countQuery, countArgs...).Scan(&totalTasks)
	if err != nil {
		logger.Error("Error counting tasks", err)
		return nil, err
	}

	totalPages := (totalTasks + limit - 1) / limit

	query += " ORDER BY created_at DESC LIMIT $" + fmt.Sprintf("%d", argCount) + " OFFSET $" + fmt.Sprintf("%d", argCount+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		logger.Error("Error querying tasks", err)
		return nil, err
	}
	defer rows.Close()

	tasks := []models.TaskResponse{}
	for rows.Next() {
		var task models.TaskResponse
		var dueDate *time.Time
		err := rows.Scan(&task.ID, &task.Title, &task.Description, &task.Status, &dueDate, &task.CreatedAt, &task.UpdatedAt)
		if err != nil {
			logger.Error("Error scanning task", err)
			return nil, err
		}

		if dueDate != nil {
			dateStr := dueDate.Format("2006-01-02")
			task.DueDate = &dateStr
		}

		tasks = append(tasks, task)
	}

	return &models.GetAllTasksResponse{
		Tasks: tasks,
		Pagination: models.PaginationInfo{
			CurrentPage: page,
			TotalPages:  totalPages,
			TotalTasks:  totalTasks,
			Limit:       limit,
		},
	}, nil
}

func (r *TaskRepository) GetByID(id string) (*models.Task, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	query := `SELECT id, title, description, status, due_date, created_at, updated_at FROM tasks WHERE id = $1`

	var task models.Task
	err := r.db.QueryRow(query, id).
		Scan(&task.ID, &task.Title, &task.Description, &task.Status, &task.DueDate, &task.CreatedAt, &task.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			logger.Warn("Task not found", map[string]interface{}{"task_id": id})
			return nil, fmt.Errorf("task not found")
		}
		logger.Error("Error getting task", err)
		return nil, err
	}

	return &task, nil
}

func (r *TaskRepository) Update(id string, task *models.UpdateTaskRequest) (*models.Task, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	updates := []string{}
	args := []interface{}{}
	argCount := 1

	if task.Title != "" {
		updates = append(updates, fmt.Sprintf("title = $%d", argCount))
		args = append(args, task.Title)
		argCount++
	}

	if task.Description != "" {
		updates = append(updates, fmt.Sprintf("description = $%d", argCount))
		args = append(args, task.Description)
		argCount++
	}

	if task.Status != "" {
		updates = append(updates, fmt.Sprintf("status = $%d", argCount))
		args = append(args, task.Status)
		argCount++
	}

	if task.DueDate != nil {
		var dueDate interface{}

		if *task.DueDate != "" {
			t, err := time.Parse("2006-01-02", *task.DueDate)
			if err != nil {
				return nil, err
			}
			dueDate = t
		}

		updates = append(updates, fmt.Sprintf("due_date = $%d", argCount))
		args = append(args, dueDate)
		argCount++
	}

	if len(updates) == 0 {
		return nil, fmt.Errorf("no fields to update")
	}

	updates = append(updates, "updated_at = NOW()")

	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE tasks
		SET %s
		WHERE id = $%d
		RETURNING id, title, description, status, due_date, created_at, updated_at
	`, strings.Join(updates, ", "), argCount)

	fmt.Println("QUERY:", query)
	fmt.Println("ARGS:", args)

	var result models.Task

	err := r.db.QueryRow(query, args...).Scan(
		&result.ID,
		&result.Title,
		&result.Description,
		&result.Status,
		&result.DueDate,
		&result.CreatedAt,
		&result.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("task not found")
		}

		logger.Error("Error updating task", err)
		return nil, err
	}

	logger.Info("Task updated successfully", map[string]interface{}{
		"task_id": id,
	})

	return &result, nil
}

func (r *TaskRepository) Delete(id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM tasks WHERE id = $1"
	_, err = r.db.Exec(query, id)
	if err != nil {
		logger.Error("Error deleting task", err)
		return err
	}

	logger.Info("Task deleted successfully", map[string]interface{}{"task_id": id})
	return nil
}
