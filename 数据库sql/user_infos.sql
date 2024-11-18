SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 删除旧表并创建新表
DROP TABLE IF EXISTS `user_infos`;
CREATE TABLE `user_infos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `open_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nick_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `card_count` int DEFAULT '0',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `login_time` bigint DEFAULT NULL,
  `create_time` bigint DEFAULT NULL,
  `user_hot` int DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 插入数据，确保 id 从 1 开始
BEGIN;
INSERT INTO `user_infos` (`id`, `open_id`, `nick_name`, `card_count`, `avatar_url`, `login_time`, `create_time`, `user_hot`) 
VALUES 
(1, 'oBJqO7b-eW2EyiVbvskyQCBJ63rA', '摸鱼yyds', 15, 'https://thirdwx.qlogo.cn/mmopen/vi_32/DWy6gTEwog3jGa14SGnf5RsBu8ASpb6zYRt8aUpPx2e05icm39FU23ClKPcaqoibTqicFHyicViahe8C4SoIjvI0KDClVgFf39sbvEb2Opm6vmD4/132', 1731469548, 1730549721, 34);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;