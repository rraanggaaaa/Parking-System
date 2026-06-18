package db

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
	"github.com/user/backend/pkg/logger"
)

func InitDB() (*sql.DB, error) {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	if host == "" {
		host = "localhost"
	}
	if port == "" {
		port = "5432"
	}
	if sslmode == "" {
		sslmode = "disable"
	}

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		logger.Error("Error opening database connection", err)
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	err = db.Ping()
	if err != nil {
		logger.Error("Error connecting to database", err)
		return nil, err
	}

	logger.Info("Successfully connected to PostgreSQL", map[string]interface{}{
		"host": host,
		"port": port,
		"db":   dbname,
	})

	return db, nil
}

func RunMigrations(db *sql.DB, migrationSQL string) error {
	_, err := db.Exec(migrationSQL)
	if err != nil {
		logger.Error("Error running migrations", err)
		return err
	}
	logger.Info("Migrations completed successfully", nil)
	return nil
}

func CloseDB(db *sql.DB) error {
	if db != nil {
		return db.Close()
	}
	return nil
}
