package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/user/backend/internal/api/handlers"
	"github.com/user/backend/internal/middleware"
	"github.com/user/backend/internal/service"
)

func SetupRoutes(taskSvc *service.TaskService, authSvc *service.AuthService, jwtSecret string) *mux.Router {
	router := mux.NewRouter()

	taskHandler := handlers.NewTaskHandler(taskSvc)
	authHandler := handlers.NewAuthHandler(authSvc)

	router.HandleFunc("/health", healthHandler).Methods("GET", "OPTIONS")
	router.HandleFunc("/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	router.HandleFunc("/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	router.HandleFunc("/auth/logout", authHandler.Logout).Methods("POST", "OPTIONS")
	router.HandleFunc("/auth/refresh", authHandler.RefreshToken).Methods("POST", "OPTIONS")

	protected := router.PathPrefix("/api/v1").Subrouter()
	protected.Use(middleware.AuthMiddleware(jwtSecret))

	protected.HandleFunc("/tasks", taskHandler.CreateTask).Methods("POST", "OPTIONS")
	protected.HandleFunc("/tasks", taskHandler.GetAllTasks).Methods("GET", "OPTIONS")
	protected.HandleFunc("/tasks/{id}", taskHandler.GetTaskByID).Methods("GET", "OPTIONS")
	protected.HandleFunc("/tasks/{id}", taskHandler.UpdateTask).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/tasks/{id}", taskHandler.DeleteTask).Methods("DELETE", "OPTIONS")

	return router
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok",
	})
}
