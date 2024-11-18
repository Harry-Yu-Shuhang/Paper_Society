/*
 Navicat Premium Dump SQL

 Source Server         : 纸片社_本地数据库
 Source Server Type    : MySQL
 Source Server Version : 90001 (9.0.1)
 Source Host           : localhost:3308
 Source Schema         : Paper_Society

 Target Server Type    : MySQL
 Target Server Version : 90001 (9.0.1)
 File Encoding         : 65001

 Date: 18/11/2024 08:56:19
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for girl_statistics
-- ----------------------------
DROP TABLE IF EXISTS `girl_statistics`;
CREATE TABLE `girl_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `girl_id` int NOT NULL,
  `card_num` int DEFAULT '0',
  `like_num` int DEFAULT '0',
  `rate_num_one` int DEFAULT '0',
  `rate_num_two` int DEFAULT '0',
  `rate_num_three` int DEFAULT '0',
  `rate_num_four` int DEFAULT '0',
  `rate_num_five` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `girl_id` (`girl_id`),
  CONSTRAINT `girl_statistics_ibfk_1` FOREIGN KEY (`girl_id`) REFERENCES `girls` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of girl_statistics
-- ----------------------------
BEGIN;
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (1, 1, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (2, 2, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (3, 3, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (4, 4, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (5, 5, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (6, 6, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (7, 7, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (8, 8, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (9, 9, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (10, 10, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (11, 11, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (12, 12, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (13, 13, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (14, 14, 0, 0, 0, 0, 0, 0, 0);
INSERT INTO `girl_statistics` (`id`, `girl_id`, `card_num`, `like_num`, `rate_num_one`, `rate_num_two`, `rate_num_three`, `rate_num_four`, `rate_num_five`) VALUES (15, 15, 0, 0, 0, 0, 0, 0, 0);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
