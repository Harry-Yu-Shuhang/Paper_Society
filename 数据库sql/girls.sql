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

 Date: 18/11/2024 08:44:27
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
  `girl_src` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `background_src` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatar_src` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` varchar(10) DEFAULT NULL,
  `hot` int DEFAULT '0',
  `average_rate` float DEFAULT '0',
  `views` int DEFAULT '0',
  `introduction` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------
-- Records of girls
-- ----------------------------
BEGIN;
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (1, '纸片社', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/看板娘竖屏.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/看板娘横屏.jpg', '/images/Paper_Society.jpg', '少女', 2, 4, 18, '纸片社，纸片社开发者拿AI画的看板娘，是一个粉蓝色长发的少女，性格可爱开朗。对了，简介在60-80字之间的话，排版好看一些，所以看到这里的时候就凑够了。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (2, '爱蜜莉雅', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/aimiliya_profile.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/Anime-Girl-Emilia.jpg', 'https://7072-prod-4guz1brc55a6d768-1330379161.tcb.qcloud.la/images/avatar/emilia_avatar.jpeg?sign=2cf954dba381060310569287e65311ab&t=1729660210', '少女', 5, 4, 42, '爱蜜莉雅，是轻小说《Re:从零开始的异世界生活》中，银色长发、绀紫瞳的半精灵少女。性格善良、温柔、呆萌，多次拯救男主角。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (3, '和泉纱雾', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/hequanshawu_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/hequanshawu_background_2_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/hequanshawu_avatar_4_11zon.jpeg', '少女', 2, 0, 8, '和泉纱雾，轻小说《埃罗芒阿老师》的女主。她是个害羞且内向的少女，常年宅在家中，但在绘画方面拥有惊人的才华，以“埃罗芒阿老师”的笔名，秘密为哥哥的小说绘制插图。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (4, '可莉', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/可莉竖屏.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/keli.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/可莉_avatar_2.jpeg', '萝莉', 7, 5, 9, '可莉是游戏《原神》中，喜欢制作炸弹在鱼塘炸鱼的可爱小女孩，是西风骑士团的火花骑士。性格调皮、活泼，经常因为乱用炸弹被琴团长关禁闭。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (5, '明日香', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/mingrixiang_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/mingrixiang_background_5_11zon.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/mingrixiang_avatar_7_11zon.jpeg', '少女', 3, 5, 9, '明日香，动漫《新世纪福音战士》中的主要角色之一，是德国籍的eva二号机驾驶员。性格开朗、直率傲娇，表面上坚强独立，内心却渴望被认可。凭借过人的操作技术和强烈的责任感，在多次危机中力挽狂澜。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (6, '牧濑红莉栖', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/mulaihongliqi_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/mulaihongliqi_background_6_11zon.webp', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/mulaihongliqi_avatar_8_11zon.jpeg', '少女', 0, 0, 8, '牧濑红莉栖，动漫《命运石之门》的女主。她是个聪慧冷静的天才少女科学家，擅长神经科学，与男主一起研发时间机器。虽然表面理性冷淡，却不乏对人温柔体贴的一面。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (7, 'Neuro', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/neuro-sama_profile.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/Neuro_background_7_11zon.webp', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/Neurosama_avatarpng_9_11zon.jpg', '萝莉', 4, 0, 4, 'Neuro-sama，是一个虚拟AI主播，以其智能的学习和互动能力出名。她有独特的个性，能与观众实时交流，展现出机智幽默的一面，逐渐在网络中积累了大量粉丝。头上的乌龟Vedal是她的创造者。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (8, '东雪莲', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/dongxuelian_profile.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/dongxuelian_background_1_11zon.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/东雪莲_avatar_1.jpeg', '少女', 1, 0, 5, '东雪莲(東 雪蓮Seren Azuma)，是一名知名虚拟主播，中文和日文流利。因为罕见的声线，以及出色的的互动、运营能力，在哔哩哔哩等平台收获高人气，收获很多关于她的二创作品。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (9, '嘉然', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/嘉然一代.png', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/jiaran_background_3_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/jiaran_avatar_5_11zon.jpeg', '少女', 1, 0, 12, '嘉然，是虚拟偶像团体A-SOUL的成员，以“嘉然今天吃什么”的口号出名，粉丝群体又名“嘉心糖”。她活泼开朗，热爱美食，总能带给观众欢乐，是粉丝们心中的“吃货小天使”。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (10, '克拉拉', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/kelala_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/kelala_background_4_11zon.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/kelala_avatar_6_11zon.jpeg', '萝莉', 1, 5, 3, '克拉拉，是游戏《崩坏：星穹铁道》中的角色，孤独却善良的少女，由机械伙伴“史瓦罗”照顾长大。她心地纯净，渴望人与人之间的温暖，是个柔弱却坚韧的存在。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (11, '三月七', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/sanyueqi_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/sanyueqi_background_9_11zon.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/sanyueqi_avatar_8_11zon.jpeg', '少女', 5, 5, 15, '三月七，是游戏《崩坏：星穹铁道》中的活泼少女，个性开朗，热爱冒险。她持有神秘的冰冻之力，随身携带相机，喜欢记录旅途中的点滴，是个充满好奇心的乐天派。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (12, '十四行诗', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/shisihangshi_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/shisihangshi_background_10_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/shisihangshi_avatar_10_11zon.jpeg', '少女', 1, 4, 6, '十四行诗，游戏《重返未来：1999》中的角色，在学生时代是班级最为优秀的存在，因成绩及能力优异，目前在是圣洛夫基金会中担任分队长，作为司辰维尔汀的首席助手一起行动。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (13, '涂山苏苏', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/tushansusu_profile.jpg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/tushansusu_background_12_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/tushansusu_avatar_11_11zon.jpeg', '萝莉', 6, 0, 15, '涂山苏苏，是动漫《狐妖小红娘》中的可爱狐妖，纯真善良，拥有强大的灵力。她执着于帮助有情人，守护前世今生的爱情，被人们称为“红线仙”。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (14, '宵宫', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/xiaogong_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/xiaogong_background_13_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/xiaogong_avatar.jpg', '少女', 4, 5, 9, '宵宫，是游戏《原神》中，长野原烟花店的店长。个性开朗活泼，乐于助人。她热爱烟火艺术，拥有火元素之力，喜欢用烟火点亮夜空，也是稻妻节庆中不可或缺的存在。');
INSERT INTO `girls` (`id`, `name`, `girl_src`, `background_src`, `avatar_src`, `age`, `hot`, `average_rate`, `views`, `introduction`) VALUES (15, '永雏塔菲', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile/yongchutafei_profile.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/profile_background/yongchutafei_background_14_11zon.jpeg', 'cloud://prod-4guz1brc55a6d768.7072-prod-4guz1brc55a6d768-1330379161/images/avatar/yongchutafei_avatar_12_11zon.webp', '少女', 1, 1, 15, '永雏塔菲，是知名虚拟主播，粉丝群体又名“雏草姬”，活跃在哔哩哔哩等平台。她来自1885年，乘自己发明的时光机试图穿越到100年后的时空，却迟到36年来到现代，并被电子游戏吸引，不想返回过去。');
COMMIT;

-- ----------------------------
-- Triggers structure for table girls
-- ----------------------------
DROP TRIGGER IF EXISTS `after_girl_insert`;
delimiter ;;
CREATE TRIGGER `Paper_Society`.`after_girl_insert` AFTER INSERT ON `girls` FOR EACH ROW BEGIN
    INSERT INTO girl_statistics (girl_id, card_num, like_num, rate_num_1, rate_num_2, rate_num_3, rate_num_4, rate_num_5)
    VALUES (NEW.id, 0, 0, 0, 0, 0, 0, 0);
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
