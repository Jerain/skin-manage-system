import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 护理计划 / 会员等级 / 客户成长体系 表结构
 *
 * 这些表在生产库中由 synchronize 自动同步生成（列名 camelCase），
 * 这里补一份幂等迁移，保证全新环境部署也能建表。
 */
export class CreateGrowthAndPlanTables1709875700000 implements MigrationInterface {
    name = 'CreateGrowthAndPlanTables1709875700000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 护理计划
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'care_plans',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'planStartDate', type: 'date', isNullable: true },
                    { name: 'planEndDate', type: 'date', isNullable: true },
                    { name: 'skinType', type: 'varchar(50)', isNullable: true },
                    { name: 'season', type: 'varchar(20)', isNullable: true },
                    { name: 'planItems', type: 'json', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: '\'active\'' },
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

        // 护理计划项
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'care_plan_items',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'planId', type: 'int', isNullable: false },
                    { name: 'serviceId', type: 'int', isNullable: true },
                    { name: 'plannedMonth', type: 'int', isNullable: true },
                    { name: 'suggestedDate', type: 'date', isNullable: true },
                    { name: 'actualDate', type: 'date', isNullable: true },
                    { name: 'status', type: 'varchar(20)', default: '\'pending\'' },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            [
                new TableForeignKey({
                    columnNames: ['planId'],
                    referencedColumnNames: ['id'],
                    referencedTableName: 'care_plans',
                    onDelete: 'CASCADE',
                }),
            ],
        );

        // 会员等级配置（F004-8）
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'member_levels',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'levelName', type: 'varchar(20)', isNullable: false },
                    { name: 'levelCode', type: 'varchar(20)', isNullable: false },
                    { name: 'threshold', type: 'int', default: 0 },
                    { name: 'discount', type: 'decimal(3,2)', default: 1 },
                    { name: 'pointsRate', type: 'int', default: 1 },
                    { name: 'priorityBooking', type: 'tinyint', default: 0 },
                    { name: 'exclusiveTechnician', type: 'tinyint', default: 0 },
                    { name: 'createdAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updatedAt', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
        );

        // 客户等级（F004 成长体系）
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'customer_levels',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false, isUnique: true },
                    { name: 'levelId', type: 'int', default: 1 },
                    { name: 'growthValue', type: 'int', default: 0 },
                    { name: 'totalPoints', type: 'int', default: 0 },
                    { name: 'availablePoints', type: 'int', default: 0 },
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

        // 成长记录
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'growth_records',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'growthType', type: 'varchar(20)', isNullable: false },
                    { name: 'growthValue', type: 'int', default: 0 },
                    { name: 'relatedId', type: 'int', isNullable: true },
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
        await queryRunner.dropTable('growth_records');
        await queryRunner.dropTable('customer_levels');
        await queryRunner.dropTable('member_levels');
        await queryRunner.dropTable('care_plan_items');
        await queryRunner.dropTable('care_plans');
    }
}
