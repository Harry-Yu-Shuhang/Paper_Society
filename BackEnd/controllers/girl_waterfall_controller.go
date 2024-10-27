package controllers

import (
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GirlWaterFallController struct{}

// GirlProfile 包含前端需要的女孩信息
type GirlProfile struct {
	ID      int    `json:"id"`
	GirlSrc string `json:"girlSrc"`
	Name    string `json:"name"`
	Views   int    `json:"views"`
}

func (g GirlWaterFallController) GetGirlsByIDPagination(c *gin.Context) {
	lastIDStr := c.DefaultQuery("last_id", "0")
	lastID, err := strconv.Atoi(lastIDStr)
	if err != nil || lastID < 0 {
		lastID = 0
	}

	const pageSize = 10
	var girls []models.Girl
	db := dao.Db.Order("id ASC").Where("id > ?", lastID).Limit(pageSize)

	if err := db.Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	selectedGirls := make([]GirlProfile, len(girls))
	for i, girl := range girls {
		selectedGirls[i] = GirlProfile{
			ID:      girl.ID,
			GirlSrc: girl.GirlSrc,
			Name:    girl.Name,
			Views:   girl.Views,
		}
	}

	// 传递下一次分页的 last_id
	var nextID int
	if len(girls) > 0 {
		nextID = girls[len(girls)-1].ID
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Paged girls data fetched successfully",
		"data":    selectedGirls,
		"next_id": nextID,
	})
}
