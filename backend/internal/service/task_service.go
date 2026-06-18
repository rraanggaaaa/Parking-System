package service

import (
	"github.com/user/backend/internal/models"
	"github.com/user/backend/internal/repository"
	"github.com/user/backend/pkg/cache"
)

type TaskService struct {
	repo  *repository.TaskRepository
	cache *cache.RedisCache
}

func NewTaskService(repo *repository.TaskRepository, cache *cache.RedisCache) *TaskService {
	return &TaskService{
		repo:  repo,
		cache: cache,
	}
}

func (s *TaskService) CreateTask(req *models.CreateTaskRequest) (*models.Task, error) {
	return s.repo.Create(req)
}

func (s *TaskService) GetAllTasks(status string, page int, limit int, search string) (*models.GetAllTasksResponse, error) {
	return s.repo.GetAll(status, page, limit, search)
}

func (s *TaskService) GetTaskByID(id string) (*models.Task, error) {
	return s.repo.GetByID(id)
}

func (s *TaskService) UpdateTask(id string, req *models.UpdateTaskRequest) (*models.Task, error) {
	return s.repo.Update(id, req)
}

func (s *TaskService) DeleteTask(id string) error {
	return s.repo.Delete(id)
}
