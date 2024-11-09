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
		user.POST("/login", controllers.UserController{}.CreateUserInfo)
		user.GET("/ranking", controllers.UserController{}.GetUserRanking)
		user.GET("/favorites", controllers.UserController{}.GetUserFavorites)
	}

	girls := r.Group("/girls")
	{
		girls.POST("/profile/waterfall", controllers.GirlWaterFallController{}.PostRandomGirls)
		girls.GET("/profile/search", controllers.GirlWaterFallController{}.GetSearchGirls)
		girls.POST("/profile/update-card", controllers.GirlProfileController{}.UpdateTodayCardStatus)
		girls.GET("/rank/hot", controllers.GirlRankController{}.GetGirlsHotRank)
		girls.GET("/rank/score", controllers.GirlRankController{}.GetGirlsScoreRank)
		girls.GET("/getGirlDetail", controllers.GirlProfileController{}.GetGirlDetail)
		girls.POST("/views/increase", controllers.GirlProfileController{}.IncreaseViews)
	}

	updates := r.Group("/update")
	{
		updates.POST("/userinfos", controllers.UpdateInfosController{}.InfosUpdate)
		updates.POST("/likerecords", controllers.UpdateRecordsController{}.UpdateLikeRecords)
		updates.POST("/raterecords", controllers.UpdateRecordsController{}.UpdateRateRecords)
	}
	return r
}
