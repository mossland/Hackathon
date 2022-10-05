CREATE TABLE `current_hash` (
  `gameId` int NOT NULL,
  `hashId` int NOT NULL,
  `hashIdx` int NOT NULL,
  PRIMARY KEY (`gameId`),
  UNIQUE KEY `hashId_UNIQUE` (`hashId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci