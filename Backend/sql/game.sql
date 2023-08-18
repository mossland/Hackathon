CREATE TABLE `game` (
  `gameId` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `localName` json DEFAULT NULL,
  `isAvailable` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`gameId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci