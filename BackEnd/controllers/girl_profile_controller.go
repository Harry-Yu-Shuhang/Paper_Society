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

	// 查询 HotRank 使用窗口函数 RANK() 排名
	queryHotRank := `
		SELECT hot_rank FROM (
			SELECT id, RANK() OVER (ORDER BY hot DESC) AS hot_rank
			FROM girls
		) ranked_girls WHERE id = ?
	`
	err = dao.Db.Raw(queryHotRank, girl.ID).Scan(&hotRank).Error
	if err != nil {
		return 0, 0, 0, fmt.Errorf("HotRank 查询错误: %v", err)
	}

	// 查询 RateRank 使用窗口函数 RANK() 排名
	queryRateRank := `
		SELECT rate_rank FROM (
			SELECT id, RANK() OVER (ORDER BY average_rate DESC) AS rate_rank
			FROM girls
		) ranked_girls WHERE id = ?
	`
	err = dao.Db.Raw(queryRateRank, girl.ID).Scan(&rateRank).Error
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

// GetGirlDetail 获取女孩详情，包括 HotRank、RateRank、Voted 和 Liked 状态
func (g GirlProfileController) GetGirlDetail(c *gin.Context) {
	// 获取 gid 参数和 user_id 参数
	gid := c.Query("gid")
	userID := c.Query("user_id")

	// 使用 WaitGroup 处理并发查询
	var wg sync.WaitGroup
	var girl models.Girl
	var stats models.GirlStatistics
	var hotRank, rateRank, totalGirls int64
	var voted, liked bool
	var myRate int
	var errGirl, errStats, errRank, errVoted, errLiked, errMyRate error

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
	wg.Add(5) // 增加到5个并发查询

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

	// 检查是否已点赞
	go func() {
		defer wg.Done()
		var likeCount int64
		errLiked = dao.Db.Table("give_like_records").
			Where("user_id = ? AND girl_id = ?", userID, gid).
			Count(&likeCount).Error
		liked = likeCount > 0 // 如果记录存在，则表示已点赞
	}()

	// 查询用户的评分记录
	go func() {
		defer wg.Done()
		var rateRecord models.GiveRateRecord
		errMyRate = dao.Db.Table("give_rate_records").
			Where("user_id = ? AND girl_id = ?", userID, gid).
			Select("rating").
			First(&rateRecord).Error
		if errMyRate == gorm.ErrRecordNotFound {
			myRate = 0 // 如果没有找到记录，则设置 MyRate 为 0
			errMyRate = nil
		} else {
			myRate = rateRecord.Rating
		}
	}()

	// 等待所有查询完成
	wg.Wait()

	// 错误处理
	if errGirl != nil || errStats != nil || errRank != nil || errVoted != nil || errLiked != nil || errMyRate != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 计算百分比
	var firePercent, starPercent int64
	if totalGirls > 0 {
		firePercent = int64(float64(totalGirls-hotRank) / float64(totalGirls) * 100)
		starPercent = int64(float64(totalGirls-rateRank) / float64(totalGirls) * 100)
	}

	// 构建返回的 GirlProfile 数据
	girlProfile := models.GirlProfile{
		ID:            girl.ID,
		Name:          girl.Name,
		AvatarSrc:     girl.AvatarSrc,
		Hot:           girl.Hot,
		AverageRate:   girl.AverageRate,
		GirlSrc:       girl.GirlSrc,
		Age:           girl.Age,
		HotRank:       hotRank,
		RateRank:      rateRank,
		FirePercent:   firePercent,
		StarPercent:   starPercent,
		BackgroundSrc: girl.BackgroundSrc,
		Introduction:  girl.Introduction,
		CardNum:       stats.CardNum,
		LikeNum:       stats.LikeNum,
		RateNum:       []int{stats.RateNumOne, stats.RateNumTwo, stats.RateNumThree, stats.RateNumFour, stats.RateNumFive},
		Voted:         voted,
		Liked:         liked,  // 设置 Liked 状态
		MyRate:        myRate, // 设置 MyRate 值
	}

	// 返回包含排名的详细数据
	c.JSON(http.StatusOK, gin.H{
		"message": "Girl detail fetched successfully",
		"data":    girlProfile,
	})
	fmt.Println("女孩详情获取成功", girlProfile.Liked, girlProfile.MyRate)
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
		// 如果未送过签到卡，使用 goroutine 并发插入新记录、更新 card_num 和 hot
		var wg sync.WaitGroup
		var insertErr, updateStatsErr, updateHotErr error

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

		// 更新 girl_statistics 表中的 card_num
		wg.Add(1)
		go func() {
			defer wg.Done()
			statsUpdate := models.GirlStatisticsUpdate{
				CardNum: 1, // 增加的数量，可以更改为其他值
			}
			updateStatsErr = dao.Db.Table("girl_statistics").
				Where("girl_id = ?", girlID).
				Update("card_num", gorm.Expr("card_num + ?", statsUpdate.CardNum)).Error
		}()

		// 更新 girls 表中的 hot
		wg.Add(1)
		go func() {
			defer wg.Done()
			girlUpdate := models.GirlUpdate{
				Hot: 1, // 增加的热度
			}
			updateHotErr = dao.Db.Table("girls").
				Where("id = ?", girlID).
				Update("hot", gorm.Expr("hot + ?", girlUpdate.Hot)).Error
		}()

		// 等待所有 goroutine 完成
		wg.Wait()

		// 检查错误
		if insertErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card status"})
			return
		}
		if updateStatsErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update card count"})
			return
		}
		if updateHotErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hot count"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"alreadyGiven": false})
	}
}

// IncrementViews 增加指定女孩的 views 计数
func (g GirlProfileController) IncreaseViews(c *gin.Context) {
	var request struct {
		GirlID int `json:"girl_id"`
	}

	// 解析 JSON 请求体
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	fmt.Println("收到增加女孩 views 的请求", request.GirlID)

	// 更新 views 字段
	err := dao.Db.Table("girls").
		Where("id = ?", request.GirlID).
		Update("views", gorm.Expr("views + ?", 1)).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to increment views"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Views incremented successfully"})
}
