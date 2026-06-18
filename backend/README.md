# Todo Backend API - Go

Complete REST API untuk mengelola task/todo dengan CRUD operations, caching, logging, dan concurrent execution.

## Fitur

✅ CRUD Operations untuk Task  
✅ Pagination & Filtering  
✅ Search functionality  
✅ Redis Caching  
✅ Comprehensive Logging  
✅ Concurrent Execution (RWMutex)  
✅ Error Handling  
✅ Unit Tests  
✅ CORS Support  
✅ PostgreSQL Database  

## Prerequisites

- Go 1.21+
- PostgreSQL 12+
- Redis 6+ (optional, akan fallback jika tidak tersedia)
- Windows PowerShell atau Terminal lainnya

## Quick Start

### 1. Setup PostgreSQL Database

```powershell
# Open PowerShell as Admin
psql -U postgres

# In psql prompt, run:
CREATE DATABASE todo;
CREATE USER todo_user WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE todo TO todo_user;
ALTER USER todo_user CREATEDB;
\q
```

### 2. Setup Redis (Optional)

```powershell
# Jika menggunakan Windows dengan Redis
redis-server

# Atau gunakan WSL:
wsl redis-server
```

### 3. Clone/Setup Project

```powershell
cd d:\W3RK\ATS
```

### 4. Create Directory Structure

```powershell
mkdir -p cmd\server, internal\api, internal\model, internal\repository, internal\service, pkg\db, pkg\cache, pkg\logger, migrations, test
```

### 5. Install Dependencies

```powershell
go mod download
go mod tidy
```

### 6. Configure Environment

Create `.env` file in root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=todo_user
DB_PASSWORD=secret
DB_NAME=todo
DB_SSLMODE=disable
APP_PORT=8080
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
LOG_LEVEL=info
```

### 7. Run Server

```powershell
# Run directly
go run ./cmd/server

# Or build and run
go build -o bin/server.exe ./cmd/server
.\bin\server.exe
```

Server akan berjalan di `http://localhost:8080`

## API Endpoints

### Health Check

```
GET /health
GET /api/v1/health

Response: 200 OK
{
  "status": "ok",
  "message": "Server is running"
}
```

### Create Task

```
POST /tasks
POST /api/v1/tasks

Content-Type: application/json

{
  "title": "Learn Go",
  "description": "Learn Go programming language",
  "status": "pending",
  "due_date": "2026-12-31"
}

Response: 201 Created
{
  "message": "Task created successfully",
  "task": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Learn Go",
    "description": "Learn Go programming language",
    "status": "pending",
    "due_date": "2026-12-31",
    "created_at": "2026-06-17T10:00:00Z",
    "updated_at": "2026-06-17T10:00:00Z"
  }
}
```

### Get All Tasks

```
GET /tasks?status=pending&page=1&limit=10&search=learn
GET /api/v1/tasks?status=pending&page=1&limit=10&search=learn

Query Parameters:
- status: pending|completed|all (optional, default: all)
- page: Page number (optional, default: 1)
- limit: Items per page (optional, default: 10, max: 100)
- search: Search in title & description (optional)

Response: 200 OK
{
  "tasks": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Learn Go",
      "description": "Learn Go programming language",
      "status": "pending",
      "due_date": "2026-12-31",
      "created_at": "2026-06-17T10:00:00Z",
      "updated_at": "2026-06-17T10:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_tasks": 50,
    "limit": 10
  }
}
```

### Get Task by ID

```
GET /tasks/{id}
GET /api/v1/tasks/{id}

Response: 200 OK
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Learn Go",
  "description": "Learn Go programming language",
  "status": "pending",
  "due_date": "2026-12-31",
  "created_at": "2026-06-17T10:00:00Z",
  "updated_at": "2026-06-17T10:00:00Z"
}
```

### Update Task

```
PUT /tasks/{id}
PUT /api/v1/tasks/{id}

Content-Type: application/json

{
  "title": "Learn Go Advanced",
  "status": "completed"
}

Response: 200 OK
{
  "message": "Task updated successfully",
  "task": {...}
}
```

### Delete Task

```
DELETE /tasks/{id}
DELETE /api/v1/tasks/{id}

Response: 200 OK
{
  "message": "Task deleted successfully"
}
```

