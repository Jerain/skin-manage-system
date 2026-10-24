import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';

/**
 * 肤质记录 / 对比图 表结构
 *
 * 列名与实体（skin-record.entity.ts / skin-comparison.entity.ts）保持一致，
 * 即 camelCase —— 与生产库中 synchronize 生成的表结构一致。
 * 迁移为幂等操作：表已存在时跳过。
 */
export class CreateSkinRecordsTables1709875200000 implements MigrationInterface {
    name = 'CreateSkinRecordsTables1709875200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'skin_records',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'recordDate', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'skinType', type: 'varchar(50)', isNullable: true, comment: '干性/油性/混合性/敏感性' },
                    { name: 'skinIssues', type: 'text', isNullable: true, comment: '痘痘/色斑/毛孔粗大/细纹' },
                    { name: 'photoUrl', type: 'varchar(500)', isNullable: true },
                    { name: 'aiAnalysis', type: 'json', isNullable: true, comment: 'AI分析结果' },
                    { name: 'technicianId', type: 'int', isNullable: true },
                    { name: 'notes', type: 'text', isNullable: true },
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

        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: 'skin_comparisons',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customerId', type: 'int', isNullable: false },
                    { name: 'beforeRecordId', type: 'int', isNullable: true },
                    { name: 'afterRecordId', type: 'int', isNullable: true },
                    { name: 'comparisonImageUrl', type: 'varchar(500)', isNullable: true },
                    { name: 'improvementHighlights', type: 'text', isNullable: true, comment: '改善亮点' },
                    { name: 'pushed', type: 'tinyint', default: 0 },
                    { name: 'pushTime', type: 'datetime', isNullable: true },
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
        await queryRunner.dropTable('skin_comparisons');
        await queryRunner.dropTable('skin_records');
    }
}
