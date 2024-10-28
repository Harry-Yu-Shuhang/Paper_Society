package router

import (
	"paper_community/controllers"
	"paper_community/pkg/logger"

	"github.com/gin-gonic/gin"
)

func Router() *gin.Engine {
	r := gin.Default()

	//调用写日志函数,logger是自己写的
	r.Use(gin.LoggerWithConfig(logger.LoggerToFile()))
	r.Use(logger.Recover)

	// 定义 /api/user/login 路由
	// r.POST("/user/login", controllers.UserController{}.UpdateUserInfo)
	user := r.Group("/user")
	{
		user.POST("/login", controllers.UserController{}.UpdateUserInfo)
	}

	girls := r.Group("/girls")
	{
		girls.GET("/rank/hot", controllers.GirlRankController{}.GetGirlsHotRank)
		girls.GET("/rank/score", controllers.GirlRankController{}.GetGirlsScoreRank)
		girls.POST("/profile/waterfall", controllers.GirlWaterFallController{}.PostRandomGirls)
		girls.GET("/profile/search", controllers.GirlWaterFallController{}.GetSearchGirls)
	}

	return r
}
