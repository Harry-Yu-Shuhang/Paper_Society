package models

type GiveRateRecord struct { //从girls表获取数据
	ID      int
	GirlID  int
	UserID  int
	Rating  int
	RatedAt int64
}

// TableName 指定表名
func (GiveRateRecord) TableName() string {
	return "give_rate_records"
}
