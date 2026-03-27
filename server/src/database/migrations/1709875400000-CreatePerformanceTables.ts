import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePerformanceTables1709875400000 implements MigrationInterface {
    name = 'CreatePerformanceTables1709875400000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 业绩记录表
        await queryRunner.createTable(
            new Table({
                name: 'performance_records',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'technician_id', type: 'int', isNullable: false },
                    { name: 'order_id', type: 'int', isNullable: true },
                    { name: 'appointment_id', type: 'int', isNullable: true },
                    { name: 'service_id', type: 'int', isNullable: true },
                    { name: 'service_name', type: 'varchar(100)' },
                    { name: 'service_amount', type: 'decimal(10,2)', default: 0 },
                    { name: 'commission_rate', type: 'decimal(5,2)', default: 0 },
                    { name: 'commission_amount', type: 'decimal(10,2)', default: 0 },
                    { name: 'order_date', type: 'date' },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        // 奖金规则表
        await queryRunner.createTable(
            new Table({
                name: 'bonus_rules',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'store_id', type: 'int', isNullable: true },
                    { name: 'rule_name', type: 'varchar(100)' },
                    { name: 'rule_type', type: 'varchar(50)', comment: '基础提成/业绩奖励/好评奖励/满勤奖' },
                    { name: 'condition_type', type: 'varchar(50)', comment: 'service_amount/monthly_sales/praise_rate/attendance' },
                    { name: 'condition_value', type: 'decimal(10,2)', default: 0 },
                    { name: 'bonus_type', type: 'varchar(20)', comment: 'percentage/fixed' },
                    { name: 'bonus_amount', type: 'decimal(10,2)', default: 0 },
                    { name: 'priority', type: 'int', default: 0 },
                    { name: 'status', type: 'varchar(20)', default: 'active' },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        // 技师奖金表
        await queryRunner.createTable(
            new Table({
                name: 'technician_bonuses',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'technician_id', type: 'int', isNullable: false },
                    { name: 'store_id', type: 'int', isNullable: true },
                    { name: 'bonus_rule_id', type: 'int', isNullable: true },
                    { name: 'bonus_type', type: 'varchar(50)' },
                    { name: 'bonus_amount', type: 'decimal(10,2)', default: 0 },
                    { name: 'month', type: 'varchar(7)', comment: '2026-03' },
                    { name: 'status', type: 'varchar(20)', default: 'pending', comment: 'pending/paid' },
                    { name: 'notes', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'paid_at', type: 'datetime', isNullable: true },
                ],
            }),
            true
        );

        // 添加外键
        await queryRunner.createForeignKey(
            'performance_records',
            new TableForeignKey({
                columnNames: ['technician_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'employees',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('technician_bonuses');
        await queryRunner.dropTable('bonus_rules');
        await queryRunner.dropTable('performance_records');
    }
}
