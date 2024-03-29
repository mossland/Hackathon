CREATE TABLE `ticket` (
  `gameId` int NOT NULL,
  `hashId` int NOT NULL,
  `hashIdx` int NOT NULL,
  `hashString` varchar(64) NOT NULL,
  `ticketId` varchar(36) NOT NULL,
  `betAmount` bigint unsigned NOT NULL,
  `payout` decimal(30,5) unsigned NOT NULL,
  `meta` json NOT NULL,
  `isResultSet` tinyint NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`gameId`,`hashId`,`hashIdx`),
  UNIQUE KEY `receiptId_UNIQUE` (`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci