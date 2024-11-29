package controllers

import (
	"fmt"
	"math"
	"net/http"
	"paper_community/dao"
	"paper_community/models"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UpdateRecordsController struct{}

func (u UpdateRecordsController) UpdateLikeRecords(c *gin.Context) {
	var request struct {
		UserID int    `json:"user_id"`
		GirlID int    `json:"girl_id"`
		Action string `json:"action"` // "like" 或 "unlike"
	}

	// 解析请求体
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	var wg sync.WaitGroup
	var errInsert, errDelete, errUpdateHot, errUpdateLikeNum error
	var count int64

	if request.Action == "like" {
		// 检查是否已存在记录
		err := dao.Db.Model(&models.GiveLikeRecord{}).
			Where("user_id = ? AND girl_id = ?", request.UserID, request.GirlID).
			Count(&count).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		if count == 0 {
			wg.Add(3)

			// 插入新记录
			go func() {
				defer wg.Done()
				newRecord := models.GiveLikeRecord{
					UserID:    request.UserID,
					GirlID:    request.GirlID,
					CreatedAt: time.Now().Unix(), // 记录当前时间的 Unix 时间戳
				}
				errInsert = dao.Db.Create(&newRecord).Error
			}()

			// 增加热度
			go func() {
				defer wg.Done()
				errUpdateHot = dao.Db.Table("girls").
					Where("id = ?", request.GirlID).
					Update("hot", gorm.Expr("hot + ?", 3)).Error
			}()

			// 增加收藏数量
			go func() {
				defer wg.Done()
				errUpdateLikeNum = dao.Db.Table("girl_statistics").
					Where("girl_id = ?", request.GirlID).
					Update("like_num", gorm.Expr("like_num + ?", 1)).Error
			}()

			wg.Wait()

			if errInsert != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create like record"})
				return
			}
			if errUpdateHot != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hot count"})
				return
			}
			if errUpdateLikeNum != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update like count"})
				return
			}
		}
	} else if request.Action == "unlike" {
		wg.Add(3)

		// 删除记录
		go func() {
			defer wg.Done()
			errDelete = dao.Db.Where("user_id = ? AND girl_id = ?", request.UserID, request.GirlID).
				Delete(&models.GiveLikeRecord{}).Error
		}()

		// 减少热度
		go func() {
			defer wg.Done()
			errUpdateHot = dao.Db.Table("girls").
				Where("id = ?", request.GirlID).
				Update("hot", gorm.Expr("hot - ?", 3)).Error
		}()

		// 减少收藏数量
		go func() {
			defer wg.Done()
			errUpdateLikeNum = dao.Db.Table("girl_statistics").
				Where("girl_id = ?", request.GirlID).
				Update("like_num", gorm.Expr("like_num - ?", 1)).Error
		}()

		wg.Wait()

		if errDelete != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove like record"})
			return
		}
		if errUpdateHot != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update hot count"})
			return
		}
		if errUpdateLikeNum != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update like count"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Action processed successfully"})
}

