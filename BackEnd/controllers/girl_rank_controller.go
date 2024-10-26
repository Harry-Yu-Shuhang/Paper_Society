package controllers

import (
	"net/http"
	"paper_community/dao"
	"paper_community/models"

	"github.com/gin-gonic/gin"
)

type GirlRankController struct{}

// GirlRank 包含返回给前端的数据结构（不包含 hot 和 AverageRate 字段，包含 HotRank 字段）
type GirlRank struct {
	ID        int    `json:"id"`
	AvatarSrc string `json:"avatarSrc"`
	Name      string `json:"name"`
	HotRank   int    `json:"hotRank"` // 排名
}

// SortAndRankGirls 通用排序和排名函数，根据指定字段降序排序，并生成排名
func SortAndRankGirls(field string) ([]GirlRank, error) {
	var girls []models.Girl

	// 按指定字段降序排序并获取数据
	if err := dao.Db.Order(field + " DESC").Find(&girls).Error; err != nil {
		return nil, err
	}

	// 构建包含排名信息的结果切片
	rankedGirls := make([]GirlRank, len(girls))
	for i, girl := range girls {
		rankedGirls[i] = GirlRank{
			ID:        girl.ID,
			AvatarSrc: girl.AvatarSrc,
			Name:      girl.Name,
			HotRank:   i + 1, // 设置排名，从 1 开始
		}
	}
	return rankedGirls, nil
}

// GetGirlsHotRank 按照 hot 字段降序排序并返回排名
func (g GirlRankController) GetGirlsHotRank(c *gin.Context) {
	// 使用通用排序和排名函数
	rankedGirls, err := SortAndRankGirls("hot")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"message": "Girls data fetched successfully by hot rank",
		"data":    rankedGirls,
	})
}

// GetGirlsScoreRank 按照 AverageRate 字段降序排序并返回排名
func (g GirlRankController) GetGirlsScoreRank(c *gin.Context) {
	// 使用通用排序和排名函数
	rankedGirls, err := SortAndRankGirls("average_rate")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"message": "Girls data fetched successfully by score rank",
		"data":    rankedGirls,
	})
}
