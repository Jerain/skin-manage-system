import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateMemberCardsTable1709875500000 implements MigrationInterface {
    name = 'CreateMemberCardsTable1709875500000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'member_cards',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'card_name', type: 'varchar(100)' },
                    { name: 'card_type', type: 'varchar(20)', default: "'times'" },
                    { name: 'total_times', type: 'int', default: 0 },
                    { name: 'used_times', type: 'int', default: 0 },
                    { name: 'amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
                    { name: 'balance', type: 'decimal', precision: 10, scale: 2, default: 0 },
                    { name: 'expired_at', type: 'date', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: "'active'" },
                    { name: 'remark', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'member_cards',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('member_cards');
    }
}
