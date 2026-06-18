package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/user/backend/internal/api"
	"github.com/user/backend/internal/middleware"
	"github.com/user/backend/internal/repository"
	"github.com/user/backend/internal/service"
	"github.com/user/backend/pkg/cache"
	"github.com/user/backend/pkg/db"
	"github.com/user/backend/pkg/logger"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	logger.Init("info")
	logger.Info("Starting server...", nil)

	database, err := db.InitDB()
	if err != nil {
		logger.Error("Failed to connect database", err)
		os.Exit(1)
	}
	defer db.CloseDB(database)

	migrationSQL := `
		CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			username VARCHAR(255) UNIQUE NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			role VARCHAR(50) DEFAULT 'user',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS tasks (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			title VARCHAR(255) NOT NULL,
			description TEXT,
			status VARCHAR(50) DEFAULT 'pending',
			due_date DATE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
		CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
		CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
		CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
	`
	if err := db.RunMigrations(database, migrationSQL); err != nil {
		logger.Error("Failed to run migrations", err)
		os.Exit(1)
	}

	redisCache, err := cache.NewRedisCache()
	if err != nil {
		logger.Error("Failed to connect Redis", err)
	}
	defer redisCache.Close()

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key-change-in-production"
	}

	userRepo := repository.NewUserRepository(database)
	taskRepo := repository.NewTaskRepository(database)

	authService := service.NewAuthService(userRepo, redisCache, jwtSecret, 24*time.Hour)
	taskService := service.NewTaskService(taskRepo, redisCache)

	router := api.SetupRoutes(taskService, authService, jwtSecret)

	handler := middleware.CORS(router)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	logger.Info(fmt.Sprintf("Server running on http://localhost:%s", port), nil)
	logger.Info("Endpoints:", map[string]interface{}{
		"health":      "GET  /health",
		"register":    "POST /auth/register",
		"login":       "POST /auth/login",
		"logout":      "POST /auth/logout",
		"refresh":     "POST /auth/refresh",
		"tasks":       "GET  /api/v1/tasks",
		"create_task": "POST /api/v1/tasks",
		"get_task":    "GET  /api/v1/tasks/{id}",
		"update_task": "PUT  /api/v1/tasks/{id}",
		"delete_task": "DELETE /api/v1/tasks/{id}",
	})

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		logger.Error("Server failed", err)
	}
}
