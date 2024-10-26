package controllers

import (
	"math/rand"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"time"

	"github.com/gin-gonic/gin"
)

type GirlWaterFallController struct{}

var photo_step = 10

// GirlProfile 包含前端需要的女孩信息
type GirlProfile struct {
	ID      int    `json:"id"`
	GirlSrc string `json:"girlSrc"`
	Name    string `json:"name"`
}

// ExcludeAndFetchGirls 接收缓存数据的 ID 列表，排除这些数据并返回随机的 5 条记录
func (g GirlWaterFallController) ExcludeAndFetchGirls(c *gin.Context) {
	var cachedData struct {
		IDs []int `json:"ids"` // 缓存中已存在的女孩 ID 列表
	}

	// 从请求中绑定 JSON 数据
	if err := c.ShouldBindJSON(&cachedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}

	// 查询数据库中未包含在缓存 ID 列表中的记录
	var girls []models.Girl
	db := dao.Db
	if len(cachedData.IDs) > 0 {
		db = db.Not("id IN (?)", cachedData.IDs)
	}
	if err := db.Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 如果数据库查询到的数据少于5条，直接返回全部数据
	if len(girls) <= photo_step {
		selectedGirls := make([]GirlProfile, len(girls))
		for i, girl := range girls {
			selectedGirls[i] = GirlProfile{
				ID:      girl.ID,
				GirlSrc: girl.GirlSrc,
				Name:    girl.Name,
			}
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Girls data fetched successfully",
			"data":    selectedGirls,
		})
		return
	}

	// 随机生成种子并打乱数据，返回前5条
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(girls), func(i, j int) { girls[i], girls[j] = girls[j], girls[i] })

	selectedGirls := make([]GirlProfile, 0, photo_step)
	for i := 0; i < photo_step; i++ {
		selectedGirls = append(selectedGirls, GirlProfile{
			ID:      girls[i].ID,
			GirlSrc: girls[i].GirlSrc,
			Name:    girls[i].Name,
		})
	}

	// fmt.Println("selectedGirls是", selectedGirls)

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"message": "Girls data fetched successfully excluding cached data",
		"data":    selectedGirls,
	})
}
