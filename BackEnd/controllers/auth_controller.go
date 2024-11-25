package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthController struct{}

func (a AuthController) GetOpenID(c *gin.Context) {
	// 从请求头中获取 x-wx-openid
	openid := c.GetHeader("x-wx-openid")
	if openid == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Missing openid in request header",
			"headers": c.Request.Header, // 打印请求头，便于调试
		})
		return
	}

	// 返回 openid
	c.JSON(http.StatusOK, gin.H{"openID": openid})
}
