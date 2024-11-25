package main

import (
	router "paper_community/router"
)

func main() {
	//封装路由
	r := router.Router()
	r.Run(":80")
}
