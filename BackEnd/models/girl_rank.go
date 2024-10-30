package models

// GirlRank 包含返回给前端的数据结构（不包含 hot 和 AverageRate 字段，包含 HotRank 字段）
type GirlRank struct {
	ID        int    `json:"id"`
	AvatarSrc string `json:"avatarSrc"`
	Name      string `json:"name"`
	HotRank   int    `json:"hotRank"` // 排名
}
