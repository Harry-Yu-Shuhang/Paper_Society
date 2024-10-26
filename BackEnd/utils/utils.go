package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 解析 JSON 数据的通用函数
func BindJSON(c *gin.Context, obj interface{}) error {
	if err := c.BindJSON(obj); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return err
	}
	return nil
}
