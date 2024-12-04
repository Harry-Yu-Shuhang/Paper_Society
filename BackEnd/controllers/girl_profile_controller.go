package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"strings"
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
func GetStatisticsByGirlID(girl models.Girl) (hotRank, rateRank, totalGirls int64, hotOver int64, rateOver int64, err error) {
	// 查询总人数
	dao.Db.Table("girls").Count(&totalGirls)

	var queryHotRank, queryRateRank string

	// 查询比当前用户热度低的数量
	err = dao.Db.Table("girls").
		Where("hot < ?", girl.Hot).
		Count(&hotOver).Error
	if err != nil {
		return 0, 0, 0, 0, 0, fmt.Errorf("HotRank 查询错误: %v", err)
	}

	// 查询比当前用户评分低的数量
	err = dao.Db.Table("girls").
		Where("average_rate < ?", girl.AverageRate).
		Count(&rateOver).Error
	if err != nil {
		return 0, 0, 0, 0, 0, fmt.Errorf("RateRank 查询错误: %v", err)
	}

	//根据 MySQL 版本选择查询语句
	if strings.HasPrefix(dao.MySQLVersion, "8") {
		// MySQL 8.0 及以上版本使用 RANK() 窗口函数
		// queryHotRank = `
		// 	SELECT hot_rank FROM (
		// 		SELECT id, RANK() OVER (ORDER BY hot DESC) AS hot_rank
		// 		FROM girls
		// 	) ranked_girls WHERE id = ?
		// `
		queryHotRank = `
		SELECT COUNT(*) + 1 AS hot_rank
		FROM girls
		WHERE hot > (SELECT hot FROM girls WHERE id = ?);
		`

		// queryRateRank = `
		// 	SELECT rate_rank FROM (
		// 		SELECT id, RANK() OVER (ORDER BY average_rate DESC) AS rate_rank
		// 		FROM girls
		// 	) ranked_girls WHERE id = ?
		// `

		queryRateRank = `
		SELECT COUNT(*) + 1 AS rate_rank
		FROM girls
		WHERE average_rate > (SELECT average_rate FROM girls WHERE id = ?);
		`
	} else {
		// MySQL 5.7 及以下版本使用手动排名
		queryHotRank = `
			SELECT hot_rank FROM (
				SELECT id,
					   @rank := IF(@prev_hot = hot, @rank, @rank + 1) AS hot_rank,
					   @prev_hot := hot
				FROM (
					SELECT id, hot
					FROM girls
					ORDER BY hot DESC
				) AS sorted_girls,
				(SELECT @rank := 0, @prev_hot := NULL) AS vars
			) ranked_girls WHERE id = ?
		`

		queryRateRank = `
			SELECT rate_rank FROM (
				SELECT id,
					   @rank := IF(@prev_rate = average_rate, @rank, @rank + 1) AS rate_rank,
					   @prev_rate := average_rate
				FROM (
					SELECT id, average_rate
					FROM girls
					ORDER BY average_rate DESC
				) AS sorted_girls,
				(SELECT @rank := 0, @prev_rate := NULL) AS vars
			) ranked_girls WHERE id = ?
		`
	}

	//查询 HotRank
	err = dao.Db.Raw(queryHotRank, girl.ID).Scan(&hotRank).Error
	if err != nil {
		return 0, 0, 0, 0, 0, fmt.Errorf("HotRank 查询错误: %v", err)
	}

	//查询 RateRank
	err = dao.Db.Raw(queryRateRank, girl.ID).Scan(&rateRank).Error
	if err != nil {
		return 0, 0, 0, 0, 0, fmt.Errorf("RateRank 查询错误: %v", err)
	}

	// return hotRank, rateRank, totalGirls, nil
	return hotRank, rateRank, totalGirls, hotOver, rateOver, nil
}

// GetGirlStatistics 查询女孩的签到卡、收藏数和评分
func GetGirlStatistics(gid string) (models.GirlStatistics, error) {
	var stats models.GirlStatistics
	// err := dao.Db.Where("girl_id = ?", gid).First(&stats).Error
	err := dao.Db.Where("girl_id = ?", gid).Take(&stats).Error
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
	var hotRank, rateRank, totalGirls, hotOver, rateOver int64
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
		hotRank, rateRank, totalGirls, hotOver, rateOver, errRank = GetStatisticsByGirlID(girl)
	}()

	// 检查今天是否已投票
	go func() {
		defer wg.Done()
		var votedCount int64
		//startOfDay := time.Now().Truncate(24 * time.Hour).Unix()
		loc := time.FixedZone("Asia/Shanghai", 8*3600) // UTC+8
		now := time.Now().In(loc)
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).Unix()
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
		// errMyRate = dao.Db.Table("give_rate_records").
		// 	Where("user_id = ? AND girl_id = ?", userID, gid).
		// 	Select("rating").
		// 	First(&rateRecord).Error

		errMyRate = dao.Db.Table("give_rate_records").
			Where("user_id = ? AND girl_id = ?", userID, gid).
			Select("rating").
			Take(&rateRecord).Error
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
		firePercent = int64(float64(hotOver) / float64(totalGirls) * 100)
		starPercent = int64(float64(rateOver) / float64(totalGirls) * 100)
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
		Liked:         liked,             // 设置 Liked 状态
		MyRate:        myRate,            // 设置 MyRate 值
		Contributors:  girl.Contributors, //V1.1.5新增字段
	}

	// 返回包含排名的详细数据
	c.JSON(http.StatusOK, gin.H{
		"message": "Girl detail fetched successfully",
		"data":    girlProfile,
	})
	fmt.Println("女孩详情获取成功", girlProfile.Liked, girlProfile.MyRate)
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
