import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 会员卡表（BUG-103）
 * 列名与 member-card.entity.ts 保持一致（camelCase）
 */
export class CreateMemberCardsTable1709875500000 implements MigrationInterface {
    name = 'CreateMemberCardsTable1709875500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'member_cards',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'cardName', type: 'varchar(100)', isNullable: true },
                    { name: 'cardType', type: 'varchar(20)', default: '\'times\'' },
                    { name: 'totalTimes', type: 'int', default: 0 },
                    { name: 'usedTimes', type: 'int', default: 0 },
                    { name: 'amount', type: 'decimal(10,2)', default: 0 },
                    { name: 'balance', type: 'decimal(10,2)', default: 0 },
                    { name: 'expiredAt', type: 'date', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: '\'active\'' },
                    { name: 'remark', type: 'text', isNullable: true },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
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
        await queryRunner.dropTable('member_cards');
    }
}
