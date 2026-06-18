package service

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/user/backend/internal/models"
	"github.com/user/backend/internal/repository"
	"github.com/user/backend/pkg/cache"
	"github.com/user/backend/pkg/logger"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo    *repository.UserRepository
	cache       *cache.RedisCache
	jwtSecret   string
	tokenExpiry time.Duration
}

func NewAuthService(userRepo *repository.UserRepository, cache *cache.RedisCache, jwtSecret string, tokenExpiry time.Duration) *AuthService {
	if jwtSecret == "" {
		jwtSecret = os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			jwtSecret = "your-secret-key-change-in-production"
		}
	}

	if tokenExpiry == 0 {
		tokenExpiry = 24 * time.Hour
	}

	return &AuthService{
		userRepo:    userRepo,
		cache:       cache,
		jwtSecret:   jwtSecret,
		tokenExpiry: tokenExpiry,
	}
}

func (s *AuthService) HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

func (s *AuthService) CheckPassword(password, hashed string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))

	logger.Info("Checking password", map[string]interface{}{
		"password_length": len(password),
		"hashed_length":   len(hashed),
		"hashed_preview":  hashed[:20] + "...",
	})

	if err != nil {
		logger.Warn("Password mismatch", map[string]interface{}{
			"error": err.Error(),
		})
		return false
	}

	logger.Info("Password match successful", nil)
	return true
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.User, error) {
	existingUser, _ := s.userRepo.FindByUsername(req.Username)
	if existingUser != nil {
		return nil, errors.New("username already exists")
	}

	existingUser, _ = s.userRepo.FindByEmail(req.Email)
	if existingUser != nil {
		return nil, errors.New("email already exists")
	}

	hashedPassword, err := s.HashPassword(req.Password)
	if err != nil {
		logger.Error("Failed to hash password", err)
		return nil, err
	}

	user := &models.User{
		Name:     req.Name,
		Username: req.Username,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     "user",
	}

	if err := s.userRepo.Create(user); err != nil {
		logger.Error("Failed to create user", err)
		return nil, err
	}

	logger.Info("User registered successfully", map[string]interface{}{
		"username": user.Username,
		"id":       user.ID,
	})

	user.Password = ""
	return user, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.User, string, error) {
	logger.Info("Login attempt", map[string]interface{}{
		"username": req.Username,
		"email":    req.Email,
	})

	var user *models.User
	var err error

	if req.Username != "" {
		user, err = s.userRepo.FindByUsername(req.Username)
	} else if req.Email != "" {
		user, err = s.userRepo.FindByEmail(req.Email)
	} else {
		return nil, "", errors.New("username or email is required")
	}

	if err != nil {
		logger.Warn("User not found", map[string]interface{}{
			"username": req.Username,
			"email":    req.Email,
		})
		return nil, "", errors.New("invalid credentials")
	}

	logger.Info("User found", map[string]interface{}{
		"username": user.Username,
		"email":    user.Email,
	})

	if !s.CheckPassword(req.Password, user.Password) {
		logger.Warn("Invalid password", map[string]interface{}{
			"username": user.Username,
		})
		return nil, "", errors.New("invalid credentials")
	}

	logger.Info("Login successful", map[string]interface{}{
		"username": user.Username,
		"user_id":  user.ID,
	})

	token, err := s.GenerateToken(user.ID, user.Username)
	if err != nil {
		logger.Error("Failed to generate token", err)
		return nil, "", err
	}

	user.Password = ""
	return user, token, nil
}

func (s *AuthService) GenerateToken(userID, username string) (string, error) {
	now := time.Now()
	expiresAt := now.Add(s.tokenExpiry)

	claims := &models.JWTClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			Subject:   userID,
			Issuer:    "backend",
			Audience:  []string{"frontend"},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		logger.Error("Failed to generate token", err)
		return "", err
	}

	return tokenString, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*models.JWTClaims, error) {
	if s.cache != nil {
		isBlacklisted, err := s.cache.IsTokenBlacklisted(tokenString)
		if err == nil && isBlacklisted {
			return nil, errors.New("token has been revoked")
		}
	}

	claims := &models.JWTClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (s *AuthService) GetUserID(tokenString string) (string, error) {
	claims, err := s.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}
	return claims.UserID, nil
}

func (s *AuthService) Logout(token string) error {
	if s.cache != nil {
		claims := &models.JWTClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(s.jwtSecret), nil
		})

		if err == nil && parsedToken.Valid {
			expiry := claims.ExpiresAt.Time
			ttl := expiry.Sub(time.Now())
			if ttl > 0 {
				return s.cache.BlacklistToken(token, ttl)
			}
		}
	}
	return nil
}
