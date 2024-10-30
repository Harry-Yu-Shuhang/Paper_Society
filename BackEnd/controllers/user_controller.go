package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"paper_community/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct{}

func (u UserController) UpdateUserInfo(c *gin.Context) {
	var userInfo models.UserInfo
	if err := utils.BindJSON(c, &userInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// 初始化 LoginTime 为当前时间
	userInfo.LoginTime = time.Now().Unix()

	// 检查是否为新用户
	var existingUser models.UserInfo
	isNewUser := dao.Db.Where("open_id = ?", userInfo.OpenID).First(&existingUser).Error == gorm.ErrRecordNotFound
	var userID int    // 用于存储用户ID
	var cardCount int // 用于存储返回给前端的 CardCount

	isSameDayLogin := true
	if isNewUser {
		// 新用户，初始化 CardCount，赠送 3 张签到卡，加上签到奖励，总共6张
		userInfo.CardCount = 6
		// 保存到数据库
		if err := dao.Db.Create(&userInfo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new user info"})
			return
		}
		userID = userInfo.ID           // 获取新用户的ID
		cardCount = userInfo.CardCount // 获取新用户的CardCount

	} else {
		// 老用户，判断是否在同一天登录
		isSameDayLogin = isSameDay(existingUser.LoginTime, userInfo.LoginTime)
		fmt.Println(isSameDayLogin)

		// 如果是今天首次登录，则增加 CardCount 并更新数据库
		if !isSameDayLogin {
			existingUser.CardCount += 3
		}

		// 更新老用户的 LoginTime 和 CardCount
		existingUser.LoginTime = userInfo.LoginTime
		if err := dao.Db.Save(&existingUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
			return
		}
		userID = existingUser.ID           // 获取老用户的ID
		cardCount = existingUser.CardCount // 获取老用户的CardCount
	}

	// 返回用户信息，包括是否为今天首次登录和 CardCount
	c.JSON(http.StatusOK, gin.H{
		"message":   "User info updated successfully",
		"isSameDay": isSameDayLogin,
		"isNewUser": isNewUser,
		"cardCount": cardCount,
		"userID":    userID,
	})
}

// isSameDay 检查两个 UNIX 时间戳是否在同一天
func isSameDay(t1, t2 int64) bool {
	y1, m1, d1 := time.Unix(t1, 0).Date()
	y2, m2, d2 := time.Unix(t2, 0).Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}
