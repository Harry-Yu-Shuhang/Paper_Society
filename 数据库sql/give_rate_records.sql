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

 Date: 18/11/2024 08:42:41
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for give_rate_records
-- ----------------------------
DROP TABLE IF EXISTS `give_rate_records`;
CREATE TABLE `give_rate_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `girl_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `rated_at` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `girl_id` (`girl_id`),
  CONSTRAINT `give_rate_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user_infos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `give_rate_records_ibfk_2` FOREIGN KEY (`girl_id`) REFERENCES `girls` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
