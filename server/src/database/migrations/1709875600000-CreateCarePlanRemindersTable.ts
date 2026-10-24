import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 月度护理计划提醒表（F003-5）
 * 列名与 care-plan-reminder.entity.ts 保持一致（camelCase）
 */
export class CreateCarePlanRemindersTable1709875600000 implements MigrationInterface {
    name = 'CreateCarePlanRemindersTable1709875600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'care_plan_reminders',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'carePlanId', type: 'int', isNullable: true },
                    { name: 'period', type: 'varchar(7)', isNullable: false, comment: 'YYYY-MM' },
                    { name: 'remindType', type: 'varchar(50)', default: '\'monthly\'' },
                    { name: 'content', type: 'text', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: '\'pending\'' },
                    { name: 'pushedAt', type: 'datetime', isNullable: true },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
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
        await queryRunner.dropTable('care_plan_reminders');
    }
}
