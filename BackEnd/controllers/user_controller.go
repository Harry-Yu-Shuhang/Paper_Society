package controllers

import (
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"paper_community/utils"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserController struct{}

func (u UserController) CreateUserInfo(c *gin.Context) {
	var userInfo models.UserInfo
	if err := utils.BindJSON(c, &userInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	userInfo.LoginTime = time.Now().Unix()

	var existingUser models.UserInfo
	isNewUser := dao.Db.Where("open_id = ?", userInfo.OpenID).First(&existingUser).Error == gorm.ErrRecordNotFound
	var userID int
	var cardCount int
	var createTime int64

	isSameDayLogin := true
	if isNewUser {
		userInfo.CardCount = 6
		userInfo.CreateTime = time.Now().Unix()
		if err := dao.Db.Create(&userInfo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new user info"})
			return
		}
		userID = userInfo.ID
		cardCount = userInfo.CardCount
		createTime = userInfo.CreateTime
	} else {
		isSameDayLogin = isSameDay(existingUser.LoginTime, userInfo.LoginTime)
		if !isSameDayLogin {
			existingUser.CardCount += 3
		}
		existingUser.LoginTime = userInfo.LoginTime
		if err := dao.Db.Save(&existingUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
			return
		}
		userID = existingUser.ID
		cardCount = existingUser.CardCount
		createTime = existingUser.CreateTime
	}

	// 使用 goroutine 并发计算热度
	userHot := calculateUserHot(userID)

	c.JSON(http.StatusOK, gin.H{
		"message":    "User info updated successfully",
		"isSameDay":  isSameDayLogin,
		"isNewUser":  isNewUser,
		"cardCount":  cardCount,
		"userID":     userID,
		"createTime": createTime,
		"userHot":    userHot,
	})
}

// 计算用户热度的函数
func calculateUserHot(userID int) int {
	likeCh := make(chan int)
	rateCh := make(chan int)
	cardCh := make(chan int)

	// 启动 goroutine 计算收藏记录的热度
	go func() {
		var likeCount int64
		dao.Db.Model(&models.GiveLikeRecord{}).Where("user_id = ?", userID).Count(&likeCount)
		likeCh <- int(likeCount * 3)
	}()

	// 启动 goroutine 计算评分记录的热度
	go func() {
		var rateCount int64
		dao.Db.Model(&models.GiveRateRecord{}).Where("user_id = ?", userID).Count(&rateCount)
		rateCh <- int(rateCount)
	}()

	// 启动 goroutine 计算签到卡记录的热度
	go func() {
		var cardCount int64
		dao.Db.Model(&models.GiveCardRecord{}).Where("user_id = ?", userID).Count(&cardCount)
		cardCh <- int(cardCount)
	}()

	// 收集所有 goroutine 的结果
	likeHot := <-likeCh
	rateHot := <-rateCh
	cardHot := <-cardCh

	// 汇总热度
	totalHot := likeHot + rateHot + cardHot
	return totalHot
}

// isSameDay 检查两个 UNIX 时间戳是否在同一天
func isSameDay(t1, t2 int64) bool {
	y1, m1, d1 := time.Unix(t1, 0).Date()
	y2, m2, d2 := time.Unix(t2, 0).Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}
