import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';
import { createTableIfNotExists } from '../migration-helpers';
/**
 * 基线迁移：基础表结构
 *
 * 生产库中这些表最初由 TypeORM `synchronize: true` 自动创建，
 * 后续功能迁移（肤质记录 / 业绩 / 会员卡 / 护理计划 / 成长体系等）都依赖它们存在，
 * 但仓库里一直没有对应迁移脚本 —— 全新环境执行 migration:run 会因外键找不到父表而失败。
 *
 * 本迁移补齐基线：表 / 索引 / 外键，列定义与实体一一对应。
 * 分两阶段：先建表，再统一加外键（表按字母序创建，外键父表可能尚未建立）。
 * 幂等：表已存在则跳过创建。
 */
export class CreateBaselineTables1709875100000 implements MigrationInterface {
    name = 'CreateBaselineTables1709875100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 第一阶段：建表 + 建索引
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "admin_users",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "username", type: "varchar(50)", isNullable: false }),
                    new TableColumn({ name: "password", type: "varchar(255)", isNullable: false }),
                    new TableColumn({ name: "name", type: "varchar(50)", isNullable: true }),
                    new TableColumn({ name: "role", type: "varchar(255)", isNullable: false, default: "'admin'" }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: true }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "appointments",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "customer_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "employee_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "service_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "appointment_date", type: "date", isNullable: false }),
                    new TableColumn({ name: "appointment_time", type: "time", isNullable: false }),
                    new TableColumn({ name: "duration_hours", type: "decimal(3,1)", isNullable: false, default: 1.0 }),
                    new TableColumn({ name: "status", type: "varchar(255)", isNullable: false, default: "'pending'" }),
                    new TableColumn({ name: "notes", type: "text", isNullable: true }),
                    new TableColumn({ name: "cancel_reason", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_2be3c78815aba227af1c3e8e41", columnNames: ["customer_id"] }),
                    new TableIndex({ name: "IDX_f895bc7345f67c61cf48c1bf41", columnNames: ["store_id"] }),
                    new TableIndex({ name: "IDX_f4e3a19c74dac65a223368fa9a", columnNames: ["employee_id"] }),
                    new TableIndex({ name: "IDX_e44a44b3eec38bb354c8425945", columnNames: ["appointment_date"] }),
                    new TableIndex({ name: "FK_2a2088e8eaa8f28d8de2bdbb857", columnNames: ["service_id"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "attendances",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "employee_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "date", type: "date", isNullable: false }),
                    new TableColumn({ name: "check_in", type: "datetime", isNullable: true }),
                    new TableColumn({ name: "check_out", type: "datetime", isNullable: true }),
                    new TableColumn({ name: "check_in_type", type: "varchar(20)", isNullable: true }),
                    new TableColumn({ name: "check_out_type", type: "varchar(20)", isNullable: true }),
                    new TableColumn({ name: "status", type: "varchar(255)", isNullable: false, default: "'normal'" }),
                    new TableColumn({ name: "notes", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_43dca8b4751d7449a38b583991", columnNames: ["employee_id"] }),
                    new TableIndex({ name: "IDX_543c2dee478e080c06d4a48afa", columnNames: ["date"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "check_ins",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "customer_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "appointment_id", type: "int", isNullable: true }),
                    new TableColumn({ name: "check_in_time", type: "datetime", isNullable: false }),
                    new TableColumn({ name: "check_in_type", type: "varchar(255)", isNullable: false, default: "'manual'" }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_3b1b59811172c219d60cbc5170", columnNames: ["customer_id"] }),
                    new TableIndex({ name: "IDX_26449475912296cd3d2c90b0d6", columnNames: ["store_id"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "customers",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "name", type: "varchar(50)", isNullable: false }),
                    new TableColumn({ name: "phone", type: "varchar(20)", isNullable: false }),
                    new TableColumn({ name: "avatar", type: "varchar(500)", isNullable: true }),
                    new TableColumn({ name: "password", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "openid", type: "varchar(64)", isNullable: true }),
                    new TableColumn({ name: "face_token", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "skin_type", type: "varchar(50)", isNullable: true }),
                    new TableColumn({ name: "allergy_info", type: "text", isNullable: true }),
                    new TableColumn({ name: "points", type: "int", isNullable: false, default: 0 }),
                    new TableColumn({ name: "level", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "balance", type: "decimal(10,2)", isNullable: false, default: 0.00 }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_88acd889fbe17d0e16cc4bc917", columnNames: ["phone"] }),
                    new TableIndex({ name: "IDX_415a1f811426eb0033f2c413be", columnNames: ["openid"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "employees",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "name", type: "varchar(50)", isNullable: false }),
                    new TableColumn({ name: "phone", type: "varchar(20)", isNullable: true }),
                    new TableColumn({ name: "password", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "role", type: "varchar(20)", isNullable: false }),
                    new TableColumn({ name: "position", type: "varchar(50)", isNullable: true }),
                    new TableColumn({ name: "avatar", type: "varchar(500)", isNullable: true }),
                    new TableColumn({ name: "face_token", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "skills", type: "json", isNullable: true }),
                    new TableColumn({ name: "rating", type: "decimal(3,2)", isNullable: false, default: 5.00 }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_c7da9c52c80593b9b657051923", columnNames: ["store_id"] }),
                    new TableIndex({ name: "IDX_cbc362d1c574464a63d3acc3ea", columnNames: ["phone"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "orders",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "order_no", type: "varchar(50)", isNullable: false }),
                    new TableColumn({ name: "customer_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "appointment_id", type: "int", isNullable: true }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "service_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "employee_id", type: "int", isNullable: true }),
                    new TableColumn({ name: "amount", type: "decimal(10,2)", isNullable: false }),
                    new TableColumn({ name: "actual_amount", type: "decimal(10,2)", isNullable: true }),
                    new TableColumn({ name: "pay_type", type: "varchar(20)", isNullable: true }),
                    new TableColumn({ name: "pay_status", type: "varchar(255)", isNullable: false, default: "'unpaid'" }),
                    new TableColumn({ name: "status", type: "varchar(255)", isNullable: false, default: "'pending'" }),
                    new TableColumn({ name: "pay_time", type: "datetime", isNullable: true }),
                    new TableColumn({ name: "confirm_time", type: "datetime", isNullable: true }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "IDX_035026a83bef9740d7ad05df38", columnNames: ["order_no"] }),
                    new TableIndex({ name: "IDX_772d0ce0473ac2ccfa26060dbe", columnNames: ["customer_id"] }),
                    new TableIndex({ name: "IDX_b7a7bb813431fc7cd73cced000", columnNames: ["store_id"] }),
                    new TableIndex({ name: "FK_3eae586e7046d592285b9529f69", columnNames: ["appointment_id"] }),
                    new TableIndex({ name: "FK_8612f4a8dd8f756d53d2856a09a", columnNames: ["service_id"] }),
                    new TableIndex({ name: "FK_f8a7411077c731327ca6e0b93b6", columnNames: ["employee_id"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "service_categories",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "name", type: "varchar(50)", isNullable: false }),
                    new TableColumn({ name: "icon", type: "varchar(100)", isNullable: true }),
                    new TableColumn({ name: "sort_order", type: "int", isNullable: false, default: 0 }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "services",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "category_id", type: "int", isNullable: false }),
                    new TableColumn({ name: "store_id", type: "int", isNullable: true }),
                    new TableColumn({ name: "name", type: "varchar(100)", isNullable: false }),
                    new TableColumn({ name: "price", type: "decimal(10,2)", isNullable: false }),
                    new TableColumn({ name: "duration", type: "int", isNullable: false }),
                    new TableColumn({ name: "description", type: "text", isNullable: true }),
                    new TableColumn({ name: "effects", type: "text", isNullable: true }),
                    new TableColumn({ name: "precautions", type: "text", isNullable: true }),
                    new TableColumn({ name: "images", type: "text", isNullable: true }),
                    new TableColumn({ name: "is_featured", type: "int", isNullable: false, default: 0 }),
                    new TableColumn({ name: "sort_order", type: "int", isNullable: false, default: 0 }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
                indices: [
                    new TableIndex({ name: "FK_9f3037c304b1544e37c339631d3", columnNames: ["store_id"] }),
                ],
            }),
        );
        await createTableIfNotExists(
            queryRunner,
            new Table({
                name: "stores",
                columns: [
                    new TableColumn({ name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: 'increment' }),
                    new TableColumn({ name: "name", type: "varchar(100)", isNullable: false }),
                    new TableColumn({ name: "address", type: "varchar(255)", isNullable: true }),
                    new TableColumn({ name: "phone", type: "varchar(20)", isNullable: true }),
                    new TableColumn({ name: "business_hours", type: "varchar(100)", isNullable: true }),
                    new TableColumn({ name: "latitude", type: "decimal(10,7)", isNullable: true }),
                    new TableColumn({ name: "longitude", type: "decimal(11,7)", isNullable: true }),
                    new TableColumn({ name: "images", type: "text", isNullable: true }),
                    new TableColumn({ name: "description", type: "text", isNullable: true }),
                    new TableColumn({ name: "status", type: "int", isNullable: false, default: 1 }),
                    new TableColumn({ name: "createdAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)" }),
                    new TableColumn({ name: "updatedAt", type: "datetime(6)", isNullable: false, default: "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" }),
                ],
            }),
        );

        // 第二阶段：表全部建好后统一加外键
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
        const foreignKeys: Array<{ table: string; fk: TableForeignKey }> = [
            { table: "appointments", fk: new TableForeignKey({ name: "FK_2a2088e8eaa8f28d8de2bdbb857", columnNames: ["service_id"], referencedTableName: "services", referencedColumnNames: ["id"] }) },
            { table: "appointments", fk: new TableForeignKey({ name: "FK_2be3c78815aba227af1c3e8e413", columnNames: ["customer_id"], referencedTableName: "customers", referencedColumnNames: ["id"] }) },
            { table: "appointments", fk: new TableForeignKey({ name: "FK_f4e3a19c74dac65a223368fa9a0", columnNames: ["employee_id"], referencedTableName: "employees", referencedColumnNames: ["id"] }) },
            { table: "appointments", fk: new TableForeignKey({ name: "FK_f895bc7345f67c61cf48c1bf418", columnNames: ["store_id"], referencedTableName: "stores", referencedColumnNames: ["id"] }) },
            { table: "attendances", fk: new TableForeignKey({ name: "FK_43dca8b4751d7449a38b583991c", columnNames: ["employee_id"], referencedTableName: "employees", referencedColumnNames: ["id"] }) },
            { table: "employees", fk: new TableForeignKey({ name: "FK_c7da9c52c80593b9b657051923a", columnNames: ["store_id"], referencedTableName: "stores", referencedColumnNames: ["id"] }) },
            { table: "orders", fk: new TableForeignKey({ name: "FK_3eae586e7046d592285b9529f69", columnNames: ["appointment_id"], referencedTableName: "appointments", referencedColumnNames: ["id"] }) },
            { table: "orders", fk: new TableForeignKey({ name: "FK_772d0ce0473ac2ccfa26060dbe9", columnNames: ["customer_id"], referencedTableName: "customers", referencedColumnNames: ["id"] }) },
            { table: "orders", fk: new TableForeignKey({ name: "FK_8612f4a8dd8f756d53d2856a09a", columnNames: ["service_id"], referencedTableName: "services", referencedColumnNames: ["id"] }) },
            { table: "orders", fk: new TableForeignKey({ name: "FK_b7a7bb813431fc7cd73cced0001", columnNames: ["store_id"], referencedTableName: "stores", referencedColumnNames: ["id"] }) },
            { table: "orders", fk: new TableForeignKey({ name: "FK_f8a7411077c731327ca6e0b93b6", columnNames: ["employee_id"], referencedTableName: "employees", referencedColumnNames: ["id"] }) },
            { table: "services", fk: new TableForeignKey({ name: "FK_9f3037c304b1544e37c339631d3", columnNames: ["store_id"], referencedTableName: "stores", referencedColumnNames: ["id"] }) },
        ];
        for (const { table, fk } of foreignKeys) {
            const exists = await queryRunner.query(
                `SELECT COUNT(*) AS cnt FROM information_schema.table_constraints
                 WHERE table_schema = DATABASE() AND constraint_name = ?`,
                [fk.name],
            );
            if (Number(exists?.[0]?.cnt ?? 0) > 0) continue;
            await queryRunner.createForeignKey(table, fk);
        }
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("stores", true);
        await queryRunner.dropTable("services", true);
        await queryRunner.dropTable("service_categories", true);
        await queryRunner.dropTable("orders", true);
        await queryRunner.dropTable("employees", true);
        await queryRunner.dropTable("customers", true);
        await queryRunner.dropTable("check_ins", true);
        await queryRunner.dropTable("attendances", true);
        await queryRunner.dropTable("appointments", true);
        await queryRunner.dropTable("admin_users", true);
    }
}
