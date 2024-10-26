package models

// type UserInfo struct {
// 	NickName  string `json:"nickName"`
// 	AvatarUrl string `json:"avatarUrl"`
// 	OpenID    string `json:"openid"`
// }

type UserInfo struct { //结构体也不能改名 映射到user_infos表里面
	//UserID    int64  `gorm:"primaryKey;column:user_id"` // 指定 user_id 作为主键
	ID        int  // 映射到 id 列，id列会自动被gorm识别为主键
	OpenID    string // 映射到 user_id 列
	NickName  string // 映射到 username 列
	CardCount int    // 映射到 card_count 列
	AvatarUrl string // 映射到 user_avatar 列
	LoginTime int64  // 映射到 login_time 列,存储unix时间戳
}
