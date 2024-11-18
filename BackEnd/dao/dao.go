package dao

import (
	"fmt"
	"log"
	"paper_community/config"
	"paper_community/pkg/logger"
	"time"

	"gorm.io/driver/mysql"

	"gorm.io/gorm"
)

var (
	Db           *gorm.DB //想在别的程序调用，只能全局声明,且大写开头
	err          error
	MySQLVersion string
)

// 检查 MySQL 版本
func CheckMySQLVersion() {
	var version string
	// 获取 MySQL 版本
	if err := Db.Raw("SELECT VERSION()").Scan(&version).Error; err != nil {
		log.Fatalf("Failed to get MySQL version: %v", err)
	}
	fmt.Println("MySQL Version 是:", version)
	MySQLVersion = version
}

func init() {
	Db, err = gorm.Open(mysql.Open(config.Mysqldb), &gorm.Config{})
	if err != nil {
		logger.Error(map[string]any{"mysql connect error": err.Error()})
		panic("failed to connect to database")
	}

	// 设置连接池配置
	sqlDB, err := Db.DB()
	if err != nil {
		panic("failed to get sql.DB")
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// 检查 MySQL 版本
	CheckMySQLVersion()
}
