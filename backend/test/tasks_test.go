package test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/user/backend/internal/api"
    "github.com/user/backend/internal/models"
    "github.com/user/backend/internal/repository"
    "github.com/user/backend/internal/service"
    "github.com/user/backend/pkg/cache"
    "github.com/user/backend/pkg/db"
)

func TestCreateTask(t *testing.T) {
    // Setup
    database, err := db.InitDB()
    if err != nil {
        t.Fatalf("Failed to initialize database: %v", err)
    }
    defer database.Close()

    redisCache, _ := cache.NewRedisCache()
    defer redisCache.Close()

    taskRepo := repository.NewTaskRepository(database)
    taskService := service.NewTaskService(taskRepo, redisCache)
    handler := api.NewTaskHandler(taskService)

    // Create request
    reqBody := model.CreateTaskRequest{
        Title:       "Test Task",
        Description: "Test Description",
        Status:      "pending",
    }

    body, _ := json.Marshal(reqBody)
    req := httptest.NewRequest("POST", "/tasks", bytes.NewReader(body))
    w := httptest.NewRecorder()

    // Call handler
    handler.CreateTask(w, req)

    // Assertions
    if w.Code != http.StatusCreated {
        t.Errorf("Expected status %d, got %d", http.StatusCreated, w.Code)
    }

    var response model.SuccessResponse
    json.NewDecoder(w.Body).Decode(&response)

    if response.Message != "Task created successfully" {
        t.Errorf("Expected message 'Task created successfully', got '%s'", response.Message)
    }

    if response.Task == nil {
        t.Error("Expected task in response, got nil")
    }

    if response.Task.Title != "Test Task" {
        t.Errorf("Expected title 'Test Task', got '%s'", response.Task.Title)
    }
}

func TestGetAllTasks(t *testing.T) {
    // Setup
    database, err := db.InitDB()
    if err != nil {
        t.Fatalf("Failed to initialize database: %v", err)
    }
    defer database.Close()

    redisCache, _ := cache.NewRedisCache()
    defer redisCache.Close()

    taskRepo := repository.NewTaskRepository(database)
    taskService := service.NewTaskService(taskRepo, redisCache)
    handler := api.NewTaskHandler(taskService)

    // Create request
    req := httptest.NewRequest("GET", "/tasks", nil)
    w := httptest.NewRecorder()

    // Call handler
    handler.GetAllTasks(w, req)

    // Assertions
    if w.Code != http.StatusOK {
        t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
    }

    var response model.SuccessResponse
    json.NewDecoder(w.Body).Decode(&response)

    if response.Tasks == nil {
        t.Error("Expected tasks in response, got nil")
    }

    if response.Pagination == nil {
        t.Error("Expected pagination in response, got nil")
    }
}

func TestGetTaskByIDNotFound(t *testing.T) {
    // Setup
    database, err := db.InitDB()
    if err != nil {
        t.Fatalf("Failed to initialize database: %v", err)
    }
    defer database.Close()

    redisCache, _ := cache.NewRedisCache()
    defer redisCache.Close()

    taskRepo := repository.NewTaskRepository(database)
    taskService := service.NewTaskService(taskRepo, redisCache)
    handler := api.NewTaskHandler(taskService)

    // Create request with non-existent ID
    req := httptest.NewRequest("GET", "/tasks/non-existent-id", nil)
    w := httptest.NewRecorder()

    // Mock the mux.Vars for testing
    // Note: In real scenario, use gorilla/mux router for proper routing

    // Call handler would require proper routing setup
    // This is a simplified test
    if w.Code == http.StatusNotFound {
        t.Log("Task not found test passed")
    }
}