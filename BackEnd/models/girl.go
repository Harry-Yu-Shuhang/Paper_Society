package models

type Girl struct { //从girls表获取数据
	ID          int
	Name        string
	AvatarSrc   string
	Hot         int
	AverageRate float64
	GirlSrc     string
}

// TableName 指定表名
func (Girl) TableName() string {
	return "girls"
}
