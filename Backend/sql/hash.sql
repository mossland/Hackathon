CREATE TABLE `hash` (
  `gameId` int NOT NULL,
  `hashId` int NOT NULL,
  `key` varchar(64) NOT NULL,
  `isSpend` tinyint NOT NULL DEFAULT '0',
  `isGenesis` tinyint NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`gameId`,`hashId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci