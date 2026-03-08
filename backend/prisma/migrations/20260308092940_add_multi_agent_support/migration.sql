-- AlterTable
ALTER TABLE `users` ADD COLUMN `parent_id` VARCHAR(191) NULL,
    ADD COLUMN `permissions` JSON NULL,
    MODIFY `role` ENUM('ADMIN', 'USER', 'AGENT') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
