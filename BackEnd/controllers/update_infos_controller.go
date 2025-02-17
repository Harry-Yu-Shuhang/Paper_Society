package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"

	"github.com/gin-gonic/gin"
)

type UpdateInfosController struct{}

func (u UpdateInfosController) InfosUpdate(c *gin.Context) {
	// 定义请求结构体
	var request struct {
		UserInfo struct {
			UserID    int    `json:"userID"`
			CardCount int    `json:"cardCount"`
			Nickname  string `json:"nickName"`
			AvatarUrl string `json:"avatarUrl"`
			UserHot   int    `json:"userHot"`
		} `json:"userInfo"`
	}

	// 解析请求体中的 JSON 数据
	if err := c.BindJSON(&request); err != nil {
		fmt.Printf("JSON 解析错误: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// 更新用户基本信息
	userUpdateData := map[string]interface{}{
		"card_count": request.UserInfo.CardCount,
		"nick_name":  request.UserInfo.Nickname,
		"avatar_url": request.UserInfo.AvatarUrl,
		"user_hot":   request.UserInfo.UserHot,
	}
	if err := dao.Db.Table("user_infos").
		Where("id = ?", request.UserInfo.UserID).
		Updates(userUpdateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
		return
	}

	// 成功响应
	c.JSON(http.StatusOK, gin.H{"message": "User and detail info updated successfully"})
}
