package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"sync"

	"github.com/gin-gonic/gin"
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

// GetGirlDetail 获取女孩详情，包括 HotRank 和 RateRank
func (g GirlProfileController) GetGirlDetail(c *gin.Context) {
	// 获取 gid 参数
	gid := c.Query("gid")

	// 使用 WaitGroup 处理并发查询
	var wg sync.WaitGroup
	var girl models.Girl
	var stats models.GirlStatistics
	var hotRank, rateRank, totalGirls int64
	var errGirl, errStats, errRank error

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
	wg.Add(2)

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

	// 等待查询完成
	wg.Wait()

	// 错误处理
	if errGirl != nil || errStats != nil || errRank != nil {
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
	}

	// 返回包含排名的详细数据
	c.JSON(http.StatusOK, gin.H{
		"message": "Girl detail fetched successfully",
		"data":    girlProfile,
	})
	//fmt.Printf("返回给前端的girlProfile是 %+v\n", girlProfile)
}