## Testing with cURL

```powershell
# Create task
curl -X POST http://localhost:8080/tasks `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"Learn Go\",\"description\":\"Master Go\",\"status\":\"pending\"}'

# Get all tasks
curl http://localhost:8080/tasks

# Get pending tasks with pagination
curl "http://localhost:8080/tasks?status=pending&page=1&limit=5"

# Search tasks
curl "http://localhost:8080/tasks?search=go"

# Get task by ID (replace {id} with actual task ID)
curl http://localhost:8080/tasks/{id}

# Update task
curl -X PUT http://localhost:8080/tasks/{id} `
  -H "Content-Type: application/json" `
  -d '{\"status\":\"completed\"}'

# Delete task
curl -X DELETE http://localhost:8080/tasks/{id}

# Health check
curl http://localhost:8080/health
```

## Testing with Postman

1. Import endpoints dari contoh di atas
2. Buat task terlebih dahulu untuk mendapatkan ID
3. Gunakan ID yang dikembalikan untuk operasi Get/Update/Delete

## Running Tests

```powershell
# Run all tests
go test ./...

# Run with verbose output
go test -v ./...

# Run specific test
go test -v ./test -run TestCreateTask

# Run with coverage
go test -v ./... -cover
```

## Database Troubleshooting

### Problem: Cannot connect to database

```powershell
# Check PostgreSQL is running
psql -U postgres

# Verify .env credentials match
# Check DB_HOST and DB_PORT are correct

# Test connection manually
psql -h localhost -U todo_user -d todo
```

### Problem: Permission denied

```powershell
# Grant privileges
psql -U postgres
GRANT ALL PRIVILEGES ON DATABASE todo TO todo_user;
ALTER USER todo_user CREATEDB;
\q
```

### Problem: Database already exists

```powershell
psql -U postgres
DROP DATABASE IF EXISTS todo;
CREATE DATABASE todo;
\q
```

## Project Structure

```
d:\W3RK\ATS\
├── cmd/
│   └── server/
│       └── main.go                    # Entry point
├── internal/
│   ├── api/
│   │   ├── handlers.go                # HTTP handlers
│   │   └── routes.go                  # Route setup
│   ├── model/
│   │   └── task.go                    # Data models
│   ├── repository/
│   │   └── task_repo.go               # Database layer
│   └── service/
│       └── task_service.go            # Business logic
├── pkg/
│   ├── cache/
│   │   └── redis.go                   # Redis caching
│   ├── db/
│   │   └── postgres.go                # DB initialization
│   └── logger/
│       └── logger.go                  # Logging
├── migrations/
│   └── 0001_create_tasks_table.sql    # DB schema
├── test/
│   └── task_handler_test.go           # Unit tests
├── .env                               # Environment variables
├── .gitignore
├── go.mod                             # Go modules
├── go.sum                             # Module checksums
└── README.md
```

## Key Features Explained

### Concurrent Execution
- Menggunakan `sync.RWMutex` pada repository layer
- Thread-safe read/write operations
- Mendukung multiple concurrent requests

### Caching (Redis)
- Automatic cache invalidation saat update/delete
- Cache hit untuk GET operations
- Configurable TTL untuk setiap operasi

### Logging
- Structured logging dengan severity levels
- Logs untuk semua error dan important operations
- Configurable log level via environment variable

### Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Detailed error responses

## Performance Tips

1. **Pagination**: Gunakan limit kecil untuk dataset besar
2. **Caching**: Redis significantly meningkatkan performa
3. **Connection Pool**: Sudah dikonfigurasi di `db.InitDB()`
4. **Indexes**: Database indexes pada `status`, `due_date`, dan `created_at`

## Production Checklist

- [ ] Change JWT_SECRET di .env
- [ ] Setup proper database user dengan limited permissions
- [ ] Enable SSL mode untuk database connection
- [ ] Setup Redis dengan authentication
- [ ] Configure CORS dengan allowed origins yang spesifik
- [ ] Setup proper logging dan monitoring
- [ ] Add rate limiting middleware
- [ ] Setup database backups
- [ ] Use environment-specific .env files

## License

MIT