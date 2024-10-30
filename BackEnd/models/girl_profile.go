package models

// GirlRank 包含返回给前端的数据结构（不包含 hot 和 AverageRate 字段，包含 HotRank 字段）
type GirlProfile struct {
	ID            int
	Name          string
	AvatarSrc     string
	Hot           int
	AverageRate   float64
	GirlSrc       string
	Age           string
	BackgroundSrc string
	Introduction  string
	HotRank       int64
	RateRank      int64
	FirePercent   int
	StarPercent   int

	CardNum int
	LikeNum int
	RateNum []int

	MyRate int
	Voted  bool
	Liked  bool
}
