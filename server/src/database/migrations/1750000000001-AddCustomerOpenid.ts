import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * 客户表补 openid 列（微信订阅消息下发需要）
 * 幂等：列已存在则跳过
 */
export class AddCustomerOpenid1750000000001 implements MigrationInterface {
  name = 'AddCustomerOpenid1750000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addColumnIfNotExists(queryRunner, 'customers', {
      name: 'openid',
      type: 'varchar(64)',
      isNullable: true,
    } as any);

    await queryRunner.query(
      `CREATE INDEX idx_customers_openid ON customers (openid)`,
    ).catch(() => {
      /* 索引已存在时忽略 */
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_customers_openid ON customers`).catch(() => {});
    await queryRunner.dropColumn('customers', 'openid').catch(() => {});
  }
}
