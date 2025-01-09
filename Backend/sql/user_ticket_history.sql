CREATE TABLE `user_ticket_history` (
  `userId` varchar(32) NOT NULL,
  `ticketId` varchar(36) NOT NULL,
  PRIMARY KEY (`userId`,`ticketId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci




USE mmgames;

ALTER TABLE user_ticket_history
  ADD COLUMN createdAt DATETIME(3) NOT NULL 
    DEFAULT '2024-12-31 00:00:00.000'
    AFTER ticketId,
  ADD COLUMN updatedAt DATETIME(3) NOT NULL 
    DEFAULT '2024-12-31 00:00:00.000'
    ON UPDATE CURRENT_TIMESTAMP(3)
    AFTER createdAt;