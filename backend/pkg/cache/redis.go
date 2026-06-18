package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/user/backend/pkg/logger"
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache() (*RedisCache, error) {
	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")

	if host == "" {
		host = "localhost"
	}

	if port == "" {
		port = "6379"
	}

	client := redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", host, port),
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		logger.Warn("Redis connection failed, continuing without cache", map[string]interface{}{
			"error": err.Error(),
		})

		return &RedisCache{
			client: nil,
		}, nil
	}

	logger.Info("Successfully connected to Redis", map[string]interface{}{
		"host": host,
		"port": port,
	})

	return &RedisCache{
		client: client,
	}, nil
}

func (rc *RedisCache) Get(key string) (string, error) {
	if rc.client == nil {
		return "", nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	val, err := rc.client.Get(ctx, key).Result()

	if err == redis.Nil {
		return "", nil
	}

	if err != nil {
		logger.Error("Error getting cache", err)
		return "", err
	}

	return val, nil
}

func (rc *RedisCache) Set(key string, value string, expiration time.Duration) error {
	if rc.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := rc.client.Set(ctx, key, value, expiration).Err(); err != nil {
		logger.Error("Error setting cache", err)
		return err
	}

	return nil
}

func (rc *RedisCache) SetJSON(key string, value interface{}, expiration time.Duration) error {
	if rc.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := rc.client.Set(ctx, key, value, expiration).Err(); err != nil {
		logger.Error("Error setting cache", err)
		return err
	}

	return nil
}

func (rc *RedisCache) Delete(key string) error {
	if rc.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := rc.client.Del(ctx, key).Err(); err != nil {
		logger.Error("Error deleting cache", err)
		return err
	}

	return nil
}

func (rc *RedisCache) Exists(key string) (bool, error) {
	if rc.client == nil {
		return false, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result, err := rc.client.Exists(ctx, key).Result()
	if err != nil {
		logger.Error("Error checking cache existence", err)
		return false, err
	}

	return result > 0, nil
}

func (rc *RedisCache) InvalidatePattern(pattern string) error {
	if rc.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	iter := rc.client.Scan(ctx, 0, pattern, 0).Iterator()

	for iter.Next(ctx) {
		key := iter.Val()

		if err := rc.client.Del(ctx, key).Err(); err != nil {
			logger.Error("Error invalidating cache pattern", err)
		}
	}

	return iter.Err()
}

func (rc *RedisCache) BlacklistToken(token string, expiration time.Duration) error {
	if rc.client == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	key := buildBlacklistKey(token)

	if err := rc.client.Set(ctx, key, "blacklisted", expiration).Err(); err != nil {
		logger.Error("Error blacklisting token", err)
		return err
	}

	return nil
}

func (rc *RedisCache) IsTokenBlacklisted(token string) (bool, error) {
	if rc.client == nil {
		return false, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	key := buildBlacklistKey(token)

	result, err := rc.client.Exists(ctx, key).Result()
	if err != nil {
		logger.Error("Error checking blacklisted token", err)
		return false, err
	}

	return result > 0, nil
}

func (rc *RedisCache) Close() error {
	if rc.client != nil {
		return rc.client.Close()
	}

	return nil
}

func BuildTaskKey(id string) string {
	return fmt.Sprintf("task:%s", id)
}

func BuildTasksKey(status string, page int, limit int, search string) string {
	return fmt.Sprintf("tasks:%s:%d:%d:%s", status, page, limit, search)
}

func BuildUserKey(id string) string {
	return fmt.Sprintf("user:%s", id)
}

func BuildUserEmailKey(email string) string {
	return fmt.Sprintf("user:email:%s", email)
}

func buildBlacklistKey(token string) string {
	hash := sha256.Sum256([]byte(token))
	return "blacklist:" + hex.EncodeToString(hash[:])
}
