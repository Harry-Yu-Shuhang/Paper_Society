package controllers

import (
	"fmt"
	"math/rand"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"time"

	"github.com/gin-gonic/gin"
)

type GirlWaterFallController struct{}

type RenderedIDsRequest struct {
	RenderedIds []int `json:"renderedIds"`
}

func (g GirlWaterFallController) PostRandomGirls(c *gin.Context) {
	var girls []models.Girl
	var request RenderedIDsRequest // 使用结构体接收请求
	db := dao.Db

	// 正确绑定 JSON 数据到 request 结构体
	if err := c.ShouldBindJSON(&request); err != nil {
		fmt.Println("Error binding JSON:", err) // 打印错误日志
		request.RenderedIds = []int{}           // 如果解析失败，将 renderedIds 初始化为空数组
	}

	//fmt.Println("前端发过来的 renderedIds:", request.RenderedIds)

	// 检查是否需要过滤
	query := db
	if len(request.RenderedIds) > 0 {
		query = query.Where("id NOT IN (?)", request.RenderedIds)
	}

	// 查询数据库并限制结果为8个 8要和前端一致哦
	if err := query.Limit(10).Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 随机打乱数据顺序
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	r.Shuffle(len(girls), func(i, j int) { girls[i], girls[j] = girls[j], girls[i] })

	// 转换为 GirlProfile 格式
	// selectedGirls := make([]GirlProfile, len(girls))
	selectedGirls := make([]models.GirlWaterfall, len(girls))
	for i, girl := range girls {
		selectedGirls[i] = models.GirlWaterfall{
			ID:      girl.ID,
			GirlSrc: girl.GirlSrc,
			Name:    girl.Name,
			Views:   girl.Views,
		}
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"message": "Filtered and randomized girls data fetched successfully",
		"data":    selectedGirls,
	})
}

func (g GirlWaterFallController) GetSearchGirls(c *gin.Context) {
	var girls []models.Girl
	keyword := c.Query("keyword") // 从 URL 查询参数中获取关键词

	// 构建数据库查询
	query := dao.Db
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	// 查询数据库
	if err := query.Find(&girls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 将结果转换为 GirlProfile 格式
	searchResults := make([]models.GirlWaterfall, len(girls))
	for i, girl := range girls {
		searchResults[i] = models.GirlWaterfall{
			ID:      girl.ID,
			GirlSrc: girl.GirlSrc,
			Name:    girl.Name,
			Views:   girl.Views,
		}
	}

	// 返回数据
	c.JSON(http.StatusOK, gin.H{
		"message": "Search results fetched successfully",
		"data":    searchResults,
	})
}
