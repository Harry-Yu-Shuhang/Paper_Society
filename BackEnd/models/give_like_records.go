package models

type GiveLikeRecord struct { //从girls表获取数据
	ID        int
	GirlID    int
	UserID    int
	CreatedAt int64
}

// TableName 指定表名
func (GiveLikeRecord) TableName() string {
	return "give_like_records"
}
