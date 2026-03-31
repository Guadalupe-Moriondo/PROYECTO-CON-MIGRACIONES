import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1774989405903 implements MigrationInterface {
    name = 'Init1774989405903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`drivers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`phone\` varchar(255) NULL, \`vehicleType\` varchar(255) NULL, \`licensePlate\` varchar(255) NULL, \`documentNumber\` varchar(255) NULL, \`isAvailable\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 1, \`rating\` float NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`REL_8e224f1b8f05ace7cfc7c76d03\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reviews\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int NOT NULL, \`comment\` text NOT NULL, \`isModerated\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` int NULL, \`restaurant_id\` int NULL, \`product_id\` int NULL, \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`order_id\` int NULL, \`product_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`price\` decimal(10,2) NOT NULL, \`imageUrl\` varchar(255) NULL, \`category\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`rating\` float NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`restaurant_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`restaurants\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`category\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`imageUrl\` varchar(255) NULL, \`openTime\` varchar(255) NULL, \`closeTime\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`rating\` float NOT NULL DEFAULT '0', \`reviewCount\` int NOT NULL DEFAULT '0', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`vendor_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`addresses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`street\` varchar(255) NOT NULL, \`city\` varchar(255) NOT NULL, \`state\` varchar(255) NOT NULL, \`zipCode\` varchar(255) NOT NULL, \`notes\` varchar(255) NULL, \`isDefault\` tinyint NOT NULL DEFAULT 0, \`user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_status_history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('CART', 'CONFIRMED', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED') NOT NULL, \`changedByRole\` enum ('USER', 'VENDOR', 'DRIVER', 'ADMIN') NOT NULL, \`changed_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`order_id\` int NULL, \`changed_by_user_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending', \`amount\` decimal(10,2) NOT NULL, \`method\` enum ('cash', 'credit_card', 'debit_card', 'transfer') NOT NULL DEFAULT 'cash', \`externalRef\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`order_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('CART', 'CONFIRMED', 'PAID', 'ACCEPTED', 'PREPARING', 'READY', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'CART', \`total\` decimal(10,2) NOT NULL DEFAULT '0.00', \`deliveryStreet\` varchar(255) NULL, \`deliveryCity\` varchar(255) NULL, \`deliveryState\` varchar(255) NULL, \`deliveryZipCode\` varchar(255) NULL, \`discountCode\` varchar(255) NULL, \`discountAmount\` decimal(10,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, \`restaurant_id\` int NULL, \`vendor_id\` int NULL, \`driver_id\` int NULL, \`address_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` enum ('USER', 'VENDOR', 'DRIVER', 'ADMIN') NOT NULL DEFAULT 'USER', \`isActive\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vendors\` (\`id\` int NOT NULL AUTO_INCREMENT, \`businessName\` varchar(255) NULL, \`phone\` varchar(255) NULL, \`description\` varchar(255) NULL, \`commissionRate\` decimal(5,2) NOT NULL DEFAULT '10.00', \`isActive\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` int NULL, UNIQUE INDEX \`REL_65b4134d1ddc73872e6abee2c1\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_favorite_restaurants\` (\`usersId\` int NOT NULL, \`restaurantsId\` int NOT NULL, INDEX \`IDX_cb387d82aabb567aa9bd93901f\` (\`usersId\`), INDEX \`IDX_c6375a057bf64656cb550354ba\` (\`restaurantsId\`), PRIMARY KEY (\`usersId\`, \`restaurantsId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`drivers\` ADD CONSTRAINT \`FK_8e224f1b8f05ace7cfc7c76d03b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_728447781a30bc3fcfe5c2f1cdf\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_2269110d10df8d494b99e1381d2\` FOREIGN KEY (\`restaurant_id\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_9482e9567d8dcc2bc615981ef44\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reviews\` ADD CONSTRAINT \`FK_e4b0ed40bdd0f318108612c2851\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_81ac8c38c90887ea5f4a8d160dd\` FOREIGN KEY (\`restaurant_id\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`restaurants\` ADD CONSTRAINT \`FK_f15e63c1240bb4460cd8342fbe2\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`addresses\` ADD CONSTRAINT \`FK_16aac8a9f6f9c1dd6bcb75ec023\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_status_history\` ADD CONSTRAINT \`FK_1ca7d5228cf9dc589b60243933c\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_status_history\` ADD CONSTRAINT \`FK_965678b54f0a0361ca72c541b20\` FOREIGN KEY (\`changed_by_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payments\` ADD CONSTRAINT \`FK_b2f7b823a21562eeca20e72b006\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_85fdda5fcce2f397ef8f117a2c6\` FOREIGN KEY (\`restaurant_id\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_f8ebf94df30e29b0e53fbdfaadd\` FOREIGN KEY (\`vendor_id\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_222cd7bf166a2d7a6aad9cdebee\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_d39c53244703b8534307adcd073\` FOREIGN KEY (\`address_id\`) REFERENCES \`addresses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vendors\` ADD CONSTRAINT \`FK_65b4134d1ddc73872e6abee2c17\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_favorite_restaurants\` ADD CONSTRAINT \`FK_cb387d82aabb567aa9bd93901f6\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_favorite_restaurants\` ADD CONSTRAINT \`FK_c6375a057bf64656cb550354baf\` FOREIGN KEY (\`restaurantsId\`) REFERENCES \`restaurants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_favorite_restaurants\` DROP FOREIGN KEY \`FK_c6375a057bf64656cb550354baf\``);
        await queryRunner.query(`ALTER TABLE \`user_favorite_restaurants\` DROP FOREIGN KEY \`FK_cb387d82aabb567aa9bd93901f6\``);
        await queryRunner.query(`ALTER TABLE \`vendors\` DROP FOREIGN KEY \`FK_65b4134d1ddc73872e6abee2c17\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_d39c53244703b8534307adcd073\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_222cd7bf166a2d7a6aad9cdebee\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_f8ebf94df30e29b0e53fbdfaadd\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_85fdda5fcce2f397ef8f117a2c6\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
        await queryRunner.query(`ALTER TABLE \`payments\` DROP FOREIGN KEY \`FK_b2f7b823a21562eeca20e72b006\``);
        await queryRunner.query(`ALTER TABLE \`order_status_history\` DROP FOREIGN KEY \`FK_965678b54f0a0361ca72c541b20\``);
        await queryRunner.query(`ALTER TABLE \`order_status_history\` DROP FOREIGN KEY \`FK_1ca7d5228cf9dc589b60243933c\``);
        await queryRunner.query(`ALTER TABLE \`addresses\` DROP FOREIGN KEY \`FK_16aac8a9f6f9c1dd6bcb75ec023\``);
        await queryRunner.query(`ALTER TABLE \`restaurants\` DROP FOREIGN KEY \`FK_f15e63c1240bb4460cd8342fbe2\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_81ac8c38c90887ea5f4a8d160dd\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_e4b0ed40bdd0f318108612c2851\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_9482e9567d8dcc2bc615981ef44\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_2269110d10df8d494b99e1381d2\``);
        await queryRunner.query(`ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_728447781a30bc3fcfe5c2f1cdf\``);
        await queryRunner.query(`ALTER TABLE \`drivers\` DROP FOREIGN KEY \`FK_8e224f1b8f05ace7cfc7c76d03b\``);
        await queryRunner.query(`DROP INDEX \`IDX_c6375a057bf64656cb550354ba\` ON \`user_favorite_restaurants\``);
        await queryRunner.query(`DROP INDEX \`IDX_cb387d82aabb567aa9bd93901f\` ON \`user_favorite_restaurants\``);
        await queryRunner.query(`DROP TABLE \`user_favorite_restaurants\``);
        await queryRunner.query(`DROP INDEX \`REL_65b4134d1ddc73872e6abee2c1\` ON \`vendors\``);
        await queryRunner.query(`DROP TABLE \`vendors\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`payments\``);
        await queryRunner.query(`DROP TABLE \`order_status_history\``);
        await queryRunner.query(`DROP TABLE \`addresses\``);
        await queryRunner.query(`DROP TABLE \`restaurants\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP TABLE \`reviews\``);
        await queryRunner.query(`DROP INDEX \`REL_8e224f1b8f05ace7cfc7c76d03\` ON \`drivers\``);
        await queryRunner.query(`DROP TABLE \`drivers\``);
    }

}
