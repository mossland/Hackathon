CREATE TABLE `user_ticket_history` (
  `userId` int NOT NULL,
  `ticketId` varchar(36) NOT NULL,
  PRIMARY KEY (`userId`,`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci