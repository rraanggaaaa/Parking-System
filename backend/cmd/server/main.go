package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/user/backend/internal/api"
	"github.com/user/backend/internal/repository"
	"github.com/user/backend/internal/service"
	"github.com/user/backend/pkg/cache"
	"github.com/user/backend/pkg/db"
	"github.com/user/backend/pkg/logger"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		logger.Info("No .env file found, using environment variables", nil)
	}

	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}
	logger.Init(logLevel)

	logger.Info("Starting Todo Backend API Server", nil)

	database, err := db.InitDB()
	if err != nil {
		logger.Error("Failed to initialize database", err)
		os.Exit(1)
	}
	defer db.CloseDB(database)

	migrationSQL := `
        CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_due_date ON tasks(due_date);
        CREATE INDEX IF NOT EXISTS idx_created_at ON tasks(created_at);
    `

	err = db.RunMigrations(database, migrationSQL)
	if err != nil {
		logger.Error("Failed to run migrations", err)
		os.Exit(1)
	}

	redisCache, err := cache.NewRedisCache()
	if err != nil {
		logger.Error("Failed to initialize Redis cache", err)
	}
	defer redisCache.Close()

	taskRepo := repository.NewTaskRepository(database)
	taskService := service.NewTaskService(taskRepo, redisCache)

	router := api.SetupRoutes(taskService)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	serverAddr := fmt.Sprintf(":%s", port)

	logger.Info("Server starting", map[string]interface{}{"address": serverAddr})
	logger.Info("API Endpoints available at:", map[string]interface{}{
		"tasks_post":  "POST /tasks",
		"tasks_get":   "GET /tasks (with filters)",
		"task_get":    "GET /tasks/{id}",
		"task_put":    "PUT /tasks/{id}",
		"task_delete": "DELETE /tasks/{id}",
		"health":      "GET /health",
	})

	go func() {
		if err := http.ListenAndServe(serverAddr, router); err != nil && err != http.ErrServerClosed {
			logger.Error("Server error", err)
			os.Exit(1)
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("Server shutting down gracefully", nil)
}
