package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type GirlProfileController struct{}

// GetGirlInfoByID 查询女孩基本信息
func GetGirlInfoByID(gid string) (models.Girl, error) {
	var girl models.Girl
	err := dao.Db.Where("id = ?", gid).First(&girl).Error
	return girl, err
}

// GetStatisticsByGirlID 查询女孩的排名、总人数以及统计数据
func GetStatisticsByGirlID(girl models.Girl) (hotRank, rateRank, totalGirls int64, err error) {
	// 查询总人数
	dao.Db.Table("girls").Count(&totalGirls)

	// 查询 HotRank
	err = dao.Db.Table("girls").
		Select("COUNT(*) + 1 AS hotRank").
		Where("hot > ?", girl.Hot).
		Row().
		Scan(&hotRank)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("HotRank 查询错误: %v", err)
	}

	// 查询 RateRank
	err = dao.Db.Table("girls").
		Select("COUNT(*) + 1 AS rateRank").
		Where("average_rate > ?", girl.AverageRate).
		Row().
		Scan(&rateRank)
	if err != nil {
		return 0, 0, 0, fmt.Errorf("RateRank 查询错误: %v", err)
	}

	return hotRank, rateRank, totalGirls, nil
}

// GetGirlStatistics 查询女孩的签到卡、收藏数和评分
func GetGirlStatistics(gid string) (models.GirlStatistics, error) {
	var stats models.GirlStatistics
	err := dao.Db.Where("girl_id = ?", gid).First(&stats).Error
	//fmt.Printf("查询到的 stats 是: %+v\n", stats)
	return stats, err
}

// GetGirlDetail 获取女孩详情，包括 HotRank、RateRank 和 Voted 状态
func (g GirlProfileController) GetGirlDetail(c *gin.Context) {
	// 获取 gid 参数和 user_id 参数
	gid := c.Query("gid")
	userID := c.Query("user_id")
	fmt.Printf("收到女孩详情请求: gid = %s, user_id = %s\n", gid, userID)

	// 使用 WaitGroup 处理并发查询
	var wg sync.WaitGroup
	var girl models.Girl
	var stats models.GirlStatistics
	var hotRank, rateRank, totalGirls int64
	var voted bool
	var errGirl, errStats, errRank, errVoted error

	// 获取女孩信息
	wg.Add(1)
	go func() {
		defer wg.Done()
		girl, errGirl = GetGirlInfoByID(gid)
	}()

	// 确保 `GetGirlInfoByID` 完成后再启动 `GetStatisticsByGirlID`
	wg.Wait()
	if errGirl != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch girl info"})
		return
	}

	// 重新启动新的 WaitGroup
	wg = sync.WaitGroup{}
	wg.Add(3)

	// 获取统计信息
	go func() {
		defer wg.Done()
		stats, errStats = GetGirlStatistics(gid)
	}()

	// 获取排名和总人数信息
	go func() {
		defer wg.Done()
		hotRank, rateRank, totalGirls, errRank = GetStatisticsByGirlID(girl)
	}()

	// 检查今天是否已投票
	go func() {
		defer wg.Done()
		var votedCount int64
		startOfDay := time.Now().Truncate(24 * time.Hour).Unix()
		errVoted = dao.Db.Table("give_card_records").
			Where("user_id = ? AND girl_id = ? AND given_at >= ?", userID, gid, startOfDay).
			Count(&votedCount).Error
		voted = votedCount > 0 // 如果记录存在，则表示已投票
	}()

	// 等待所有查询完成
	wg.Wait()

	// 错误处理
	if errGirl != nil || errStats != nil || errRank != nil || errVoted != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 计算百分比
	firePercent := int(float64(totalGirls-hotRank) / float64(totalGirls) * 100)
	starPercent := int(float64(totalGirls-rateRank) / float64(totalGirls) * 100)

	// 构建返回的 GirlProfile 数据
	girlProfile := models.GirlProfile{
		ID:            girl.ID,
		Name:          girl.Name,
		AvatarSrc:     girl.AvatarSrc,
		Hot:           girl.Hot,
		AverageRate:   girl.AverageRate,
		GirlSrc:       girl.GirlSrc,
		Age:           girl.Age,
		HotRank:       int64(hotRank),
		RateRank:      int64(rateRank),
		FirePercent:   firePercent,
		StarPercent:   starPercent,
		BackgroundSrc: girl.BackgroundSrc,
		Introduction:  girl.Introduction,
		CardNum:       stats.CardNum,
		LikeNum:       stats.LikeNum,
		RateNum:       []int{stats.RateNumOne, stats.RateNumTwo, stats.RateNumThree, stats.RateNumFour, stats.RateNumFive},
		Voted:         voted, // 设置 Voted 状态
	}

	// 返回包含排名的详细数据
	c.JSON(http.StatusOK, gin.H{
		"message": "Girl detail fetched successfully",
		"data":    girlProfile,
	})
}

// UpdateTodayCardStatus 更新今天的签到卡状态
func (g GirlProfileController) UpdateTodayCardStatus(c *gin.Context) {
	// 创建一个结构体来解析 JSON 请求体
	var request struct {
		UserID int `json:"user_id"`
		GirlID int `json:"girl_id"`
	}

	// 使用 BindJSON 解析请求体中的 JSON 数据
	if err := c.BindJSON(&request); err != nil {
		fmt.Printf("JSON 解析错误: %v\n", err) // 打印错误信息
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	fmt.Printf("收到更新签到卡状态的请求: user_id = %d, girl_id = %d\n", request.UserID, request.GirlID)

	// 获取 user_id 和 girl_id
	userID := request.UserID
	girlID := request.GirlID

	// 检查参数
	if userID == 0 || girlID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and girl_id are required"})
		return
	}

	var count int64
	startOfDay := time.Now().Truncate(24 * time.Hour).Unix()

	// 检查今天是否已送过签到卡
	err := dao.Db.Table("give_card_records").
		Where("user_id = ? AND girl_id = ? AND given_at >= ?", userID, girlID, startOfDay).
		Count(&count).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check card status"})
		return
	}

	if count > 0 {
		// 如果已送过签到卡
		c.JSON(http.StatusOK, gin.H{"alreadyGiven": true})
	} else {
		// 如果未送过签到卡，使用 goroutine 并发插入新记录和更新 card_num
		var wg sync.WaitGroup
		var insertErr, updateErr error

		// 插入新记录
		wg.Add(1)
		go func() {
			defer wg.Done()
			newRecord := models.GiveCardRecord{
				UserID:  userID,
				GirlID:  girlID,
				GivenAt: startOfDay,
			}
			insertErr = dao.Db.Create(&newRecord).Error
		}()

		// 更新 card_num 字段
		wg.Add(1)
		go func() {
			defer wg.Done()
			updateErr = dao.Db.Table("girl_statistics").
				Where("girl_id = ?", girlID).
				Update("card_num", gorm.Expr("card_num + ?", 1)).Error
		}()

		// 等待两个 goroutine 完成
		wg.Wait()

		// 检查错误
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card status"})
			return
		}
		if updateErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card count"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"alreadyGiven": false})
	}
}
