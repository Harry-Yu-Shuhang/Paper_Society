package main

import (
	router "paper_community/router"
)

func main() {
	//封装路由
	r := router.Router()
	r.Run(":8080")
}

//defer recover panic 异常处理

// defer func() {
// 	if err := recover(); err != nil {
// 		fmt.Println("捕获异常:", err)
// 	}
// }() //匿名函数，立即执行。如果不加最后这个括号，不会立即执行。

// defer fmt.Println(1)
// defer fmt.Println(2)
// defer fmt.Println(3) //输出3 2 1，后defer的先执行
// panic("panic test")  //让程序崩溃
