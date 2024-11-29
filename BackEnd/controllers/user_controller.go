package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"paper_community/utils"
	"strconv"
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
	var userHot int
	var loginTime int64
	var nickName string

	isSameDayLogin := false
	if isNewUser {
		userInfo.CardCount = 6
		userInfo.CreateTime = time.Now().Unix()
		// userHot = calculateUserHot(userInfo.ID) // 计算新用户的热度
		userInfo.UserHot = 0
		if err := dao.Db.Create(&userInfo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new user info"})
			return
		}

		// 更新昵称为 "新用户" + ID
		userInfo.NickName = fmt.Sprintf("新同学%d", userInfo.ID)
		if err := dao.Db.Model(&userInfo).Update("nick_name", userInfo.NickName).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user nickname"})
			return
		}

		userID = userInfo.ID
		cardCount = userInfo.CardCount
		createTime = userInfo.CreateTime
		loginTime = createTime
		nickName = userInfo.NickName
	} else {
		isSameDayLogin = isSameDay(existingUser.LoginTime, userInfo.LoginTime)
		if !isSameDayLogin {
			existingUser.CardCount += 3
		}
		existingUser.LoginTime = userInfo.LoginTime

		// 使用 goroutine 并发计算热度
		userHot = calculateUserHot(existingUser.ID)
		existingUser.UserHot = userHot

		if err := dao.Db.Save(&existingUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user info"})
			return
		}
		userID = existingUser.ID
		cardCount = existingUser.CardCount
		createTime = existingUser.CreateTime
		loginTime = existingUser.LoginTime
		nickName = existingUser.NickName
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "User info updated successfully",
		"isSameDay":  isSameDayLogin,
		"isNewUser":  isNewUser,
		"cardCount":  cardCount,
		"userID":     userID,
		"createTime": createTime,
		"userHot":    userHot,
		"loginTime":  loginTime,
		"nickName":   nickName,
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
// func isSameDay(t1, t2 int64) bool {
// 	y1, m1, d1 := time.Unix(t1, 0).Date()
// 	y2, m2, d2 := time.Unix(t2, 0).Date()
// 	return y1 == y2 && m1 == m2 && d1 == d2
// }

// isSameDay 检查两个 UNIX 时间戳是否在同一天（东八区）
func isSameDay(t1, t2 int64) bool {
	// 定义东八区时区
	loc, err := time.LoadLocation("Asia/Shanghai")
	if err != nil {
		loc = time.FixedZone("CST", 8*3600) // 如果加载失败，使用固定的东八区时间
	}

	y1, m1, d1 := time.Unix(t1, 0).In(loc).Date()
	y2, m2, d2 := time.Unix(t2, 0).In(loc).Date()
	return y1 == y2 && m1 == m2 && d1 == d2
}

func (u UserController) GetUserRanking(c *gin.Context) {
	userID := c.Query("user_id")

	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	var currentUser models.UserInfo
	if err := dao.Db.Where("id = ?", userID).First(&currentUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// 获取超过的用户百分比（签到卡）
	var cardCountHigher int64
	dao.Db.Model(&models.UserInfo{}).
		Where("card_count < ?", currentUser.CardCount).
		Count(&cardCountHigher)

	// 获取超过的用户百分比（贡献热度）
	var userHotHigher int64
	dao.Db.Model(&models.UserInfo{}).
		Where("user_hot < ?", currentUser.UserHot).
		Count(&userHotHigher)

	var totalUsers int64
	dao.Db.Model(&models.UserInfo{}).Count(&totalUsers)

	cardPercent := float64(cardCountHigher) / float64(totalUsers) * 100
	hotPercent := float64(userHotHigher) / float64(totalUsers) * 100
	// 保留两位小数
	formattedCardPercent := fmt.Sprintf("%.2f", cardPercent)
	formattedHotPercent := fmt.Sprintf("%.2f", hotPercent)

	c.JSON(http.StatusOK, gin.H{
		"cardPercent": formattedCardPercent,
		"hotPercent":  formattedHotPercent,
	})
}

// 获取用户收藏的角色
func (u UserController) GetUserFavorites(c *gin.Context) {
	userID := c.Query("user_id")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
		return
	}

	// 将 userID 转换为整数
	uid, err := strconv.Atoi(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id"})
		return
	}

	// 查询用户收藏的记录
	var likeRecords []models.GiveLikeRecord
	if err := dao.Db.Where("user_id = ?", uid).Find(&likeRecords).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}

	if len(likeRecords) == 0 {
		c.JSON(http.StatusOK, gin.H{"favorites": []models.FavoriteList{}})
		return
	}

	var favorites []models.FavoriteList

	// 根据收藏记录查询角色信息，并构建返回数据
	for _, record := range likeRecords {
		var girl models.GirlRank
		if err := dao.Db.Table("girls").Select("id", "avatar_src", "name").
			Where("id = ?", record.GirlID).First(&girl).Error; err != nil {
			fmt.Printf("Failed to find girl with ID %d: %v\n", record.GirlID, err)
			continue
		}

		// 构建 FavoriteList 数据
		favorite := models.FavoriteList{
			ID:        record.ID,
			GirlID:    girl.ID,
			AvatarSrc: girl.AvatarSrc,
			Name:      girl.Name,
			CreatedAt: record.CreatedAt,
		}
		favorites = append(favorites, favorite)
	}

	// 返回查询结果
	c.JSON(http.StatusOK, gin.H{
		"favorites": favorites,
	})
}

func (u UserController) GetUserInfo(c *gin.Context) {
	// 从查询参数中获取 open_id
	openID := c.Query("open_id")
	if openID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "open_id is required"})
		return
	}

	var userInfo models.UserInfo
	// 根据 open_id 查询用户信息
	if err := dao.Db.Where("open_id = ?", openID).First(&userInfo).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user info"})
		return
	}

	// 返回查询到的用户信息
	c.JSON(http.StatusOK, gin.H{
		"userID":     userInfo.ID,
		"nickName":   userInfo.NickName,
		"avatarUrl":  userInfo.AvatarUrl,
		"cardCount":  userInfo.CardCount,
		"userHot":    userInfo.UserHot,
		"createTime": userInfo.CreateTime,
		"loginTime":  userInfo.LoginTime,
		"openID":     userInfo.OpenID,
	})
}

func (u UserController) CheckNickname(c *gin.Context) {
	// 获取查询参数
	nickname := c.Query("nickName")
	if nickname == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nickname is required"})
		return
	}

	// 查询数据库是否存在重复昵称
	var count int64
	if err := dao.Db.Table("user_infos").
		Where("nick_name = ?", nickname).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check nickname"})
		return
	}

	// 返回是否重复
	if count > 0 {
		c.JSON(http.StatusOK, gin.H{"isDuplicate": true, "message": "Nickname already exists"})
	} else {
		c.JSON(http.StatusOK, gin.H{"isDuplicate": false, "message": "Nickname is available"})
	}
}
