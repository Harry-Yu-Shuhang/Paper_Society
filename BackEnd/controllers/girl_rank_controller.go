package controllers

import (
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GirlRankController struct{}

var photoStep = 10 // 每次返回的数据条数

// GetGirlsHotRank handles GET requests for the hot rank
func (g GirlRankController) GetGirlsHotRank(c *gin.Context) {
	g.fetchRankByType(c, "hot")
}

// GetGirlsScoreRank handles GET requests for the score rank
func (g GirlRankController) GetGirlsScoreRank(c *gin.Context) {
	g.fetchRankByType(c, "average_rate")
}

// Helper function to fetch rank by type
func (g GirlRankController) fetchRankByType(c *gin.Context, orderField string) {
	offset, _ := strconv.Atoi(c.Query("offset"))

	var totalCount int64
	dao.Db.Model(&models.Girl{}).Count(&totalCount)

	var girls []models.Girl
	if err := dao.Db.Order(orderField + " DESC").
		Limit(photoStep).
		Offset(offset).
		Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	hasMoreData := int64(offset+len(girls)) < totalCount

	rankedGirls := make([]models.GirlRank, len(girls))
	for i, girl := range girls {
		rankedGirls[i] = models.GirlRank{
			ID:        girl.ID,
			AvatarSrc: girl.AvatarSrc,
			Name:      girl.Name,
			HotRank:   offset + i + 1,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":        rankedGirls,
		"hasMoreData": hasMoreData,
	})
}