func (u UpdateRecordsController) UpdateRateRecords(c *gin.Context) {
	var request struct {
		UserID int `json:"user_id"`
		GirlID int `json:"girl_id"`
		Rating int `json:"rating"`
	}

	// 解析请求体
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	var existingRecord models.GiveRateRecord
	var isFirstRating bool
	var oldRating int

	// 查询是否已有评分记录
	err := dao.Db.Where("user_id = ? AND girl_id = ?", request.UserID, request.GirlID).First(&existingRecord).Error
	if err == gorm.ErrRecordNotFound {
		isFirstRating = true
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	} else {
		oldRating = existingRecord.Rating
	}

	// 新的评分记录
	newRecord := models.GiveRateRecord{
		UserID:  request.UserID,
		GirlID:  request.GirlID,
		Rating:  request.Rating,
		RatedAt: time.Now().Unix(),
	}

	var wg sync.WaitGroup
	var updateErr error

	// 启动协程插入或更新评分记录和热度
	wg.Add(1)
	go func() {
		defer wg.Done()
		if isFirstRating {
			// 首次评分
			updateErr = dao.Db.Transaction(func(tx *gorm.DB) error {
				if err := tx.Create(&newRecord).Error; err != nil {
					return err
				}
				return tx.Table("girls").
					Where("id = ?", request.GirlID).
					Update("hot", gorm.Expr("hot + ?", 1)).Error
			})
		} else {
			// 更新评分记录
			updateErr = dao.Db.Model(&existingRecord).
				Updates(map[string]interface{}{
					"rating":   request.Rating,
					"rated_at": newRecord.RatedAt,
				}).Error
		}
	}()

	// 启动协程更新 girl_statistics 表的评分计数
	wg.Add(1)
	go func() {
		defer wg.Done()
		updateErr = dao.Db.Transaction(func(tx *gorm.DB) error {
			if isFirstRating {
				columnName := getColumnNameForRating(request.Rating)
				return tx.Table("girl_statistics").
					Where("girl_id = ?", request.GirlID).
					Update(columnName, gorm.Expr(columnName+" + ?", 1)).Error
			}
			// 非首次评分更新：旧评分人数 -1，新评分人数 +1
			if oldRating > 0 {
				oldColumnName := getColumnNameForRating(oldRating)
				newColumnName := getColumnNameForRating(request.Rating)
				if oldColumnName != "" && newColumnName != "" {
					return tx.Table("girl_statistics").
						Where("girl_id = ?", request.GirlID).
						Update(oldColumnName, gorm.Expr(oldColumnName+" - ?", 1)).
						Update(newColumnName, gorm.Expr(newColumnName+" + ?", 1)).Error
				}
			}
			return nil
		})
	}()

	// 等待评分计数更新完成
	wg.Wait()

	// 检查 girl_statistics 更新是否出错
	if updateErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rating count"})
		return
	}

	// 启动计算并更新 average_rate 的协程
	wg.Add(1)
	go func() {
		defer wg.Done()
		updateErr = updateAverageRate(request.GirlID)
	}()

	// 等待所有协程完成
	wg.Wait()

	// 检查是否有错误
	if updateErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rating updated successfully"})
}

// getColumnNameForRating 获取对应评分的统计列名
func getColumnNameForRating(rating int) string {
	switch rating {
	case 1:
		return "rate_num_one"
	case 2:
		return "rate_num_two"
	case 3:
		return "rate_num_three"
	case 4:
		return "rate_num_four"
	case 5:
		return "rate_num_five"
	default:
		return ""
	}
}

// updateAverageRate 计算并更新 girls 表的 average_rate
func updateAverageRate(girlID int) error {
	var stats struct {
		RateNumOne   int
		RateNumTwo   int
		RateNumThree int
		RateNumFour  int
		RateNumFive  int
	}

	// 查询统计表中的评分人数
	if err := dao.Db.Table("girl_statistics").
		Where("girl_id = ?", girlID).
		Select("rate_num_one, rate_num_two, rate_num_three, rate_num_four, rate_num_five").
		Scan(&stats).Error; err != nil {
		return err
	}

	// 计算总评分人数和评分总和
	totalVotes := stats.RateNumOne + stats.RateNumTwo + stats.RateNumThree + stats.RateNumFour + stats.RateNumFive
	totalScore := stats.RateNumOne*1 + stats.RateNumTwo*2 + stats.RateNumThree*3 + stats.RateNumFour*4 + stats.RateNumFive*5

	// 避免除以零
	var averageRate float64
	if totalVotes > 0 {
		averageRate = float64(totalScore) / float64(totalVotes)
		averageRate = math.Round(averageRate*100) / 100 // 保留两位小数
	}

	// 更新 girls 表中的 average_rate
	return dao.Db.Table("girls").
		Where("id = ?", girlID).
		Update("average_rate", averageRate).Error
}

// UpdateTodayCardStatus 更新今天的签到卡状态
func (g UpdateRecordsController) UpdateCardRecords(c *gin.Context) {
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

	// 获取 user_id 和 girl_id
	userID := request.UserID
	girlID := request.GirlID

	// 检查参数
	if userID == 0 || girlID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "user_id and girl_id are required"})
		return
	}

	var count int64
	loc, _ := time.LoadLocation("Asia/Shanghai")
	now := time.Now().In(loc)
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, loc).Unix()
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
				GivenAt: time.Now().Unix(),
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
