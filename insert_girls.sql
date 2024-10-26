/*
 Navicat Premium Dump SQL

 Source Server         : 纸片社
 Source Server Type    : MySQL
 Source Server Version : 90001 (9.0.1)
 Source Host           : localhost:3308
 Source Schema         : Paper_Society

 Target Server Type    : MySQL
 Target Server Version : 90001 (9.0.1)
 File Encoding         : 65001

 Date: 26/10/2024 15:35:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for girls
-- ----------------------------
DROP TABLE IF EXISTS `girls`;
CREATE TABLE `girls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `girlSrc` varchar(255) DEFAULT NULL,
  `backgroundSrc` varchar(255) DEFAULT NULL,
  `avatarSrc` varchar(255) DEFAULT NULL,
  `age` varchar(10) DEFAULT NULL,
  `hot` int DEFAULT '0',
  `averageRate` float DEFAULT NULL,
  `views` int DEFAULT '0',
  `introduction` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `girls_chk_1` CHECK ((`averageRate` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of girls
-- ----------------------------
BEGIN;
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (1, '纸片社', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/看板娘竖屏.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/看板娘横屏.jpg', '/images/Paper_Society.jpg', '少女', 42, 4.2, 4325, '纸片社，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (2, '爱蜜莉雅', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/aimiliya_profile.jpg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/Anime-Girl-Emilia.jpg?sign=89f03eeab1e8b8bcfba69e76ed68bc4d&t=1729658255', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 423, 4.2, 4325, '爱蜜莉雅，是轻小说《Re:从零开始的异世界生活》中，银色长发、绀紫瞳的半精灵少女。性格善良、温柔、呆萌，多次拯救男主角。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (3, '和泉纱雾', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/hequanshawu_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/Anime-Girl-Emilia.jpg?sign=89f03eeab1e8b8bcfba69e76ed68bc4d&t=1729658255', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 4235, 4.2, 4325, '和泉纱雾，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (4, '可莉', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/可莉竖屏.jpg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '萝莉', 435, 4.2, 4325, '可莉是游戏《原神》中，喜欢制作炸弹在鱼塘炸鱼的可爱小女孩，是西风骑士团的火花骑士。性格调皮、活泼，经常因为乱用炸弹被琴团长关禁闭。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (5, '明日香', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/mingrixiang_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 4235, 4.2, 4325, '明日香，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (6, '牧濑红莉栖', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/mulaihongliqi_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 4, 4.2, 4325, '牧濑红莉栖，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (7, 'Neuro', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/neuro-sama_profile.png', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '萝莉', 12, 4.2, 4325, 'Neuro，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (8, '东雪莲', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/dongxuelian_profile.jpg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 809, 4.2, 4325, '东雪莲，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (9, '嘉然', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/嘉然一代.png', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 71, 4.2, 4325, '嘉然，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (10, '克拉拉', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/kelala_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '萝莉', 1, 4.2, 4325, '克拉拉，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (11, '三月七', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/sanyueqi_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 0, 4.2, 4325, '三月七，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (12, '十四行诗', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/shisihangshi_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 0, 4.2, 4325, '十四行诗，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (13, '涂山苏苏', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/tushansusu_profile.jpg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '萝莉', 10, 4.2, 4325, '涂山苏苏，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
INSERT INTO `girls` (`id`, `name`, `girlSrc`, `backgroundSrc`, `avatarSrc`, `age`, `hot`, `averageRate`, `views`, `introduction`) VALUES (14, '宵宫', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/xiaogong_profile.jpeg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/profile_background/keli.jpeg?sign=6a3ca708d3736a7ecf0aae0e2142f137&t=1729658272', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 4235, 4.2, 4325, '宵宫，测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案测试文案界测试文案测试文案测试文案测试文案测试文案。');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
