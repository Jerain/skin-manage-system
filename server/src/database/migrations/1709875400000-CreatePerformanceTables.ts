import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 技师业绩 / 奖金规则 表结构
 *
 * 列名与实体保持一致（camelCase），与生产库 synchronize 生成的表结构兼容。
 * 迁移为幂等操作：表已存在时跳过。
 */
export class CreatePerformanceTables1709875400000 implements MigrationInterface {
    name = 'CreatePerformanceTables1709875400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 业绩记录表
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'performance_records',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'technicianId', type: 'int', isNullable: false },
                    { name: 'orderId', type: 'int', isNullable: true },
                    { name: 'appointmentId', type: 'int', isNullable: true },
                    { name: 'serviceId', type: 'int', isNullable: true },
                    { name: 'serviceName', type: 'varchar(100)', isNullable: true },
                    { name: 'serviceAmount', type: 'decimal(10,2)', default: 0 },
                    { name: 'commissionRate', type: 'decimal(5,2)', default: 0 },
                    { name: 'commissionAmount', type: 'decimal(10,2)', default: 0 },
                    { name: 'orderDate', type: 'varchar(10)', isNullable: true },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            [
                new TableForeignKey({
                    columnNames: ['technicianId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'employees',
                    onDelete: 'CASCADE',
                }),
            ],
        );

        // 奖金规则表
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'bonus_rules',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'storeId', type: 'int', isNullable: true },
                    { name: 'ruleName', type: 'varchar(100)', isNullable: false },
                    { name: 'ruleType', type: 'varchar(50)', isNullable: false, comment: '基础提成/业绩奖励/好评奖励/满勤奖' },
                    { name: 'conditionType', type: 'varchar(50)', isNullable: false, comment: 'service_amount/monthly_sales/praise_rate/attendance' },
                    { name: 'conditionValue', type: 'decimal(10,2)', default: 0 },
                    { name: 'bonusType', type: 'varchar(20)', isNullable: false, comment: 'percentage/fixed' },
                    { name: 'bonusAmount', type: 'decimal(10,2)', default: 0 },
                    { name: 'priority', type: 'int', default: 0 },
                    { name: 'status', type: 'varchar(20)', default: '\'active\'' },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
        );

        // 技师奖金表
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'technician_bonuses',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'technicianId', type: 'int', isNullable: false },
                    { name: 'storeId', type: 'int', isNullable: true },
                    { name: 'bonusRuleId', type: 'int', isNullable: true },
                    { name: 'bonusType', type: 'varchar(50)', isNullable: false },
                    { name: 'bonusAmount', type: 'decimal(10,2)', default: 0 },
                    { name: 'month', type: 'varchar(7)', isNullable: false, comment: '2026-03' },
                    { name: 'status', type: 'varchar(20)', default: '\'pending\'', comment: 'pending/paid' },
                    { name: 'notes', type: 'text', isNullable: true },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'paidAt', type: 'datetime', isNullable: true },
                ],
            }),
            [
                new TableForeignKey({
                    columnNames: ['technicianId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'employees',
                    onDelete: 'CASCADE',
                }),
            ],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('technician_bonuses');
        await queryRunner.dropTable('bonus_rules');
        await queryRunner.dropTable('performance_records');
    }
}
