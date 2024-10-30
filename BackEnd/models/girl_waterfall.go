package models

// GirlProfile 包含前端需要的女孩信息
type GirlWaterfall struct {
	ID      int    `json:"id"`
	GirlSrc string `json:"girlSrc"`
	Name    string `json:"name"`
	Views   int    `json:"views"`
}
