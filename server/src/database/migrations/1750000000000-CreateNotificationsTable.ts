import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 站内消息表（推送兜底通道）
 * 列名与实体 notification.entity.ts 保持一致（camelCase，与生产库 synchronize 结构一致）
 */
export class CreateNotificationsTable1750000000000 implements MigrationInterface {
  name = 'CreateNotificationsTable1750000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await createTableIfNotExists(
      queryRunner,
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'customerId', type: 'int', isNullable: false },
          { name: 'type', type: 'varchar(50)', isNullable: false, default: 'system' },
          { name: 'title', type: 'varchar(200)', isNullable: false },
          { name: 'summary', type: 'text', isNullable: true },
          { name: 'link', type: 'varchar(200)', isNullable: true },
          { name: 'refId', type: 'int', isNullable: true },
          { name: 'isRead', type: 'int', isNullable: false, default: 0 },
          { name: 'readAt', type: 'datetime', isNullable: true },
          { name: 'createdAt', type: 'datetime(6)', isNullable: false, default: 'CURRENT_TIMESTAMP(6)' },
          { name: 'updatedAt', type: 'datetime(6)', isNullable: false, default: 'CURRENT_TIMESTAMP(6)' },
        ],
      }),
      [
        new TableForeignKey({
          columnNames: ['customerId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'customers',
          onDelete: 'CASCADE',
        }),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
