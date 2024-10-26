package logger

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"runtime/debug"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
	//logrus可以打印日志等级
)

func init() {
	// 设置日志格式为json格式
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})
	logrus.SetReportCaller(false) //省略调用者信息
}

func Write(msg string, filename string) {
	setOutPutFile(logrus.InfoLevel, filename)
	logrus.Info(msg)
}

func Debug(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.DebugLevel, "debug")
	logrus.WithFields(fields).Debug(args...) //变长参数只输入一个参数需要加...
	//需要注意变长参数函数在定义的时候也只能放在末尾
}

func Info(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.InfoLevel, "info")
	logrus.WithFields(fields).Info(args...)
}

func Warn(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.WarnLevel, "warn")
	logrus.WithFields(fields).Warn(args...)
}

func Fatal(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.FatalLevel, "fatal")
	logrus.WithFields(fields).Fatal(args...)
}

func Error(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.ErrorLevel, "error")
	logrus.WithFields(fields).Error(args...)
}

func Panic(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.PanicLevel, "panic")
	logrus.WithFields(fields).Panic(args...)
}

func Trace(fields logrus.Fields, args ...interface{}) {
	setOutPutFile(logrus.TraceLevel, "trace")
	logrus.WithFields(fields).Trace(args...)
}

func setOutPutFile(level logrus.Level, logName string) {
	if _, err := os.Stat("./runtime/log"); os.IsNotExist(err) {
		err = os.MkdirAll("./runtime/log", 0777) //如果不存在目录则创建，0777表示所有权限
		if err != nil {
			panic(fmt.Errorf("create log dir '%s' error: %s", "./runtime/log", err))
		}
	}

	timeStr := time.Now().Format("2006-01-02")
	fileName := path.Join("./runtime/log", logName+"_"+timeStr+".log")

	var err error
	os.Stderr, err = os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		fmt.Println("open log file err", err)
	}
	logrus.SetOutput(os.Stderr)
	logrus.SetLevel(level)
}

func LoggerToFile() gin.LoggerConfig {

	if _, err := os.Stat("./runtime/log"); os.IsNotExist(err) {
		err = os.MkdirAll("./runtime/log", 0777)
		if err != nil {
			panic(fmt.Errorf("create log dir '%s' error: %s", "./runtime/log", err))
		}
	}

	timeStr := time.Now().Format("2006-01-02")
	fileName := path.Join("./runtime/log", "success_"+timeStr+".log")

	os.Stderr, _ = os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)

	var conf = gin.LoggerConfig{
		Formatter: func(param gin.LogFormatterParams) string {
			return fmt.Sprintf("%s - %s \"%s %s %s %d %s \"%s\" %s\"\n",
				param.TimeStamp.Format("2006-01-02 15:04:05"),
				param.ClientIP,
				param.Method,
				param.Path,
				param.Request.Proto,
				param.StatusCode,
				param.Latency,
				param.Request.UserAgent(),
				param.ErrorMessage,
			)
		},
		Output: io.MultiWriter(os.Stdout, os.Stderr),
	}

	return conf
}

func Recover(c *gin.Context) {
	defer func() {
		if err := recover(); err != nil {
			if _, errDir := os.Stat("./runtime/log"); os.IsNotExist(errDir) {
				errDir = os.MkdirAll("./runtime/log", 0777)
				if errDir != nil {
					panic(fmt.Errorf("create log dir '%s' error: %s", "./runtime/log", errDir))
				}
			}

			timeStr := time.Now().Format("2006-01-02")
			fileName := path.Join("./runtime/log", "error_"+timeStr+".log")

			f, errFile := os.OpenFile(fileName, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
			if errFile != nil {
				fmt.Println(errFile)
			}
			timeFileStr := time.Now().Format("2006-01-02 15:04:05")
			f.WriteString("panic error time:" + timeFileStr + "\n")
			f.WriteString(fmt.Sprintf("%v", err) + "\n")
			f.WriteString("stacktrace from panic:" + string(debug.Stack()) + "\n")
			f.Close()
			c.JSON(http.StatusOK, gin.H{
				"code": 500,
				"msg":  fmt.Sprintf("%v", err),
			})
			//终止后续接口调用，不加的话recover到异常后，还会继续执行接口里后续代码
			c.Abort()
		}
	}()
	c.Next()
}
