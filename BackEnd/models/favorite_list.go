package models

// FavoriteList 用于返回用户的收藏列表数据
type FavoriteList struct {
	ID        int    `json:"id"`
	GirlID    int    `json:"girl_id"`
	AvatarSrc string `json:"avatarSrc"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
}
