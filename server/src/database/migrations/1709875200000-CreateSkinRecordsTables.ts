import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSkinRecordsTables1709875200000 implements MigrationInterface {
    name = 'CreateSkinRecordsTables1709875200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 肤质记录表
        await queryRunner.createTable(
            new Table({
                name: 'skin_records',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'record_date', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'skin_type', type: 'varchar(50)', comment: '干性/油性/混合性/敏感性' },
                    { name: 'skin_issues', type: 'text', comment: '痘痘/色斑/毛孔粗大/细纹' },
                    { name: 'photo_url', type: 'varchar(500)' },
                    { name: 'ai_analysis', type: 'json', comment: 'AI分析结果' },
                    { name: 'technician_id', type: 'int', isNullable: true },
                    { name: 'notes', type: 'text', isNullable: true },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        // 肤质对比表
        await queryRunner.createTable(
            new Table({
                name: 'skin_comparisons',
                columns: [
                    { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'before_record_id', type: 'int' },
                    { name: 'after_record_id', type: 'int' },
                    { name: 'comparison_image_url', type: 'varchar(500)' },
                    { name: 'improvement_highlights', type: 'text', comment: '改善亮点' },
                    { name: 'pushed', type: 'tinyint', default: 0 },
                    { name: 'push_time', type: 'datetime', isNullable: true },
                    { name: 'created_at', type: 'datetime', default: 'CURRENT_TIMESTAMP' },
                ],
            }),
            true
        );

        // 添加外键
        await queryRunner.createForeignKey(
            'skin_records',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'skin_comparisons',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('skin_comparisons');
        await queryRunner.dropTable('skin_records');
    }
}
