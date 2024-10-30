package models

type GirlStatistics struct {
	ID      int `json:"id" gorm:"primaryKey"` // 主键
	GirlID  int `json:"girl_id"`              // 外键，与 girls 表关联
	CardNum int `json:"card_num"`             // 签到卡数量
	LikeNum int `json:"like_num"`             // 收藏数量
	// RateNum1 int `json:"rate_num_1"`           // 1星评分数量
	// RateNum2 int `json:"rate_num_2"`           // 2星评分数量
	// RateNum3 int `json:"rate_num_3"`           // 3星评分数量
	// RateNum4 int `json:"rate_num_4"`           // 4星评分数量
	// RateNum5 int `json:"rate_num_5"`           // 5星评分数量
	RateNumOne   int `json:"rate_num_1"`
	RateNumTwo   int `json:"rate_num_2"`
	RateNumThree int `json:"rate_num_3"`
	RateNumFour  int `json:"rate_num_4"`
	RateNumFive  int `json:"rate_num_5"`
}

// TableName 指定表名
func (GirlStatistics) TableName() string {
	return "girl_statistics"
}
