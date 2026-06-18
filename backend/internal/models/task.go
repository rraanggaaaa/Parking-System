package models

import "time"

type Task struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      string     `json:"status"`
	DueDate     *time.Time `json:"due_date"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CreateTaskRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description"`
	Status      string  `json:"status" binding:"required,oneof=pending completed"`
	DueDate     *string `json:"due_date"`
}

type UpdateTaskRequest struct {
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Status      string  `json:"status" binding:"oneof=pending completed"`
	DueDate     *string `json:"due_date"`
}

type TaskResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	DueDate     *string   `json:"due_date"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type GetAllTasksResponse struct {
	Tasks      []TaskResponse `json:"tasks"`
	Pagination PaginationInfo `json:"pagination"`
}

type PaginationInfo struct {
	CurrentPage int `json:"current_page"`
	TotalPages  int `json:"total_pages"`
	TotalTasks  int `json:"total_tasks"`
	Limit       int `json:"limit"`
}

type ErrorResponse struct {
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
	Code    int    `json:"code,omitempty"`
}

type SuccessResponse struct {
	Message    string          `json:"message"`
	Task       *TaskResponse   `json:"task,omitempty"`
	Tasks      []TaskResponse  `json:"tasks,omitempty"`
	Pagination *PaginationInfo `json:"pagination,omitempty"`
}
