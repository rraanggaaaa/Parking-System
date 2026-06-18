package logger

import (
    "fmt"
    "os"
    "time"
)

type LogLevel string

const (
    DEBUG LogLevel = "DEBUG"
    INFO  LogLevel = "INFO"
    WARN  LogLevel = "WARN"
    ERROR LogLevel = "ERROR"
)

var logLevel = INFO

func Init(level string) {
    switch level {
    case "debug", "DEBUG":
        logLevel = DEBUG
    case "info", "INFO":
        logLevel = INFO
    case "warn", "WARN":
        logLevel = WARN
    case "error", "ERROR":
        logLevel = ERROR
    }
}

func log(level LogLevel, message string, data map[string]interface{}) {
    if shouldLog(level) {
        timestamp := time.Now().Format("2006-01-02 15:04:05")
        dataStr := ""
        if len(data) > 0 {
            dataStr = fmt.Sprintf(" | Data: %v", data)
        }
        fmt.Fprintf(os.Stderr, "[%s] [%s] %s%s\n", timestamp, level, message, dataStr)
    }
}

func shouldLog(level LogLevel) bool {
    levels := map[LogLevel]int{
        DEBUG: 1,
        INFO:  2,
        WARN:  3,
        ERROR: 4,
    }
    return levels[level] >= levels[logLevel]
}

func Debug(message string, data map[string]interface{}) {
    log(DEBUG, message, data)
}

func Info(message string, data map[string]interface{}) {
    log(INFO, message, data)
}

func Warn(message string, data map[string]interface{}) {
    log(WARN, message, data)
}

func Error(message string, err error) {
    data := map[string]interface{}{}
    if err != nil {
        data["error"] = err.Error()
    }
    log(ERROR, message, data)
}