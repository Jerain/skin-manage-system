import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCarePlanRemindersTable1709875600000 implements MigrationInterface {
    name = 'CreateCarePlanRemindersTable1709875600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'care_plan_reminders',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'care_plan_id', type: 'int', isNullable: true },
                    { name: 'period', type: 'varchar(7)', comment: 'YYYY-MM' },
                    { name: 'remind_type', type: 'varchar(50)', default: "'monthly'" },
                    { name: 'content', type: 'text', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: "'pending'" },
                    { name: 'pushed_at', type: 'datetime', isNullable: true },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'care_plan_reminders',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('care_plan_reminders');
    }
}
