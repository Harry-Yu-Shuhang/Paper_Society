package controllers

import (
	"fmt"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

var MySQLVersion string

type GirlRankController struct{}

var photoStep = 10000 // 每次返回的数据条数

// GetGirlsHotRank handles GET requests for the hot rank
func (g GirlRankController) GetGirlsHotRank(c *gin.Context) {
	// 检查是否有 ids 参数，若有则调用 GetGirlsByIds
	if ids := c.QueryArray("ids"); len(ids) > 0 {
		g.GetGirlsByIds(c)
		return
	}
	g.fetchRankByType(c, "hot")
}

// GetGirlsScoreRank handles GET requests for the score rank
func (g GirlRankController) GetGirlsScoreRank(c *gin.Context) {
	// 检查是否有 ids 参数，若有则调用 GetGirlsByIds
	if ids := c.QueryArray("ids"); len(ids) > 0 {
		g.GetGirlsByIds(c)
		return
	}
	g.fetchRankByType(c, "average_rate")
}

func (g GirlRankController) fetchRankByType(c *gin.Context, orderField string) {
	offset, _ := strconv.Atoi(c.Query("offset"))

	// 判断是否是首次加载或刷新
	isInitialLoad := offset == 0

	var rankedGirls []models.GirlRank

	// 根据 MySQL 版本选择查询语句
	var query string
	if strings.HasPrefix(dao.MySQLVersion, "8") {
		// MySQL 8.0 及以上版本使用 RANK() 窗口函数
		query = `
			SELECT id, avatar_src, name, hot, 
					RANK() OVER (ORDER BY ` + orderField + ` DESC) AS hot_rank
			FROM girls
			ORDER BY ` + orderField + ` DESC
			LIMIT ? OFFSET ?
		`
	} else {
		// MySQL 5.7 及以下版本使用变量手动排名
		query = `
			SELECT id, avatar_src, name, hot,
				@rank := IF(@prev_hot = hot, @rank, @rank + 1) AS hot_rank,
				@prev_hot := hot
			FROM (
				SELECT id, avatar_src, name, hot
				FROM girls
				ORDER BY hot DESC
			) AS sorted_girls,
			(SELECT @rank := 0, @prev_hot := NULL) AS vars
			LIMIT ? OFFSET ?
		`
	}

	if err := dao.Db.Raw(query, photoStep, offset).Scan(&rankedGirls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 获取所有ID列表（用于首次加载或刷新时的缓存）
	var idList []int
	if isInitialLoad {
		var allGirls []models.Girl
		dao.Db.Select("id").Order(orderField + " DESC").Find(&allGirls)
		for _, girl := range allGirls {
			idList = append(idList, girl.ID)
		}
	}

	// 是否还有更多数据
	var totalCount int64
	dao.Db.Model(&models.Girl{}).Count(&totalCount)
	hasMoreData := int64(offset+len(rankedGirls)) < totalCount

	// 调试输出 rankedGirls 数据
	fmt.Printf("Ranked Girls with DENSE_RANK: %+v\n", rankedGirls)

	// 返回数据
	response := gin.H{
		"data":        rankedGirls,
		"hasMoreData": hasMoreData,
	}
	if isInitialLoad {
		response["idList"] = idList // 仅在首次加载或刷新时返回 ID 列表
	}
	c.JSON(http.StatusOK, response)
}

func (g GirlRankController) GetGirlsByIds(c *gin.Context) {
	idsStr := c.Query("ids")
	offset, _ := strconv.Atoi(c.Query("offset")) // 获取前端传递的 offset
	//fmt.Printf("Received idsStr: %v, offset: %v\n", idsStr, offset)

	var ids []int
	for _, idStr := range strings.Split(idsStr, ",") {
		id, err := strconv.Atoi(idStr)
		if err == nil {
			ids = append(ids, id)
		}
	}
	//fmt.Printf("Converted ids: %v\n", ids)

	var girls []models.Girl
	if err := dao.Db.Where("id IN ?", ids).Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data by IDs"})
		return
	}

	// 按照 offset 更新 HotRank
	rankedGirls := make([]models.GirlRank, len(girls))
	for i, girl := range girls {
		rankedGirls[i] = models.GirlRank{
			ID:        girl.ID,
			AvatarSrc: girl.AvatarSrc,
			Name:      girl.Name,
			HotRank:   offset + i + 1, // 使用 offset 确保连续排序
		}
	}

	//fmt.Printf("Ranked Girls in GetGirlsByIds: %+v\n", rankedGirls)

	hasMoreData := len(rankedGirls) >= len(ids)
	c.JSON(http.StatusOK, gin.H{
		"data":        rankedGirls,
		"hasMoreData": hasMoreData,
	})
}
